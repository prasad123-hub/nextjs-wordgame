'use client';

import { useState, useEffect } from 'react';
import { fetchLeaderboard } from '@/lib/api-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface LeaderboardEntry {
  _id: string;
  rank: number;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  stats: {
    totalGames: number;
    gamesWon: number;
    gamesLost: number;
    winRate: number;
    totalWrongGuesses: number;
    totalHintsUsed: number;
    averageWrongGuesses: number;
    averageHintsUsed: number;
    bestPerformance: number;
    efficiencyScore: number;
    overallScore: number;
  };
}

interface LeaderboardData {
  success: boolean;
  leaderboard: LeaderboardEntry[];
  totalPlayers: number;
}

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await fetchLeaderboard();
        setLeaderboardData(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load leaderboard'
        );
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 2:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
      case 3:
        return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20';
      default:
        return 'text-muted-foreground bg-muted/50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 150) return 'text-green-600';
    if (score >= 100) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Leaderboard
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!leaderboardData || leaderboardData.leaderboard.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Leaderboard Data</CardTitle>
            <CardDescription>
              There are not enough players with completed games to show a
              leaderboard. Complete at least 3 games to appear on the
              leaderboard!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/game">
              <Button className="w-full">Start Playing</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { leaderboard, totalPlayers } = leaderboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">🏆 Leaderboard</h1>
        <p className="text-muted-foreground mt-2">
          Top {totalPlayers} players with the best overall performance
        </p>
      </div>

      <Link href="/game">
        <Button className="mb-2">Back to Game</Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Top Players</CardTitle>
          <CardDescription>
            Ranked by overall score (win rate + total games + efficiency)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map(entry => (
              <div
                key={entry._id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${
                  entry.rank <= 3
                    ? 'bg-gradient-to-r from-primary/5 to-primary/10'
                    : ''
                }`}
              >
                {/* Rank and Player Info */}
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${getRankColor(entry.rank)}`}
                  >
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {entry.user.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.stats.totalGames} games • {entry.stats.winRate}%
                      win rate
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">
                      {entry.stats.gamesWon}W
                    </div>
                    <div className="text-muted-foreground">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">
                      {entry.stats.gamesLost}L
                    </div>
                    <div className="text-muted-foreground">Losses</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {entry.stats.averageWrongGuesses}
                    </div>
                    <div className="text-muted-foreground">Avg Wrong</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {entry.stats.averageHintsUsed}
                    </div>
                    <div className="text-muted-foreground">Avg Hints</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`font-bold text-lg ${getScoreColor(entry.stats.overallScore)}`}
                    >
                      {entry.stats.overallScore}
                    </div>
                    <div className="text-muted-foreground">Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
