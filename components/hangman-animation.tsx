import React from 'react';

interface HangmanDrawingProps {
  wrongGuesses: number;
}

export function HangmanAnimation({ wrongGuesses }: HangmanDrawingProps) {
  const parts = [
    {
      id: 'head',
      element: (
        <circle
          cx="150"
          cy="80"
          r="20"
          fill="none"
          stroke="#374151"
          strokeWidth="3"
        />
      ),
    },
    {
      id: 'body',
      element: (
        <line
          x1="150"
          y1="100"
          x2="150"
          y2="180"
          stroke="#374151"
          strokeWidth="3"
        />
      ),
    },
    {
      id: 'leftArm',
      element: (
        <line
          x1="150"
          y1="130"
          x2="120"
          y2="150"
          stroke="#374151"
          strokeWidth="3"
        />
      ),
    },
    {
      id: 'rightArm',
      element: (
        <line
          x1="150"
          y1="130"
          x2="180"
          y2="150"
          stroke="#374151"
          strokeWidth="3"
        />
      ),
    },
    {
      id: 'leftLeg',
      element: (
        <line
          x1="150"
          y1="180"
          x2="120"
          y2="210"
          stroke="#374151"
          strokeWidth="3"
        />
      ),
    },
    {
      id: 'rightLeg',
      element: (
        <line
          x1="150"
          y1="180"
          x2="180"
          y2="210"
          stroke="#374151"
          strokeWidth="3"
        />
      ),
    },
  ];

  return (
    <div className="relative">
      <svg
        width="300"
        height="250"
        viewBox="0 0 300 250"
        className="w-full max-w-sm mx-auto"
        role="img"
        aria-label={`Hangman drawing showing ${wrongGuesses} wrong guesses`}
      >
        {/* Gallows structure - always visible */}
        <g className="opacity-70">
          {/* Base */}
          <line
            x1="10"
            y1="230"
            x2="100"
            y2="230"
            stroke="#8B5CF6"
            strokeWidth="4"
          />
          {/* Pole */}
          <line
            x1="30"
            y1="230"
            x2="30"
            y2="20"
            stroke="#8B5CF6"
            strokeWidth="4"
          />
          {/* Top beam */}
          <line
            x1="30"
            y1="20"
            x2="150"
            y2="20"
            stroke="#8B5CF6"
            strokeWidth="4"
          />
          {/* Noose */}
          <line
            x1="150"
            y1="20"
            x2="150"
            y2="60"
            stroke="#8B5CF6"
            strokeWidth="3"
          />
          {/* Support beam */}
          <line
            x1="30"
            y1="40"
            x2="80"
            y2="20"
            stroke="#8B5CF6"
            strokeWidth="3"
          />
        </g>

        {/* Hangman parts - appear based on wrong guesses */}
        {parts.slice(0, wrongGuesses).map((part, index) => (
          <g
            key={part.id}
            className="animate-fade-in"
            style={{
              animation: `fadeIn 0.5s ease-in-out ${index * 0.1}s both`,
            }}
          >
            {part.element}
          </g>
        ))}

        {/* Face details for completed hangman */}
        {wrongGuesses >= 6 && (
          <g
            className="animate-fade-in"
            style={{ animation: 'fadeIn 0.5s ease-in-out 0.6s both' }}
          >
            {/* X eyes */}
            <line
              x1="142"
              y1="72"
              x2="146"
              y2="76"
              stroke="#EF4444"
              strokeWidth="2"
            />
            <line
              x1="146"
              y1="72"
              x2="142"
              y2="76"
              stroke="#EF4444"
              strokeWidth="2"
            />
            <line
              x1="154"
              y1="72"
              x2="158"
              y2="76"
              stroke="#EF4444"
              strokeWidth="2"
            />
            <line
              x1="158"
              y1="72"
              x2="154"
              y2="76"
              stroke="#EF4444"
              strokeWidth="2"
            />
            {/* Frown */}
            <path
              d="M 142 88 Q 150 94 158 88"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Wrong guesses counter */}
      <div className="text-center mt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
          <div className="flex gap-1">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i < wrongGuesses ? 'bg-red-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {wrongGuesses}/6
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
