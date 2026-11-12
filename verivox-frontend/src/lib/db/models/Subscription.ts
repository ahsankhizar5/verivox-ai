import mongoose, { Schema, Model } from 'mongoose';
import type { Subscription } from '@/types';

const SubscriptionSchema = new Schema<Subscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  plan: {
    type: String,
    enum: ['premium', 'enterprise'],
    required: true,
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  stripeSubscriptionId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due'],
    default: 'active',
  },
  renewalDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  canceledAt: {
    type: Date,
  },
});

// Indexes
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ renewalDate: 1 });

export const SubscriptionModel: Model<Subscription> =
  mongoose.models.Subscription || mongoose.model<Subscription>('Subscription', SubscriptionSchema);
