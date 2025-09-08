import { NextRequest, NextResponse } from 'next/server';
import User from '@/server/models/user.model';
import connectDB from '@/server/db/mongodb';
import { getClearCookieConfig } from '@/lib/cookie-utils';

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

    // Clear cookies using centralized configuration
    const clearConfig = getClearCookieConfig();
    response.cookies.set('accessToken', '', clearConfig);
    response.cookies.set('refreshToken', '', clearConfig);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
