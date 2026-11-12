import mongoose, { Schema, Model } from 'mongoose';
import type { User, UserRole, UserPlan, UserStatus } from '@/types';

const UserSchema = new Schema<User>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['free', 'premium', 'enterprise', 'admin', 'super_admin'],
    default: 'free',
    required: true,
  },
  plan: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
    required: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  stripeCustomerId: {
    type: String,
  },
});

// Update timestamp on save
UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

export const UserModel: Model<User> = 
  mongoose.models.User || mongoose.model<User>('User', UserSchema);
