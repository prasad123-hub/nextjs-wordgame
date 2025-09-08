import mongoose, { Schema, Document } from 'mongoose';

export interface IWord extends Document {
  word: string;
  hint1: string;
  hint2: string;
}

const wordSchema = new Schema<IWord>({
  word: { type: String, required: true },
  hint1: { type: String, required: true },
  hint2: { type: String, required: true },
});

const Word =
  mongoose.models.Word || mongoose.model<IWord>('Word', wordSchema, 'words');

export default Word;
