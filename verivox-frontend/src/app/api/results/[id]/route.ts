import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { DetectionModel } from '@/lib/db/models/Detection';
import { extractTokenFromRequest, verifyToken, canAccessResource } from '@/lib/auth';
import { deleteFromS3, getSignedS3Url } from '@/lib/s3';
import type { ApiResponse, AnalysisResult, SpoofType } from '@/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

// ---------------------------------------------------------------------------
// Fallback XAI generator used only when the API returned no XAI data
// (graceful degradation rather than mock)
// ---------------------------------------------------------------------------
function buildFallbackXAI(
  verdict: 'spoofed' | 'bona_fide',
  confidence: number
): AnalysisResult['xai'] {
  if (verdict === 'spoofed') {
    return {
      summary: `${Math.round(confidence * 100)}% confidence that this audio is synthetic or spoofed.`,
      explanation:
        'The model detected acoustic patterns inconsistent with natural human speech. ' +
        'Detailed frequency-region analysis is not available for this recording.',
      confidenceBreakdown: { spoof: confidence, bona_fide: 1 - confidence },
      importantRegions: [],
    };
  }
  return {
    summary: `${Math.round(confidence * 100)}% confidence that this audio is genuine human speech.`,
    explanation:
      'No significant anomalies or artifacts indicative of spoofing were detected. ' +
      'The recording exhibits natural acoustic properties.',
    confidenceBreakdown: { spoof: 1 - confidence, bona_fide: confidence },
    importantRegions: [],
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    // Verify authentication
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

    // Fetch detection record
    const detection = await DetectionModel.findById(params.id).lean();
    if (!detection) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Detection not found' },
        { status: 404 }
      );
    }

    // Access control
    if (!canAccessResource(payload.role, detection.userId.toString(), payload.userId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // ── Still processing ────────────────────────────────────────────────────
    if (detection.status === 'processing') {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          jobId: params.id,
          status: 'processing',
        },
      });
    }

    // ── Failed ──────────────────────────────────────────────────────────────
    if (detection.status === 'failed') {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          jobId: params.id,
          status: 'failed',
          errorMessage: detection.errorMessage ?? 'Analysis failed. Please try uploading again.',
        },
      });
    }

    // ── Completed ────────────────────────────────────────────────────────────
    const verdict: 'spoofed' | 'bona_fide' =
      detection.result === 'spoof' ? 'spoofed' : 'bona_fide';

    // Generate a fresh presigned URL for the LIME graph (1-hour expiry)
    let limeGraphUrl = '';
    if (detection.limeGraphS3Key) {
      try {
        limeGraphUrl = await getSignedS3Url(detection.limeGraphS3Key, 3600);
      } catch (urlErr) {
        console.error('Failed to generate presigned URL for LIME graph:', urlErr);
      }
    }

    // Build XAI block: prefer real data stored from the API, fall back gracefully
    const xai: AnalysisResult['xai'] = detection.xaiData
      ? {
          summary: detection.xaiData.summary,
          explanation: detection.xaiData.explanation,
          confidenceBreakdown: {
            spoof: detection.xaiData.confidenceBreakdown?.spoof ?? (verdict === 'spoofed' ? detection.confidence : 1 - detection.confidence),
            bona_fide: detection.xaiData.confidenceBreakdown?.bona_fide ?? (verdict === 'bona_fide' ? detection.confidence : 1 - detection.confidence),
          },
          importantRegions: (detection.xaiData.importantRegions ?? []).map((r) => ({
            frequencyRange: r.frequencyRange,
            importance: r.importance as 'high' | 'medium' | 'low',
            reason: r.reason,
          })),
        }
      : buildFallbackXAI(verdict, detection.confidence);

    const result: AnalysisResult = {
      jobId: params.id,
      status: 'completed',
      verdict,
      confidence: detection.confidence,
      spoofType: (detection.spoofType ?? (verdict === 'spoofed' ? 'replay' : 'none')) as SpoofType,
      createdAt: detection.createdAt.toISOString(),
      visuals: {
        spectrogramUrl: limeGraphUrl,   // LIME graph served via presigned URL
        waveformUrl: '',
        heatmapUrl: '',
      },
      xai,
      metadata: {
        fileName: detection.fileName,
        fileSize: detection.fileSize,
        duration: detection.duration,
      },
      isUncertain: detection.isUncertain,
      warning: detection.warning,
    };

    return NextResponse.json<ApiResponse<AnalysisResult>>({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Get detection error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    // Verify authentication
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

    // Get detection
    const detection = await DetectionModel.findById(params.id);
    if (!detection) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Detection not found' },
        { status: 404 }
      );
    }

    // Check access
    if (!canAccessResource(payload.role, detection.userId.toString(), payload.userId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete from S3
    await deleteFromS3(detection.s3Key);

    // Delete from database
    await DetectionModel.findByIdAndDelete(params.id);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Detection deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete detection error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
