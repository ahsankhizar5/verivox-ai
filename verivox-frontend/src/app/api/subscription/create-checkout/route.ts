import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models/User';
import stripe, { STRIPE_PRICES, createCheckoutSession, createCustomer } from '@/lib/stripe';
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

    const body = await request.json();
    const { plan } = body;

    if (!plan || !['premium', 'enterprise'].includes(plan)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(payload.userId);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await createCustomer(
        user.email,
        `${user.firstName} ${user.lastName}`
      );
      customerId = customer.id;
      
      // Save customer ID to user
      await UserModel.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
    }

    // Get price ID
    const priceId = STRIPE_PRICES[plan as keyof typeof STRIPE_PRICES];

    // Create checkout session
    const session = await createCheckoutSession(
      customerId,
      priceId,
      `${process.env.NEXT_PUBLIC_API_URL}/dashboard/billing?success=true`,
      `${process.env.NEXT_PUBLIC_API_URL}/dashboard/billing?canceled=true`
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        url: session.url,
        sessionId: session.id,
      },
    });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
