import mongoose, { Schema, Model } from 'mongoose';
import type { ApiKey } from '@/types';

const ApiKeySchema = new Schema<ApiKey>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  apiKey: {
    type: String,
    required: true,
    unique: true,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  limit: {
    type: Number,
    default: 10000, // 10k requests per month
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsed: {
    type: Date,
  },
});

// Indexes
ApiKeySchema.index({ userId: 1 });
ApiKeySchema.index({ apiKey: 1 });

export const ApiKeyModel: Model<ApiKey> =
  mongoose.models.ApiKey || mongoose.model<ApiKey>('ApiKey', ApiKeySchema);
