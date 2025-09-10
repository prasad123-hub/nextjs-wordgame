import { NextRequest, NextResponse } from 'next/server';
import User from '@/server/models/user.model';
import connectDB from '@/server/db/mongodb';
import { getCookieConfig } from '@/lib/cookie-utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { name }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'name';
      return NextResponse.json(
        { error: `User with this ${field} already exists` },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Create response with httpOnly cookies
    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );

    // Set cookies using centralized configuration
    const accessTokenConfig = getCookieConfig(15 * 60 * 1000); // 15 minutes
    const refreshTokenConfig = getCookieConfig(7 * 24 * 60 * 60 * 1000); // 7 days

    response.cookies.set('accessToken', accessToken, accessTokenConfig);
    response.cookies.set('refreshToken', refreshToken, refreshTokenConfig);

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);

    // Handle mongoose validation errors
    if (error?.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error?.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
