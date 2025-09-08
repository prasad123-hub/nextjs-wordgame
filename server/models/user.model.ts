import mongoose, { Schema, Document } from 'mongoose';
import { isEmail } from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Define the User interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  refreshToken: string;
  forgotPasswordToken: string;
  forgotPasswordExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

// Define the User schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      minlength: [3, 'Name must be at least 3 characters long'],
      maxlength: [20, 'Name cannot exceed 20 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: {
        validator: (value: string) => isEmail(value),
        message: 'Invalid email format',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't include password in queries by default
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
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
    timestamps: true, // Automatically manage createdAt and updatedAt
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove sensitive fields from the response
        const { password, refreshToken, ...userWithoutSensitiveData } = ret as any;
        return userWithoutSensitiveData;
      },
    },
    toObject: { virtuals: true },
  }
);

// Pre-save middleware (keeping for future use)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Methods
userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined');
  }
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
    },
    secret,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' } as jwt.SignOptions
  );
};

userSchema.methods.generateRefreshToken = function () {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined');
  }
  return jwt.sign(
    {
      _id: this._id,
    },
    secret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' } as jwt.SignOptions
  );
};

// Create and export the model
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
