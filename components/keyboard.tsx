import React from 'react';

interface KeyboardProps {
  guessedLetters: Set<string>;
  currentWord: string;
  onGuess: (letter: string) => void;
}

export function Keyboard({
  guessedLetters,
  currentWord,
  onGuess,
}: KeyboardProps) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const getLetterStatus = (letter: string) => {
    if (!guessedLetters.has(letter)) return 'unused';
    return currentWord.toUpperCase().includes(letter) ? 'correct' : 'incorrect';
  };

  const getLetterClass = (letter: string) => {
    const status = getLetterStatus(letter);
    const baseClass =
      'w-12 h-12 md:w-14 md:h-14 font-bold text-lg rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2';

    switch (status) {
      case 'correct':
        return `${baseClass} bg-green-500 text-white cursor-not-allowed opacity-80 scale-95 ring-green-300`;
      case 'incorrect':
        return `${baseClass} bg-red-500 text-white cursor-not-allowed opacity-80 scale-95 ring-red-300`;
      case 'unused':
        return `${baseClass} bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:scale-105 active:scale-95 cursor-pointer shadow-sm hover:shadow-md focus:ring-indigo-500`;
      default:
        return baseClass;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Choose a letter
      </h3>

      <div
        className="grid grid-cols-6 md:grid-cols-9 lg:grid-cols-13 gap-2 md:gap-3 max-w-4xl mx-auto"
        role="group"
        aria-label="Letter selection buttons"
      >
        {alphabet.map(letter => {
          const status = getLetterStatus(letter);
          const isDisabled = status !== 'unused';

          return (
            <button
              key={letter}
              onClick={() => !isDisabled && onGuess(letter)}
              disabled={isDisabled}
              className={getLetterClass(letter)}
              aria-label={`Letter ${letter}${
                status === 'correct'
                  ? ', correct guess'
                  : status === 'incorrect'
                    ? ', incorrect guess'
                    : ''
              }`}
              aria-pressed={status !== 'unused'}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Click a letter or use your keyboard to make a guess
        </p>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">Incorrect</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded"></div>
            <span className="text-gray-600">Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
