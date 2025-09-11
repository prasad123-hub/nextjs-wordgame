/**
 * Total Score = 180
 * 1. Win Rate (100 points)
 * 2. Total Games (50 points)
 * 3. Efficiency Score (30 points)
 *
 * Win Rate = 100 * (Games Won / Total Games)
 * Total Games Bonus = min(Total Games * 2, 50) - capped at 50
 * Efficiency Score = max(0, 30 - (Average Wrong Guesses + Average Hints Used * 0.5) * 2)
 * Total Score = Win Rate + Total Games Bonus + Efficiency Score
 *
 */

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

    // Get leaderboard data using aggregation pipeline
    const leaderboard = await Game.aggregate([
      // Match only completed games (won or lost)
      {
        $match: {
          gameStatus: { $in: ['won', 'lost'] },
        },
      },
      // Group by user and calculate statistics
      {
        $group: {
          _id: '$userId',
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
          totalWrongGuesses: { $sum: '$wrongGuesses' },
          totalHintsUsed: { $sum: '$hintsUsed' },
          averageWrongGuesses: { $avg: '$wrongGuesses' },
          averageHintsUsed: { $avg: '$hintsUsed' },
          // Calculate best performance (minimum wrong guesses in won games)
          bestPerformance: {
            $min: {
              $cond: [
                { $eq: ['$gameStatus', 'won'] },
                { $add: ['$wrongGuesses', { $multiply: ['$hintsUsed', 0.5] }] },
                null,
              ],
            },
          },
        },
      },
      // Calculate win rate and efficiency score
      {
        $addFields: {
          winRate: {
            $multiply: [{ $divide: ['$gamesWon', '$totalGames'] }, 100],
          },
          // Efficiency score: lower is better (fewer wrong guesses and hints)
          efficiencyScore: {
            $add: [
              '$averageWrongGuesses',
              { $multiply: ['$averageHintsUsed', 0.5] },
            ],
          },
          // Overall score: combines win rate, total games, and efficiency
          overallScore: {
            $add: [
              // Win rate component (0-100 points)
              { $multiply: [{ $divide: ['$gamesWon', '$totalGames'] }, 100] },
              // Total games component (0-50 points, capped at 50)
              { $min: [{ $multiply: ['$totalGames', 2] }, 50] },
              // Efficiency bonus (0-30 points, better efficiency = higher score)
              {
                $max: [
                  0,
                  {
                    $subtract: [
                      30,
                      {
                        $multiply: [
                          {
                            $add: [
                              '$averageWrongGuesses',
                              { $multiply: ['$averageHintsUsed', 0.5] },
                            ],
                          },
                          2,
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      // Filter out users with less than 3 completed games
      {
        $match: {
          totalGames: { $gte: 3 },
        },
      },
      // Sort by overall score (descending)
      {
        $sort: {
          overallScore: -1,
          totalGames: -1,
          winRate: -1,
        },
      },
      // Limit to top 5
      {
        $limit: 5,
      },
      // Lookup user information
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      // Unwind user info
      {
        $unwind: '$userInfo',
      },

      // Project final structure
      {
        $project: {
          _id: 1,
          user: {
            _id: '$userInfo._id',
            name: '$userInfo.name',
            email: '$userInfo.email',
          },
          stats: {
            totalGames: 1,
            gamesWon: 1,
            gamesLost: 1,
            winRate: { $round: ['$winRate', 2] },
            totalWrongGuesses: 1,
            totalHintsUsed: 1,
            averageWrongGuesses: { $round: ['$averageWrongGuesses', 2] },
            averageHintsUsed: { $round: ['$averageHintsUsed', 2] },
            bestPerformance: { $round: ['$bestPerformance', 2] },
            efficiencyScore: { $round: ['$efficiencyScore', 2] },
            overallScore: { $round: ['$overallScore', 2] },
          },
        },
      },
    ]);

    console.log('leaderboard', leaderboard);

    // Add rank to each entry
    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return NextResponse.json(
      {
        success: true,
        leaderboard: leaderboardWithRank,
        totalPlayers: leaderboardWithRank.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Leaderboard API error:', error);

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
