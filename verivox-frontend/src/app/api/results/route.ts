import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { DetectionModel } from '@/lib/db/models/Detection';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const result = searchParams.get('result'); // 'spoof' or 'bona_fide'

    // Build query
    const query: any = { userId: payload.userId };
    if (result && ['spoof', 'bona_fide'].includes(result)) {
      query.result = result;
    }

    // Get detections with pagination
    const skip = (page - 1) * limit;
    const detections = await DetectionModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await DetectionModel.countDocuments(query);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        detections,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Results error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
