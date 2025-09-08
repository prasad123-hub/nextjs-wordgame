'use client';

import { useCallback, useState, useImperativeHandle, forwardRef } from 'react';

interface HintsProps {
  hints: {
    hint1: string;
    hint2: string;
  };
  gameState: 'playing' | 'won' | 'lost';
}

export interface HintsRef {
  resetHints: () => void;
  getHintsUsed: () => number;
}

export const Hints = forwardRef<HintsRef, HintsProps>(
  ({ hints, gameState }, ref) => {
    const [hintsUsed, setHintsUsed] = useState(0);
    const [displayedHints, setDisplayedHints] = useState<{
      hint1: boolean;
      hint2: boolean;
    }>({
      hint1: false,
      hint2: false,
    });

    // Handle hint button click
    const handleHintClick = useCallback(
      (hintType: 'hint1' | 'hint2') => {
        if (gameState !== 'playing' || displayedHints[hintType]) return;

        setDisplayedHints(prev => ({
          ...prev,
          [hintType]: true,
        }));
        setHintsUsed(prev => prev + 1);
      },
      [gameState, displayedHints]
    );

    // Reset hints function
    const resetHints = useCallback(() => {
      setHintsUsed(0);
      setDisplayedHints({
        hint1: false,
        hint2: false,
      });
    }, []);

    // Expose reset function and hints used getter to parent component
    useImperativeHandle(
      ref,
      () => ({
        resetHints,
        getHintsUsed: () => hintsUsed,
      }),
      [resetHints, hintsUsed]
    );

    return (
      <div className="text-center mb-8">
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => handleHintClick('hint1')}
            disabled={gameState !== 'playing' || displayedHints.hint1}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              displayedHints.hint1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : gameState !== 'playing'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            Hint 1
          </button>
          <button
            onClick={() => handleHintClick('hint2')}
            disabled={gameState !== 'playing' || displayedHints.hint2}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              displayedHints.hint2
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : gameState !== 'playing'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            Hint 2
          </button>
        </div>

        {/* Display hints */}
        <div className="space-y-2">
          {displayedHints.hint1 && (
            <p className="text-gray-700 text-lg font-medium">
              💡 Hint 1: {hints.hint1}
            </p>
          )}
          {displayedHints.hint2 && (
            <p className="text-gray-700 text-lg font-medium">
              💡 Hint 2: {hints.hint2}
            </p>
          )}
        </div>

        {/* Hints used counter */}
        <p className="text-gray-500 text-sm mt-2">Hints used: {hintsUsed}/2</p>
      </div>
    );
  }
);

Hints.displayName = 'Hints';
