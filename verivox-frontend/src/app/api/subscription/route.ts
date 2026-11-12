import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { SubscriptionModel } from '@/lib/db/models/Subscription';
import { UserModel } from '@/lib/db/models/User';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // Get user to check current plan
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get subscription if exists
    const subscription = await SubscriptionModel.findOne({ userId: payload.userId });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        plan: user.plan,
        subscription: subscription || null,
      },
    });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
