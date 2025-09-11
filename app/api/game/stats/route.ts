import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/server/db/mongodb';
import Game from '@/server/models/game.model';
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

    // Get user's game statistics
    const stats = await Game.aggregate([
      {
        $match: {
          userId: user._id,
        },
      },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          gamesWon: {
            $sum: {
              $cond: [{ $eq: ['$gameStatus', 'won'] }, 1, 0],
            },
          },
          gamesLost: {
            $sum: {
              $cond: [{ $eq: ['$gameStatus', 'lost'] }, 1, 0],
            },
          },
          gamesInProgress: {
            $sum: {
              $cond: [{ $eq: ['$gameStatus', 'in_progress'] }, 1, 0],
            },
          },
          totalWrongGuesses: { $sum: '$wrongGuesses' },
          totalHintsUsed: { $sum: '$hintsUsed' },
          averageWrongGuesses: { $avg: '$wrongGuesses' },
          averageHintsUsed: { $avg: '$hintsUsed' },
          bestGame: {
            $min: {
              $cond: [{ $eq: ['$gameStatus', 'won'] }, '$wrongGuesses', null],
            },
          },
          worstGame: {
            $max: {
              $cond: [{ $eq: ['$gameStatus', 'lost'] }, '$wrongGuesses', null],
            },
          },
        },
      },
    ]);

    // Get recent games (last 10)
    const recentGames = await Game.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('word wordLength gameStatus wrongGuesses hintsUsed createdAt')
      .lean();

    // Get games by word length distribution
    const gamesByWordLength = await Game.aggregate([
      {
        $match: {
          userId: user._id,
        },
      },
      {
        $group: {
          _id: '$wordLength',
          count: { $sum: 1 },
          won: {
            $sum: {
              $cond: [{ $eq: ['$gameStatus', 'won'] }, 1, 0],
            },
          },
          lost: {
            $sum: {
              $cond: [{ $eq: ['$gameStatus', 'lost'] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get games by status distribution for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStats = await Game.aggregate([
      {
        $match: {
          userId: user._id,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$gameStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate win rate
    const totalCompletedGames = stats[0]?.gamesWon + stats[0]?.gamesLost || 0;
    const winRate =
      totalCompletedGames > 0
        ? ((stats[0]?.gamesWon || 0) / totalCompletedGames) * 100
        : 0;

    console.log('stats', stats);
    console.log('recentGames', recentGames);
    console.log('gamesByWordLength', gamesByWordLength);
    console.log('recentStats', recentStats);

    // Prepare response data
    const responseData = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      stats: {
        totalGames: stats[0]?.totalGames || 0,
        gamesWon: stats[0]?.gamesWon || 0,
        gamesLost: stats[0]?.gamesLost || 0,
        gamesInProgress: stats[0]?.gamesInProgress || 0,
        winRate: Math.round(winRate * 100) / 100, // Round to 2 decimal places
        totalWrongGuesses: stats[0]?.totalWrongGuesses || 0,
        totalHintsUsed: stats[0]?.totalHintsUsed || 0,
        averageWrongGuesses:
          Math.round((stats[0]?.averageWrongGuesses || 0) * 100) / 100,
        averageHintsUsed:
          Math.round((stats[0]?.averageHintsUsed || 0) * 100) / 100,
        bestGame: stats[0]?.bestGame || null,
        worstGame: stats[0]?.worstGame || null,
      },
      recentGames: recentGames.map(game => ({
        word: game.word,
        wordLength: game.wordLength,
        gameStatus: game.gameStatus,
        wrongGuesses: game.wrongGuesses,
        hintsUsed: game.hintsUsed,
        createdAt: game.createdAt,
      })),
      gamesByWordLength: gamesByWordLength.map(item => ({
        wordLength: item._id,
        totalGames: item.count,
        gamesWon: item.won,
        gamesLost: item.lost,
        winRate:
          item.count > 0
            ? Math.round((item.won / item.count) * 100 * 100) / 100
            : 0,
      })),
      recentActivity: {
        last30Days: recentStats.reduce(
          (acc, item) => {
            acc[item._id] = item.count;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Stats API error:', error);

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
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
