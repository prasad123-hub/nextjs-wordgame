'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { Gamepad2, Trophy, XCircle, RefreshCw } from 'lucide-react';
import { HangmanAnimation } from '@/components/hangman-animation';
import { WordConsole } from '@/components/word-console';
import { Keyboard } from '@/components/keyboard';
import { Hints, HintsRef } from '@/components/hints';
import { submitGame } from '@/lib/api-client';
import { toast } from 'sonner';

export type GameState = 'playing' | 'won' | 'lost';

export function GameConsole() {
  const [currentWord, setCurrentWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [gameState, setGameState] = useState<GameState>('playing');
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [hints, setHints] = useState<{ hint1: string; hint2: string }>({
    hint1: '',
    hint2: '',
  });
  const hintsRef = useRef<HintsRef>(null);

  const MAX_WRONG_GUESSES = 6;

  // Submit game results to server
  const submitGameResults = useCallback(async () => {
    if (!currentWord || gameState === 'playing') return;

    try {
      const hintsUsedCount = hintsRef.current?.getHintsUsed() || 0;

      await submitGame({
        word: currentWord,
        wordLength: currentWord.length,
        guessedLetters: Array.from(guessedLetters),
        gameStatus: gameState,
        wrongGuesses,
        hintsUsed: hintsUsedCount,
      });

      console.log('Game submitted successfully');
    } catch (error) {
      console.error('Error submitting game:', error);
      toast.error('Failed to save game results');
    }
  }, [currentWord, gameState, guessedLetters, wrongGuesses]);

  // Initialize new game
  const initNewGame = useCallback(async () => {
    try {
      const response = await fetch('/api/game/words', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch word');
      }

      setCurrentWord(result.data.word);
      setHints({
        hint1: result.data.hint1,
        hint2: result.data.hint2,
      });
      setGuessedLetters(new Set());
      setGameState('playing');
      setWrongGuesses(0);
      hintsRef.current?.resetHints();
    } catch (error) {
      console.error('Error initializing game:', error);
      toast.error('Error initializing game');
    }
  }, []);

  // Initialize game on mount
  useEffect(() => {
    initNewGame();
  }, [initNewGame]);

  // Check win/lose conditions
  useEffect(() => {
    if (currentWord) {
      const wordLetters = new Set(currentWord.toUpperCase());
      const correctGuesses = Array.from(guessedLetters).filter(letter =>
        wordLetters.has(letter)
      );

      // Check if won
      if (
        correctGuesses.length === wordLetters.size &&
        gameState === 'playing'
      ) {
        setGameState('won');
      }

      // Check if lost
      if (wrongGuesses >= MAX_WRONG_GUESSES && gameState === 'playing') {
        setGameState('lost');
      }
    }
  }, [currentWord, guessedLetters, wrongGuesses, gameState]);

  // Submit game when it ends
  useEffect(() => {
    if (gameState === 'won' || gameState === 'lost') {
      submitGameResults();
    }
  }, [gameState, submitGameResults]);

  // Handle letter guess
  const handleGuess = useCallback(
    (letter: string) => {
      if (gameState !== 'playing' || guessedLetters.has(letter)) return;

      const newGuessedLetters = new Set(guessedLetters);
      newGuessedLetters.add(letter);
      setGuessedLetters(newGuessedLetters);

      // Check if letter is in word
      if (!currentWord.toUpperCase().includes(letter)) {
        setWrongGuesses(prev => prev + 1);
      }
    },
    [currentWord, guessedLetters, gameState]
  );

  // Keyboard event handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const letter = event.key.toUpperCase();

      // Handle letter keys
      if (letter >= 'A' && letter <= 'Z') {
        event.preventDefault();
        handleGuess(letter);
      }

      // Handle Enter for new game
      if (event.key === 'Enter' && gameState !== 'playing') {
        event.preventDefault();
        initNewGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleGuess, gameState, initNewGame]);

  const incorrectLetters = Array.from(guessedLetters).filter(
    letter => !currentWord.toUpperCase().includes(letter)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Hangman Game
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Guess the word letter by letter. You have {MAX_WRONG_GUESSES} wrong
            guesses!
          </p>
        </header>

        {/* Hints Section */}
        <Hints ref={hintsRef} hints={hints} gameState={gameState} />

        {/* Main Game Area */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Hangman Drawing */}
            <div className="flex justify-center">
              <HangmanAnimation wrongGuesses={wrongGuesses} />
            </div>

            {/* Game Info */}
            <div className="space-y-6">
              {/* Word Display */}
              <WordConsole
                word={currentWord}
                guessedLetters={guessedLetters}
                gameState={gameState}
              />

              {/* Game Status */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Wrong guesses: {wrongGuesses}/{MAX_WRONG_GUESSES}
                  </span>
                  <span>Letters used: {guessedLetters.size}</span>
                </div>

                {incorrectLetters.length > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      Incorrect letters:
                    </p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {incorrectLetters.map(letter => (
                        <span
                          key={letter}
                          className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold text-sm"
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Game Over Messages */}
              {gameState === 'won' && (
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <Trophy className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-green-700 mb-2">
                    Congratulations!
                  </h2>
                  <p className="text-green-600">
                    You guessed the word correctly!
                  </p>
                </div>
              )}

              {gameState === 'lost' && (
                <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                  <XCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-red-700 mb-2">
                    Game Over!
                  </h2>
                  <p className="text-red-600">
                    The word was:{' '}
                    <span className="font-bold">{currentWord}</span>
                  </p>
                </div>
              )}

              {/* New Game Button */}
              {gameState !== 'playing' && (
                <div className="text-center">
                  <button
                    onClick={initNewGame}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                    aria-label="Start a new game"
                  >
                    <RefreshCw className="w-5 h-5" />
                    New Game
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Press Enter or click to start a new game
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alphabet Grid */}
        {gameState === 'playing' && (
          <Keyboard
            guessedLetters={guessedLetters}
            currentWord={currentWord}
            onGuess={handleGuess}
          />
        )}

        {/* Instructions */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>
            Click letters or use your keyboard to guess. Press Enter to start a
            new game when finished.
          </p>
        </div>
      </div>
    </div>
  );
}
