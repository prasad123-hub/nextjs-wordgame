'use client';

import type React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DifficultyCardProps {
  title: string;
  description: string;
  difficulty: 'beginner' | 'challenger' | 'expert';
  onSelect: (difficulty: string) => void;
  className?: string;
}

export function DifficultyCard({
  title,
  description,
  difficulty,
  onSelect,
  className,
}: DifficultyCardProps) {
  const getDifficultyStyles = () => {
    switch (difficulty) {
      case 'beginner':
        return 'hover:shadow-green-200 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50';
      case 'challenger':
        return 'hover:shadow-amber-200 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50';
      case 'expert':
        return 'hover:shadow-red-200 border-red-200 bg-gradient-to-br from-red-50 to-rose-50';
      default:
        return '';
    }
  };

  const HangmanIllustration = ({
    stage,
  }: {
    stage: 'beginner' | 'challenger' | 'expert';
  }) => {
    const getStageElements = () => {
      switch (stage) {
        case 'beginner':
          return (
            <svg viewBox="0 0 120 140" className="w-20 h-24 mx-auto">
              {/* Base and pole */}
              <rect x="10" y="130" width="40" height="8" fill="#8B4513" />
              <rect x="28" y="20" width="4" height="118" fill="#8B4513" />
              <rect x="28" y="20" width="30" height="4" fill="#8B4513" />
              <rect x="54" y="20" width="4" height="12" fill="#8B4513" />
              {/* Happy sun */}
              <circle cx="90" cy="45" r="12" fill="#FFD700" />
              <path
                d="M90 35 L90 30 M90 60 L90 55 M100 45 L105 45 M75 45 L80 45 M97 38 L100 35 M83 38 L80 35 M97 52 L100 55 M83 52 L80 55"
                stroke="#FFD700"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="87" cy="42" r="1.5" fill="#FF6B35" />
              <circle cx="93" cy="42" r="1.5" fill="#FF6B35" />
              <path
                d="M85 48 Q90 52 95 48"
                stroke="#FF6B35"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          );
        case 'challenger':
          return (
            <svg viewBox="0 0 120 140" className="w-20 h-24 mx-auto">
              {/* Base and pole */}
              <rect x="10" y="130" width="40" height="8" fill="#8B4513" />
              <rect x="28" y="20" width="4" height="118" fill="#8B4513" />
              <rect x="28" y="20" width="30" height="4" fill="#8B4513" />
              <rect x="54" y="20" width="4" height="12" fill="#8B4513" />
              {/* Head only */}
              <circle
                cx="58"
                cy="42"
                r="8"
                fill="#FFE4B5"
                stroke="#8B4513"
                strokeWidth="2"
              />
              <circle cx="55" cy="40" r="1" fill="#000" />
              <circle cx="61" cy="40" r="1" fill="#000" />
              <path
                d="M55 45 Q58 47 61 45"
                stroke="#000"
                strokeWidth="1"
                fill="none"
              />
              {/* Clouds */}
              <ellipse cx="85" cy="35" rx="8" ry="5" fill="#E6E6FA" />
              <ellipse cx="92" cy="38" rx="6" ry="4" fill="#E6E6FA" />
              <ellipse cx="88" cy="42" rx="7" ry="4" fill="#E6E6FA" />
            </svg>
          );
        case 'expert':
          return (
            <svg viewBox="0 0 120 140" className="w-20 h-24 mx-auto">
              {/* Base and pole */}
              <rect x="10" y="130" width="40" height="8" fill="#8B4513" />
              <rect x="28" y="20" width="4" height="118" fill="#8B4513" />
              <rect x="28" y="20" width="30" height="4" fill="#8B4513" />
              <rect x="54" y="20" width="4" height="12" fill="#8B4513" />
              {/* Complete figure */}
              <circle
                cx="58"
                cy="42"
                r="8"
                fill="#FFE4B5"
                stroke="#8B4513"
                strokeWidth="2"
              />
              <path
                d="M50 40 L54 44 M62 40 L66 44"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <ellipse cx="58" cy="46" rx="3" ry="2" fill="#000" />
              <rect x="56" y="50" width="4" height="25" fill="#4169E1" />
              <rect x="54" y="55" width="8" height="3" fill="#4169E1" />
              <path
                d="M56 75 L52 85 M60 75 L64 85"
                stroke="#8B4513"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M54 60 L48 70 M60 60 L66 70"
                stroke="#FFE4B5"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Storm clouds */}
              <ellipse cx="85" cy="30" rx="10" ry="6" fill="#696969" />
              <ellipse cx="95" cy="35" rx="8" ry="5" fill="#696969" />
              <ellipse cx="88" cy="40" rx="9" ry="5" fill="#696969" />
              <path
                d="M85 45 L87 50 L83 48 L85 53"
                stroke="#FFD700"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          );
      }
    };

    return <div className="mb-4">{getStageElements()}</div>;
  };

  const WordLengthIndicator = ({
    difficulty,
  }: {
    difficulty: 'beginner' | 'challenger' | 'expert';
  }) => {
    const getWordSlots = () => {
      switch (difficulty) {
        case 'beginner':
          return Array(3).fill(0);
        case 'challenger':
          return Array(4).fill(0);
        case 'expert':
          return Array(5).fill(0);
      }
    };

    return (
      <div className="flex justify-center gap-1 mb-4">
        {getWordSlots().map((_, index) => (
          <div
            key={index}
            className="w-3 h-0.5 bg-current opacity-40 rounded-full"
          />
        ))}
      </div>
    );
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 relative overflow-hidden',
        getDifficultyStyles(),
        className
      )}
      onClick={() => onSelect(difficulty)}
    >
      <div className="absolute top-2 right-2 opacity-20">
        <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center text-xs font-bold">
          {difficulty === 'beginner'
            ? '1'
            : difficulty === 'challenger'
              ? '2'
              : '3'}
        </div>
      </div>

      <CardHeader className="text-center pb-4">
        <HangmanIllustration stage={difficulty} />
        <CardTitle className="text-2xl font-bold text-card-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-balance text-sm my-2">
          {description}
        </CardDescription>
        <WordLengthIndicator difficulty={difficulty} />
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          className={cn(
            'w-full font-semibold transition-all duration-200 hover:scale-105',
            difficulty === 'beginner' &&
              'bg-green-500 hover:bg-green-600 text-white',
            difficulty === 'challenger' &&
              'bg-amber-500 hover:bg-amber-600 text-white',
            difficulty === 'expert' && 'bg-red-500 hover:bg-red-600 text-white'
          )}
          size="lg"
        >
          Start {title} Game
        </Button>
      </CardContent>
    </Card>
  );
}
