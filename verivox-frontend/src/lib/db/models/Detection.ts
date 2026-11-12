import mongoose, { Schema, Model } from 'mongoose';
import type { Detection } from '@/types';

const DetectionSchema = new Schema<Detection>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    default: 0,
  },
  result: {
    type: String,
    enum: ['spoof', 'bona_fide'],
    required: true,
    default: 'bona_fide',
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0,
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    required: true,
    default: 'processing',
  },
  spoofType: {
    type: String,
    enum: ['replay', 'tts', 'voice_conversion', 'none'],
    default: 'none',
  },
  graphs: {
    spectrogramUrl: {
      type: String,
      default: '',
      required: false,
    },
    heatmapUrl: String,
    waveformUrl: String,
  },
  // Structured XAI data from the analysis API
  xaiData: {
    summary: String,
    explanation: String,
    confidenceBreakdown: {
      spoof: Number,
      bona_fide: Number,
    },
    importantRegions: [
      {
        frequencyRange: String,
        importance: { type: String, enum: ['high', 'medium', 'low'] },
        reason: String,
      },
    ],
  },
  // Store the raw API response for debugging / future schema changes
  rawApiResponse: {
    type: Schema.Types.Mixed,
    default: null,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  textExplanation: {
    type: String,
    required: true,
    default: 'Processing...',
  },
  s3Key: {
    type: String,
    required: true,
  },
  // S3 key for the LIME analysis graph image returned by AssistX API
  limeGraphS3Key: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isUncertain: {
    type: Boolean,
    default: false,
  },
  warning: {
    type: String,
    default: null,
  },
});

// Indexes for efficient queries
DetectionSchema.index({ userId: 1, createdAt: -1 });
DetectionSchema.index({ status: 1 });
DetectionSchema.index({ result: 1 });
DetectionSchema.index({ createdAt: -1 });

// In development, delete the cached model so schema changes are picked up on hot-reload
if (process.env.NODE_ENV !== 'production' && mongoose.models.Detection) {
  delete mongoose.models.Detection;
}

export const DetectionModel: Model<Detection> =
  mongoose.models.Detection || mongoose.model<Detection>('Detection', DetectionSchema);
