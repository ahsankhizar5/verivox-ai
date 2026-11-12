import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { DetectionModel } from '@/lib/db/models/Detection';
import { uploadToS3, generateS3Key } from '@/lib/s3';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';
import { runAnalysisInBackground } from '@/lib/analysis/assistx';
import { PLAN_LIMITS, FILE_CONSTRAINTS } from '@/types';
import type { ApiResponse, UploadResponse } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const utcMidnight = new Date();
    utcMidnight.setUTCHours(0, 0, 0, 0);

    const todayUploads = await DetectionModel.countDocuments({
      userId: payload.userId,
      status: { $ne: 'failed' },
      createdAt: { $gte: utcMidnight },
    });

    const userLimit = PLAN_LIMITS[payload.plan].uploadsPerDay;
    if (userLimit > 0 && todayUploads >= userLimit) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Daily upload limit of ${userLimit} reached. Resets at midnight UTC.` },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const isValidFormat = FILE_CONSTRAINTS.SUPPORTED_FORMATS.some(format =>
      fileName.endsWith(format)
    );

    if (!isValidFormat) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Unsupported file format. Supported formats: ${FILE_CONSTRAINTS.SUPPORTED_FORMATS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (file.size > FILE_CONSTRAINTS.MAX_SIZE_BYTES) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `File too large. Maximum size is ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const s3Key = generateS3Key(payload.userId, file.name);
    await uploadToS3(s3Key, buffer, file.type);

    const durationStr = formData.get('duration') as string | null;
    const duration = durationStr ? parseFloat(durationStr) : 0;
    const captureMode = (formData.get('captureMode') as string | null) || 'file_upload';

    const detection = await DetectionModel.create({
      userId: payload.userId,
      fileName: file.name,
      fileSize: file.size,
      duration: isFinite(duration) && duration > 0 ? duration : 0,
      result: 'bona_fide',
      confidence: 0,
      status: 'processing',
      graphs: { spectrogramUrl: '', waveformUrl: '', heatmapUrl: '' },
      textExplanation: 'Analysis in progress. Please wait.',
      s3Key,
    });

    const detectionId = detection._id!.toString();

    await runAnalysisInBackground(detectionId, buffer, file.name, captureMode);

    return NextResponse.json<ApiResponse<UploadResponse>>({
      success: true,
      data: {
        jobId: detectionId,
        status: 'completed',
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
