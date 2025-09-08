import mongoose, { Schema, Document } from 'mongoose';

// Define the Game interface
export interface IGame extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  word: string;
  wordLength: number;
  difficulty: 'easy' | 'medium' | 'hard';
  maxGuesses: number;
  guessesUsed: number;
  guessedLetters: string[];
  correctLetters: string[];
  wrongLetters: string[];
  gameStatus: 'in_progress' | 'won' | 'lost';
  score: number;
  hintsUsed: number;
  maxHints: number;
  timeStarted: Date;
  timeEnded?: Date;
  duration?: number; // in seconds
  perfectGame: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Game schema
const gameSchema = new Schema<IGame>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  word: {
    type: String,
    required: [true, 'Word is required'],
    uppercase: true,
    trim: true
  },
  wordLength: {
    type: Number,
    required: [true, 'Word length is required'],
    min: [3, 'Word must be at least 3 characters long'],
    max: [20, 'Word cannot exceed 20 characters']
  },
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: 'Difficulty must be easy, medium, or hard'
    },
    required: [true, 'Difficulty is required'],
    default: 'medium'
  },
  maxGuesses: {
    type: Number,
    required: [true, 'Max guesses is required'],
    min: [1, 'Max guesses must be at least 1'],
    max: [26, 'Max guesses cannot exceed 26']
  },
  guessesUsed: {
    type: Number,
    default: 0,
    min: [0, 'Guesses used cannot be negative'],
    max: [26, 'Guesses used cannot exceed 26']
  },
  guessedLetters: [{
    type: String,
    uppercase: true,
    validate: {
      validator: function(letter: string) {
        return /^[A-Z]$/.test(letter);
      },
      message: 'Each guessed letter must be a single uppercase letter'
    }
  }],
  correctLetters: [{
    type: String,
    uppercase: true,
    validate: {
      validator: function(letter: string) {
        return /^[A-Z]$/.test(letter);
      },
      message: 'Each correct letter must be a single uppercase letter'
    }
  }],
  wrongLetters: [{
    type: String,
    uppercase: true,
    validate: {
      validator: function(letter: string) {
        return /^[A-Z]$/.test(letter);
      },
      message: 'Each wrong letter must be a single uppercase letter'
    }
  }],
  gameStatus: {
    type: String,
    enum: {
      values: ['in_progress', 'won', 'lost'],
      message: 'Game status must be in_progress, won, or lost'
    },
    default: 'in_progress',
    required: [true, 'Game status is required']
  },
  score: {
    type: Number,
    default: 0,
    min: [0, 'Score cannot be negative']
  },
  hintsUsed: {
    type: Number,
    default: 0,
    min: [0, 'Hints used cannot be negative']
  },
  maxHints: {
    type: Number,
    default: 3,
    min: [0, 'Max hints cannot be negative'],
    max: [10, 'Max hints cannot exceed 10']
  },
  timeStarted: {
    type: Date,
    default: Date.now,
    required: [true, 'Time started is required']
  },
  timeEnded: {
    type: Date
  },
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative']
  },
  perfectGame: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating remaining guesses
gameSchema.virtual('remainingGuesses').get(function() {
  return this.maxGuesses - this.guessesUsed;
});

// Virtual for calculating remaining hints
gameSchema.virtual('remainingHints').get(function() {
  return this.maxHints - this.hintsUsed;
});

// Virtual for checking if game is over
gameSchema.virtual('isGameOver').get(function() {
  return this.gameStatus === 'won' || this.gameStatus === 'lost';
});

// Virtual for getting current word display (with blanks for unguessed letters)
gameSchema.virtual('wordDisplay').get(function() {
  return this.word.split('').map(letter => 
    this.correctLetters.includes(letter) ? letter : '_'
  ).join(' ');
});

// Pre-save middleware to calculate duration and perfect game status
gameSchema.pre('save', function(next) {
  // Calculate duration if game is ended
  if (this.timeEnded && this.timeStarted) {
    this.duration = Math.floor((this.timeEnded.getTime() - this.timeStarted.getTime()) / 1000);
  }
  
  // Check if it's a perfect game (won with no wrong guesses)
  if (this.gameStatus === 'won' && this.wrongLetters.length === 0) {
    this.perfectGame = true;
  }
  
  next();
});

// Instance methods
gameSchema.methods.makeGuess = function(letter: string): {
  success: boolean;
  isCorrect: boolean;
  isAlreadyGuessed: boolean;
  gameOver: boolean;
  won: boolean;
  message: string;
} {
  const upperLetter = letter.toUpperCase();
  
  // Check if letter is already guessed
  if (this.guessedLetters.includes(upperLetter)) {
    return {
      success: false,
      isCorrect: false,
      isAlreadyGuessed: true,
      gameOver: false,
      won: false,
      message: 'Letter already guessed'
    };
  }
  
  // Add letter to guessed letters
  this.guessedLetters.push(upperLetter);
  this.guessesUsed += 1;
  
  // Check if letter is in the word
  const isCorrect = this.word.includes(upperLetter);
  
  if (isCorrect) {
    this.correctLetters.push(upperLetter);
  } else {
    this.wrongLetters.push(upperLetter);
  }
  
  // Check if game is won (all letters guessed)
  const allLettersGuessed = this.word.split('').every((letter: string) => 
    this.correctLetters.includes(letter)
  );
  
  if (allLettersGuessed) {
    this.gameStatus = 'won';
    this.timeEnded = new Date();
    this.calculateScore();
    return {
      success: true,
      isCorrect: true,
      isAlreadyGuessed: false,
      gameOver: true,
      won: true,
      message: 'Congratulations! You won!'
    };
  }
  
  // Check if game is lost (no more guesses)
  if (this.guessesUsed >= this.maxGuesses) {
    this.gameStatus = 'lost';
    this.timeEnded = new Date();
    return {
      success: true,
      isCorrect: false,
      isAlreadyGuessed: false,
      gameOver: true,
      won: false,
      message: 'Game over! You ran out of guesses.'
    };
  }
  
  return {
    success: true,
    isCorrect,
    isAlreadyGuessed: false,
    gameOver: false,
    won: false,
    message: isCorrect ? 'Correct letter!' : 'Wrong letter!'
  };
};

gameSchema.methods.useHint = function(): {
  success: boolean;
  hint: string;
  message: string;
} {
  if (this.hintsUsed >= this.maxHints) {
    return {
      success: false,
      hint: '',
      message: 'No hints remaining'
    };
  }
  
  if (this.gameStatus !== 'in_progress') {
    return {
      success: false,
      hint: '',
      message: 'Game is not in progress'
    };
  }
  
  // Find an unguessed letter
  const unguessedLetters = this.word.split('').filter((letter: string) => 
    !this.correctLetters.includes(letter)
  );
  
  if (unguessedLetters.length === 0) {
    return {
      success: false,
      hint: '',
      message: 'All letters are already guessed'
    };
  }
  
  // Pick a random unguessed letter
  const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
  this.hintsUsed += 1;
  
  return {
    success: true,
    hint: randomLetter,
    message: `Hint: The word contains the letter "${randomLetter}"`
  };
};

gameSchema.methods.calculateScore = function(): number {
  if (this.gameStatus !== 'won') {
    this.score = 0;
    return 0;
  }
  
  // Base score calculation
  let baseScore = this.wordLength * 10; // 10 points per letter
  
  // Bonus for difficulty
  const difficultyMultiplier: Record<string, number> = {
    'easy': 1,
    'medium': 1.5,
    'hard': 2
  };
  
  baseScore *= difficultyMultiplier[this.difficulty];
  
  // Bonus for efficiency (fewer guesses used)
  const efficiencyBonus = Math.max(0, this.maxGuesses - this.guessesUsed) * 5;
  
  // Perfect game bonus
  const perfectBonus = this.perfectGame ? 50 : 0;
  
  // Time bonus (faster completion = higher bonus)
  let timeBonus = 0;
  if (this.duration) {
    const timeInMinutes = this.duration / 60;
    timeBonus = Math.max(0, Math.floor(30 - timeInMinutes) * 2); // Up to 60 points for very fast games
  }
  
  // Hint penalty
  const hintPenalty = this.hintsUsed * 10;
  
  this.score = Math.max(0, Math.floor(
    baseScore + efficiencyBonus + perfectBonus + timeBonus - hintPenalty
  ));
  
  return this.score;
};

gameSchema.methods.surrender = function(): void {
  if (this.gameStatus === 'in_progress') {
    this.gameStatus = 'lost';
    this.timeEnded = new Date();
  }
};

// Static methods
gameSchema.statics.findByUserId = function(userId: string, status?: string) {
  const query: any = { userId };
  if (status) {
    query.gameStatus = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

gameSchema.statics.findActiveGame = function(userId: string) {
  return this.findOne({ userId, gameStatus: 'in_progress' });
};

gameSchema.statics.getUserStats = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalGames: { $sum: 1 },
        totalWins: { $sum: { $cond: [{ $eq: ['$gameStatus', 'won'] }, 1, 0] } },
        totalLosses: { $sum: { $cond: [{ $eq: ['$gameStatus', 'lost'] }, 1, 0] } },
        totalScore: { $sum: '$score' },
        totalWordsGuessed: { $sum: { $cond: [{ $eq: ['$gameStatus', 'won'] }, 1, 0] } },
        totalLettersGuessed: { $sum: '$guessesUsed' },
        perfectGames: { $sum: { $cond: ['$perfectGame', 1, 0] } },
        longestWordGuessed: { $max: { $cond: [{ $eq: ['$gameStatus', 'won'] }, '$wordLength', 0] } },
        averageScore: { $avg: '$score' },
        averageGuessesPerGame: { $avg: '$guessesUsed' }
      }
    }
  ]);
};

// Indexes for better query performance
gameSchema.index({ userId: 1, createdAt: -1 });
gameSchema.index({ userId: 1, gameStatus: 1 });
gameSchema.index({ gameStatus: 1, score: -1 });
gameSchema.index({ difficulty: 1, score: -1 });
gameSchema.index({ createdAt: -1 });
gameSchema.index({ timeStarted: -1 });

// Create and export the model
const Game = mongoose.model<IGame>('Game', gameSchema);

export default Game;
