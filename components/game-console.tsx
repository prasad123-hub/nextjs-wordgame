'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { Gamepad2, Trophy, XCircle, RefreshCw } from 'lucide-react';
import { HangmanAnimation } from '@/components/hangman-animation';
import { WordConsole } from '@/components/word-console';
import { Keyboard } from '@/components/keyboard';
import { Hints, HintsRef } from '@/components/hints';
import { submitGame, apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { toast } from 'sonner';

// Game states: playing, won, or lost
export type GameState = 'playing' | 'won' | 'lost';

export function GameConsole() {
  // 🎮 GAME DATA - All the information we need to play the game
  const [currentWord, setCurrentWord] = useState(''); // The word we're trying to guess
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set()); // Letters the player has guessed
  const [gameState, setGameState] = useState<GameState>('playing'); // Are we playing, won, or lost?
  const [wrongGuesses, setWrongGuesses] = useState(0); // How many wrong guesses so far
  const [hints, setHints] = useState<{ hint1: string; hint2: string }>({
    hint1: '',
    hint2: '',
  }); // Helpful hints for the player
  const hintsRef = useRef<HintsRef>(null);

  // 🔐 AUTHENTICATION - Check if player is logged in
  const { isAuthenticated, isLoading } = useAuthStore();

  // 🎯 GAME RULES - Maximum wrong guesses allowed
  const MAX_WRONG_GUESSES = 6;

  // 📊 SAVE GAME RESULTS - Send the game results to the server
  const saveGameResults = useCallback(async () => {
    // Only save if the game is finished (won or lost)
    if (!currentWord || gameState === 'playing') return;

    try {
      // Count how many hints the player used
      const hintsUsedCount = hintsRef.current?.getHintsUsed() || 0;

      // Send game data to the server
      await submitGame({
        word: currentWord,
        wordLength: currentWord.length,
        guessedLetters: Array.from(guessedLetters),
        gameStatus: gameState,
        wrongGuesses,
        hintsUsed: hintsUsedCount,
      });

      console.log('✅ Game saved successfully!');
    } catch (error) {
      console.error('❌ Error saving game:', error);
      toast.error('Failed to save game results');
    }
  }, [currentWord, gameState, guessedLetters, wrongGuesses]);

  // 🎲 START NEW GAME - Get a new word and reset everything
  const startNewGame = useCallback(async () => {
    try {
      console.log('🎮 Starting new game...');

      // Ask the server for a new word and hints
      const response = await apiClient('/api/game/words', {
        method: 'GET',
      });

      // Check if we got the word successfully
      if (!response.ok) {
        throw new Error(`Couldn't get a new word! Status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get a new word');
      }

      // Set up the new game with fresh data
      setCurrentWord(result.data.word);
      setHints({
        hint1: result.data.hint1,
        hint2: result.data.hint2,
      });
      setGuessedLetters(new Set()); // Clear all guessed letters
      setGameState('playing'); // Set game to playing mode
      setWrongGuesses(0); // Reset wrong guess counter
      hintsRef.current?.resetHints(); // Reset hints

      console.log('✅ New game started!');
    } catch (error) {
      console.error('❌ Error starting new game:', error);
      toast.error('Error starting new game');
    }
  }, []);

  // 🚀 START GAME WHEN PLAYER IS READY - Wait for login, then start the game
  useEffect(() => {
    // Only start the game if the player is logged in and ready
    if (isAuthenticated && !isLoading) {
      console.log('🎮 Player is ready! Starting game...');
      startNewGame();
    } else {
      console.log('⏳ Waiting for player to log in...');
    }
  }, [startNewGame, isAuthenticated, isLoading]);

  // 🏆 CHECK IF PLAYER WON OR LOST - Check the game status after each guess
  useEffect(() => {
    if (!currentWord) return; // No word yet, nothing to check

    const wordLetters = new Set(currentWord.toUpperCase());
    const correctGuesses = Array.from(guessedLetters).filter(letter =>
      wordLetters.has(letter)
    );

    // 🎉 CHECK FOR WIN - Did they guess all the letters?
    if (correctGuesses.length === wordLetters.size && gameState === 'playing') {
      console.log('🎉 Player won!');
      setGameState('won');
    }

    // 💀 CHECK FOR LOSS - Did they make too many wrong guesses?
    if (wrongGuesses >= MAX_WRONG_GUESSES && gameState === 'playing') {
      console.log('💀 Player lost!');
      setGameState('lost');
    }
  }, [currentWord, guessedLetters, wrongGuesses, gameState]);

  // 💾 SAVE GAME WHEN IT ENDS - Save the results when player wins or loses
  useEffect(() => {
    if (gameState === 'won' || gameState === 'lost') {
      console.log('💾 Game ended, saving results...');
      saveGameResults();
    }
  }, [gameState, saveGameResults]);

  // 🔤 HANDLE LETTER GUESS - When player clicks a letter
  const handleLetterGuess = useCallback(
    (letter: string) => {
      // Don't guess if game is over or letter already guessed
      if (gameState !== 'playing' || guessedLetters.has(letter)) return;

      // Add the letter to our guessed letters
      const newGuessedLetters = new Set(guessedLetters);
      newGuessedLetters.add(letter);
      setGuessedLetters(newGuessedLetters);

      // Check if the letter is in the word
      if (!currentWord.toUpperCase().includes(letter)) {
        console.log(`❌ Wrong guess: ${letter}`);
        setWrongGuesses(prev => prev + 1);
      } else {
        console.log(`✅ Correct guess: ${letter}`);
      }
    },
    [currentWord, guessedLetters, gameState]
  );

  // ⌨️ KEYBOARD SUPPORT - Let players use their keyboard to play
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const letter = event.key.toUpperCase();

      // If they press a letter key, guess that letter
      if (letter >= 'A' && letter <= 'Z') {
        event.preventDefault();
        handleLetterGuess(letter);
      }

      // If they press Enter and game is over, start a new game
      if (event.key === 'Enter' && gameState !== 'playing') {
        event.preventDefault();
        startNewGame();
      }
    };

    // Listen for keyboard events
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleLetterGuess, gameState, startNewGame]);

  // 🚫 WRONG LETTERS - Letters that are not in the word
  const wrongLetters = Array.from(guessedLetters).filter(
    letter => !currentWord.toUpperCase().includes(letter)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 🎮 GAME HEADER */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Hangman Game
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            🧠 Guess the word letter by letter! You have {MAX_WRONG_GUESSES}{' '}
            wrong guesses!
          </p>
        </header>

        {/* 💡 HINTS SECTION - Helpful clues for the player */}
        <Hints ref={hintsRef} hints={hints} gameState={gameState} />

        {/* 🎮 MAIN GAME AREA */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* 🎨 HANGMAN DRAWING - Shows how many wrong guesses */}
            <div className="flex justify-center">
              <HangmanAnimation wrongGuesses={wrongGuesses} />
            </div>

            {/* 📊 GAME INFORMATION */}
            <div className="space-y-6">
              {/* 🔤 WORD DISPLAY - Shows the word with blanks and guessed letters */}
              <WordConsole
                word={currentWord}
                guessedLetters={guessedLetters}
                gameState={gameState}
              />

              {/* 📈 GAME STATUS - Shows progress and wrong letters */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    ❌ Wrong: {wrongGuesses}/{MAX_WRONG_GUESSES}
                  </span>
                  <span className="flex items-center gap-1">
                    🔤 Used: {guessedLetters.size}
                  </span>
                </div>

                {/* Show wrong letters in a fun way */}
                {wrongLetters.length > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      🚫 Wrong letters:
                    </p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {wrongLetters.map(letter => (
                        <span
                          key={letter}
                          className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold text-sm animate-bounce"
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 🎉 WIN MESSAGE - Celebrate when player wins! */}
              {gameState === 'won' && (
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200 animate-pulse">
                  <Trophy className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-green-700 mb-2">
                    🎉 Awesome! You Won! 🎉
                  </h2>
                  <p className="text-green-600">
                    🏆 You guessed the word correctly! Great job!
                  </p>
                </div>
              )}

              {/* 💀 LOSE MESSAGE - Show the answer when player loses */}
              {gameState === 'lost' && (
                <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                  <XCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-red-700 mb-2">
                    😢 Game Over!
                  </h2>
                  <p className="text-red-600">
                    The word was:{' '}
                    <span className="font-bold text-lg">{currentWord}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Don&apos;t worry, try again! 💪
                  </p>
                </div>
              )}

              {/* 🔄 NEW GAME BUTTON - Start a fresh game */}
              {gameState !== 'playing' && (
                <div className="text-center">
                  <button
                    onClick={startNewGame}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 animate-bounce"
                    aria-label="Start a new game"
                  >
                    <RefreshCw className="w-5 h-5" />
                    🎮 New Game
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Press Enter or click to start a new game! 🚀
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ⌨️ LETTER KEYBOARD - Click letters to guess */}
        {gameState === 'playing' && (
          <Keyboard
            guessedLetters={guessedLetters}
            currentWord={currentWord}
            onGuess={handleLetterGuess}
          />
        )}

        {/* 📝 HOW TO PLAY - Instructions for the player */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>
            🖱️ Click letters or use your keyboard to guess! Press Enter to start
            a new game when finished! 🎮
          </p>
        </div>
      </div>
    </div>
  );
}
