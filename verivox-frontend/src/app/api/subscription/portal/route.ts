import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models/User';
import { createBillingPortalSession } from '@/lib/stripe';
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

    const user = await UserModel.findById(payload.userId);
    if (!user || !user.stripeCustomerId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No subscription found' },
        { status: 404 }
      );
    }

    const session = await createBillingPortalSession(
      user.stripeCustomerId,
      `${process.env.NEXT_PUBLIC_API_URL}/dashboard/billing`
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        url: session.url,
      },
    });
  } catch (error: any) {
    console.error('Create portal session error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
