import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { DetectionModel } from '@/lib/db/models/Detection';
import { extractTokenFromRequest, verifyToken, canAccessResource } from '@/lib/auth';
import { getSignedS3Url } from '@/lib/s3';
import { runAnalyzeInBackground } from '@/lib/analysis/assistx';
import type { ApiResponse } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const token = extractTokenFromRequest(request);
    if (!token) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid token' }, { status: 401 });

    const detection = await DetectionModel.findById(params.id);
    if (!detection) return NextResponse.json<ApiResponse>({ success: false, error: 'Not found' }, { status: 404 });
    if (!canAccessResource(payload.role, detection.userId.toString(), payload.userId)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const signedUrl = await getSignedS3Url(detection.s3Key);
    const response = await fetch(signedUrl);
    if (!response.ok) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to download file from S3' }, { status: 500 });
    }
    const arrayBuffer = await response.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    await runAnalyzeInBackground(detection._id.toString(), fileBuffer, detection.fileName);

    return NextResponse.json<ApiResponse>({ success: true, message: 'Forensic report generated' });
  } catch (error: any) {
    console.error('Analyze error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
