import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/server/db/mongodb';
import Word from '@/server/models/word.model';
import User from '@/server/models/user.model';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get the access token from cookies
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      );
    }

    // Verify the access token
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new Error('ACCESS_TOKEN_SECRET is not defined');
    }

    const decoded = jwt.verify(accessToken, secret) as { _id: string };

    // Find the user to verify they exist
    const user = await User.findById(decoded._id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Get total count of words in the database
    const totalWords = await Word.countDocuments();

    if (totalWords === 0) {
      return NextResponse.json(
        { error: 'No words found in database' },
        { status: 404 }
      );
    }

    // Generate a random index
    const randomIndex = Math.floor(Math.random() * totalWords);

    // Fetch a random word using skip and limit
    const randomWord = await Word.findOne().skip(randomIndex);

    if (!randomWord) {
      return NextResponse.json(
        { error: 'Failed to fetch random word' },
        { status: 500 }
      );
    }

    // Return the random word with hints
    return NextResponse.json({
      success: true,
      data: {
        word: randomWord.word,
        hint1: randomWord.hint1,
        hint2: randomWord.hint2,
      },
    });
  } catch (error) {
    console.error('Error fetching random word:', error);

    // If token is invalid or expired, return 401
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
