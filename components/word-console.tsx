import React from 'react';
import { GameState } from './game-console';

interface WordDisplayProps {
  word: string;
  guessedLetters: Set<string>;
  gameState: GameState;
}

export function WordConsole({
  word,
  guessedLetters,
  gameState,
}: WordDisplayProps) {
  const letters = word.toUpperCase().split('');

  const getLetterClass = (letter: string, revealed: boolean) => {
    const baseClass =
      'w-12 h-12 md:w-14 md:h-14 border-b-4 flex items-center justify-center font-bold text-xl md:text-2xl transition-all duration-300 transform';

    if (revealed) {
      return `${baseClass} border-green-500 text-green-700 bg-green-50 scale-105`;
    }

    if (gameState === 'lost') {
      return `${baseClass} border-red-500 text-red-600 bg-red-50`;
    }

    return `${baseClass} border-gray-400 text-transparent hover:border-indigo-400`;
  };

  return (
    <div className="text-center space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        {gameState === 'playing' && 'Guess the word:'}
        {gameState === 'won' && 'You got it!'}
        {gameState === 'lost' && 'The word was:'}
      </h2>

      <div
        className="flex flex-wrap justify-center gap-2 md:gap-3"
        role="region"
        aria-label="Word to guess"
      >
        {letters.map((letter, index) => {
          const isRevealed = guessedLetters.has(letter) || gameState === 'lost';

          return (
            <div
              key={`${letter}-${index}`}
              className={getLetterClass(letter, isRevealed)}
              aria-label={
                isRevealed ? `Letter ${letter}` : `Hidden letter ${index + 1}`
              }
            >
              <span
                className={`transition-all duration-500 ${
                  isRevealed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
              >
                {letter}
              </span>
            </div>
          );
        })}
      </div>

      {/* Word length hint */}
      <p className="text-sm text-gray-500">
        {letters.length} letter{letters.length !== 1 ? 's' : ''}
      </p>

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${
                (Array.from(guessedLetters).filter(letter =>
                  word.toUpperCase().includes(letter)
                ).length /
                  new Set(word.toUpperCase()).size) *
                100
              }%`,
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Progress:{' '}
          {
            Array.from(guessedLetters).filter(letter =>
              word.toUpperCase().includes(letter)
            ).length
          }{' '}
          / {new Set(word.toUpperCase()).size} letters found
        </p>
      </div>
    </div>
  );
}
