'use client';

import { useState, useEffect } from 'react';
import { fetchUserStats } from '@/lib/api-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface GameStats {
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  gamesInProgress: number;
  winRate: number;
  totalWrongGuesses: number;
  totalHintsUsed: number;
  averageWrongGuesses: number;
  averageHintsUsed: number;
  bestGame: number | null;
  worstGame: number | null;
}

interface RecentGame {
  word: string;
  wordLength: number;
  gameStatus: 'won' | 'lost' | 'in_progress';
  wrongGuesses: number;
  hintsUsed: number;
  createdAt: string;
}

interface WordLengthStats {
  wordLength: number;
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
}

interface StatsData {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  stats: GameStats;
  recentGames: RecentGame[];
  gamesByWordLength: WordLengthStats[];
  recentActivity: {
    last30Days: Record<string, number>;
  };
}

export default function StatsDisplay() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchUserStats();
        setStatsData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'lost':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your stats...</p>
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
              Error Loading Stats
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

  if (!statsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No stats data available</p>
      </div>
    );
  }

  const { user, stats, recentGames, gamesByWordLength, recentActivity } =
    statsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Game Statistics</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user.name}! Here&apos;s how you&apos;re doing.
        </p>
      </div>

      <Link href="/game">
        <Button className="mb-2">Back to Game</Button>
      </Link>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGames}</div>
            <p className="text-xs text-muted-foreground">
              {stats.gamesInProgress > 0 &&
                `${stats.gamesInProgress} in progress`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.winRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.gamesWon} wins out of {stats.gamesWon + stats.gamesLost}{' '}
              completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Game</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.bestGame !== null ? stats.bestGame : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Fewest wrong guesses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Wrong Guesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageWrongGuesses}
            </div>
            <p className="text-xs text-muted-foreground">Per game</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Your game performance breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Games Won</span>
              <span className="text-lg font-bold text-green-600">
                {stats.gamesWon}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Games Lost</span>
              <span className="text-lg font-bold text-red-600">
                {stats.gamesLost}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Wrong Guesses</span>
              <span className="text-lg font-bold">
                {stats.totalWrongGuesses}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Hints Used</span>
              <span className="text-lg font-bold">{stats.totalHintsUsed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Hints Used</span>
              <span className="text-lg font-bold">
                {stats.averageHintsUsed}
              </span>
            </div>
            {stats.worstGame !== null && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Worst Game</span>
                <span className="text-lg font-bold text-red-600">
                  {stats.worstGame}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Word Length Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Word Length</CardTitle>
            <CardDescription>
              How you perform with different word lengths
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gamesByWordLength.length > 0 ? (
                gamesByWordLength.map(item => (
                  <div
                    key={item.wordLength}
                    className="flex justify-between items-center p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">
                        {item.wordLength} letters
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.gamesWon}W / {item.gamesLost}L
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.winRate}%</div>
                      <div className="text-xs text-muted-foreground">
                        {item.totalGames} games
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No word length data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Games */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Games</CardTitle>
          <CardDescription>Your last 10 games</CardDescription>
        </CardHeader>
        <CardContent>
          {recentGames.length > 0 ? (
            <div className="space-y-2">
              {recentGames.map((game, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center space-x-4">
                    <div className="font-mono text-sm">{game.word}</div>
                    <div className="text-sm text-muted-foreground">
                      {game.wordLength} letters
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {game.wrongGuesses} wrong, {game.hintsUsed} hints
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(game.gameStatus)}`}
                    >
                      {game.gameStatus.replace('_', ' ')}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(game.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No recent games found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity (Last 30 Days) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 30 Days)</CardTitle>
          <CardDescription>
            Your game activity over the past month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(recentActivity.last30Days).map(
              ([status, count]) => (
                <div
                  key={status}
                  className="text-center p-4 rounded-lg bg-muted/50"
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {status.replace('_', ' ')} games
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
