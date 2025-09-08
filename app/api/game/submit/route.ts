import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/server/db/mongodb';
import Game from '@/server/models/game.model';
import User from '@/server/models/user.model';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const {
      word,
      wordLength,
      guessedLetters,
      gameStatus,
      wrongGuesses,
      hintsUsed,
    } = body;

    if (!word || typeof word !== 'string') {
      return NextResponse.json(
        { error: 'Word is required and must be a string' },
        { status: 400 }
      );
    }

    if (
      !wordLength ||
      typeof wordLength !== 'number' ||
      wordLength < 3 ||
      wordLength > 20
    ) {
      return NextResponse.json(
        {
          error:
            'Word length is required and must be a number between 3 and 20',
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(guessedLetters)) {
      return NextResponse.json(
        { error: 'Guessed letters must be an array' },
        { status: 400 }
      );
    }

    if (gameStatus && !['in_progress', 'won', 'lost'].includes(gameStatus)) {
      return NextResponse.json(
        { error: 'Game status must be in_progress, won, or lost' },
        { status: 400 }
      );
    }

    if (
      wrongGuesses !== undefined &&
      (typeof wrongGuesses !== 'number' || wrongGuesses < 0)
    ) {
      return NextResponse.json(
        { error: 'Wrong guesses must be a non-negative number' },
        { status: 400 }
      );
    }

    if (
      hintsUsed !== undefined &&
      (typeof hintsUsed !== 'number' || hintsUsed < 0)
    ) {
      return NextResponse.json(
        { error: 'Hints used must be a non-negative number' },
        { status: 400 }
      );
    }

    // Check if user has an active game (only if creating a new in_progress game)
    if (gameStatus === 'in_progress' || !gameStatus) {
      const activeGame = await Game.findOne({
        userId: user._id,
        gameStatus: 'in_progress',
      });

      if (activeGame) {
        return NextResponse.json(
          {
            error:
              'You already have an active game. Please finish it before starting a new one.',
            gameId: activeGame._id,
          },
          { status: 400 }
        );
      }
    }

    // Create a new game with data from request body
    const newGame = new Game({
      userId: user._id,
      word: word.toUpperCase(),
      wordLength: wordLength,
      guessedLetters: guessedLetters || [],
      gameStatus: gameStatus || 'in_progress',
      wrongGuesses: wrongGuesses || 0,
      hintsUsed: hintsUsed || 0,
    });

    // Save the game to database
    const savedGame = await newGame.save();

    // Return the created game data
    return NextResponse.json({
      success: true,
      data: {
        gameId: savedGame._id,
        wordLength: savedGame.wordLength,
        gameStatus: savedGame.gameStatus,
        guessedLetters: savedGame.guessedLetters,
        wrongGuesses: savedGame.wrongGuesses,
        hintsUsed: savedGame.hintsUsed,
        createdAt: savedGame.createdAt,
        updatedAt: savedGame.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating game:', error);

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

    // If JSON parsing fails
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
