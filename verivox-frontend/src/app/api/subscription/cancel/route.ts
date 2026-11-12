import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { SubscriptionModel } from '@/lib/db/models/Subscription';
import { cancelSubscription } from '@/lib/stripe';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

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

    const subscription = await SubscriptionModel.findOne({ userId: payload.userId });
    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel in Stripe
    await cancelSubscription(subscription.stripeSubscriptionId);

    // Update in database
    await SubscriptionModel.findByIdAndUpdate(subscription._id, {
      status: 'canceled',
      canceledAt: new Date(),
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
