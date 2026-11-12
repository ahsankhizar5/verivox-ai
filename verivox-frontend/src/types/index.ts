import { ObjectId } from 'mongodb';

export type UserRole = 'free' | 'premium' | 'enterprise' | 'admin' | 'super_admin';
export type UserPlan = 'free' | 'premium' | 'enterprise';
export type UserStatus = 'active' | 'suspended';
export type DetectionResult = 'spoof' | 'bona_fide';
export type DetectionVerdict = 'spoofed' | 'bona_fide';
export type SpoofType = 'replay' | 'tts' | 'voice_conversion' | 'none';
export type JobStatus = 'processing' | 'completed' | 'failed';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';

export interface User {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  plan: UserPlan;
  createdAt: Date;
  status: UserStatus;
  firstName?: string;
  lastName?: string;
  updatedAt?: Date;
  stripeCustomerId?: string;
}

export interface Detection {
  _id?: ObjectId;
  userId: ObjectId;
  fileName: string;
  fileSize: number;
  duration: number;
  result: DetectionResult;
  confidence: number;
  status: JobStatus;
  spoofType?: SpoofType;
  graphs: {
    spectrogramUrl: string;
    heatmapUrl?: string;
    waveformUrl?: string;
  };
  // Stored XAI data from the analysis API
  xaiData?: {
    summary: string;
    explanation: string;
    confidenceBreakdown: {
      spoof: number;
      bona_fide: number;
    };
    importantRegions: Array<{
      frequencyRange: string;
      importance: 'high' | 'medium' | 'low';
      reason: string;
    }>;
  };
  // Raw API response for debugging
  rawApiResponse?: Record<string, unknown>;
  errorMessage?: string;
  textExplanation: string;
  createdAt: Date;
  s3Key: string;
  limeGraphS3Key?: string;
  isUncertain?: boolean;
  warning?: string | null;
}

export interface ApiKey {
  _id?: ObjectId;
  userId: ObjectId;
  apiKey: string;
  usageCount: number;
  limit: number;
  createdAt: Date;
  lastUsed?: Date;
}

export interface Subscription {
  _id?: ObjectId;
  userId: ObjectId;
  plan: UserPlan;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  status: SubscriptionStatus;
  renewalDate: Date;
  createdAt: Date;
  canceledAt?: Date;
}

export interface UsageStats {
  userId: ObjectId;
  date: Date;
  uploadCount: number;
  apiCalls: number;
}

export interface PlanLimits {
  uploadsPerDay: number;
  hasApiAccess: boolean;
  hasPdfDownload: boolean;
  historyDays: number | 'unlimited';
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    uploadsPerDay: 50,
    hasApiAccess: false,
    hasPdfDownload: true,
    historyDays: 30,
  },
  premium: {
    uploadsPerDay: -1, // unlimited
    hasApiAccess: false,
    hasPdfDownload: true,
    historyDays: 'unlimited',
  },
  enterprise: {
    uploadsPerDay: -1, // unlimited
    hasApiAccess: true,
    hasPdfDownload: true,
    historyDays: 'unlimited',
  },
};

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// XAI (Explainable AI) Types
export interface ImportantRegion {
  frequencyRange: string;
  importance: 'high' | 'medium' | 'low';
  reason: string;
}

export interface ConfidenceBreakdown {
  spoof: number;
  bona_fide: number;
}

export interface XAIExplanation {
  summary: string;
  explanation: string;
  confidenceBreakdown: ConfidenceBreakdown;
  importantRegions: ImportantRegion[];
}

export interface VisualizationAssets {
  waveformUrl: string;
  spectrogramUrl: string;
  heatmapUrl: string;
}

export interface AnalysisResult {
  jobId: string;
  status: JobStatus;
  verdict: DetectionVerdict;
  confidence: number;
  spoofType: SpoofType;
  createdAt: string;
  visuals: VisualizationAssets;
  xai: XAIExplanation;
  metadata?: {
    fileName: string;
    fileSize: number;
    duration: number;
    sampleRate?: number;
  };
  isUncertain?: boolean;
  warning?: string | null;
}

export interface UploadResponse {
  jobId: string;
  status: JobStatus;
}

// File validation types
export interface FileValidation {
  isValid: boolean;
  errors: string[];
}

export const FILE_CONSTRAINTS = {
  MAX_SIZE_MB: 15,
  MAX_SIZE_BYTES: 15 * 1024 * 1024,
  MAX_DURATION_SECONDS: 60,
  MIN_DURATION_SECONDS: 1,
  SUPPORTED_FORMATS: ['.wav', '.flac', '.mp3', '.m4a', '.webm', '.ogg'],
  SUPPORTED_MIME_TYPES: [
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/flac',
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/x-m4a',
    'audio/webm',
    'audio/ogg',
  ],
} as const;
