'use client';

import { DifficultyCard } from '@/components/difficulty-card';

export default function Game() {
  const handleDifficultySelect = (difficulty: string) => {
    console.log(`Selected difficulty: ${difficulty}`);
    // Add your game logic here
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-6">
            <svg viewBox="0 0 200 80" className="w-32 h-12 mx-auto mb-4">
              <rect x="20" y="70" width="30" height="6" fill="#8B4513" />
              <rect x="33" y="15" width="3" height="61" fill="#8B4513" />
              <rect x="33" y="15" width="25" height="3" fill="#8B4513" />
              <rect x="55" y="15" width="3" height="10" fill="#8B4513" />
              <text
                x="80"
                y="35"
                fontSize="24"
                fontWeight="bold"
                fill="#1f2937"
                fontFamily="serif"
              >
                HANGMAN
              </text>
              <text
                x="80"
                y="55"
                fontSize="12"
                fill="#6b7280"
                fontFamily="sans-serif"
              >
                Word Game
              </text>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance font-sans">
            Choose Your Challenge
          </h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Test your vocabulary skills! Each difficulty offers a unique
            challenge with different word lengths and complexity levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <DifficultyCard
            title="Beginner"
            description="Perfect for new players! Simple 3 letter words with everyday vocabulary. Great for learning the ropes!"
            difficulty="beginner"
            onSelect={handleDifficultySelect}
          />

          <DifficultyCard
            title="Challenger"
            description="Ready for more? 4 letter words with moderate complexity. A perfect balance of fun and challenge!"
            difficulty="challenger"
            onSelect={handleDifficultySelect}
          />

          <DifficultyCard
            title="Expert"
            description="For word masters only! Complex 5 letter words and advanced vocabulary. Do you dare?"
            difficulty="expert"
            onSelect={handleDifficultySelect}
          />
        </div>
      </div>
    </main>
  );
}
