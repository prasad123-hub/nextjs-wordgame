import { NextRequest, NextResponse } from 'next/server';
import User from '@/server/models/user.model';
import connectDB from '@/server/db/mongodb';

export const POST = async (request: NextRequest) => {
  try {
    await connectDB();

    // Get the refresh token from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (refreshToken) {
      // Find user with this refresh token and clear it
      await User.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: 1 } }
      );
    }

    // Create response
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );

    // Clear cookies with better EC2 compatibility
    const isProduction = process.env.NODE_ENV === 'production';
    const isSecure = isProduction && process.env.NODE_ENV !== 'development';
    
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: isProduction ? 'lax' : 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: isProduction ? 'lax' : 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
