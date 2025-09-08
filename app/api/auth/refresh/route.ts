import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/server/models/user.model';
import connectDB from '@/server/db/mongodb';

export const POST = async (request: NextRequest) => {
  try {
    await connectDB();

    // Get the refresh token from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found' },
        { status: 401 }
      );
    }

    // Verify the refresh token
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshSecret) {
      throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }

    const decoded = jwt.verify(refreshToken, refreshSecret) as { _id: string };

    // Find the user with this refresh token
    const user = await User.findOne({
      _id: decoded._id,
      refreshToken,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = user.generateAccessToken();

    // Create response
    const response = NextResponse.json(
      {
        message: 'Token refreshed successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );

    // Set new access token cookie
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);

    // If refresh token is invalid or expired, return 401
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      // Clear invalid refresh token from database
      const refreshToken = request.cookies.get('refreshToken')?.value;
      if (refreshToken) {
        await User.findOneAndUpdate(
          { refreshToken },
          { $unset: { refreshToken: 1 } }
        );
      }

      // Clear cookies
      const response = NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );

      response.cookies.set('accessToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
      });

      response.cookies.set('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
