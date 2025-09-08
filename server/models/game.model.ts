import mongoose, { Schema, Document } from 'mongoose';

// Define the Game interface
export interface IGame extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  word: string;
  wordLength: number;
  guessedLetters: string[];
  gameStatus: 'in_progress' | 'won' | 'lost';
  wrongGuesses: number;
  hintsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Game schema
const gameSchema = new Schema<IGame>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    word: {
      type: String,
      required: [true, 'Word is required'],
      uppercase: true,
      trim: true,
    },
    wordLength: {
      type: Number,
      required: [true, 'Word length is required'],
      min: [3, 'Word must be at least 3 characters long'],
      max: [20, 'Word cannot exceed 20 characters'],
    },
    guessedLetters: [
      {
        type: String,
        uppercase: true,
        validate: {
          validator: function (letter: string) {
            return /^[A-Z]$/.test(letter);
          },
          message: 'Each guessed letter must be a single uppercase letter',
        },
      },
    ],
    gameStatus: {
      type: String,
      enum: {
        values: ['in_progress', 'won', 'lost'],
        message: 'Game status must be in_progress, won, or lost',
      },
      default: 'in_progress',
      required: [true, 'Game status is required'],
    },
    hintsUsed: {
      type: Number,
      default: 0,
      min: [0, 'Hints used cannot be negative'],
    },
    wrongGuesses: {
      type: Number,
      default: 0,
      min: [0, 'Wrong guesses cannot be negative'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create and export the model
const Game =
  mongoose.models.Game || mongoose.model<IGame>('Game', gameSchema, 'games');

export default Game;
