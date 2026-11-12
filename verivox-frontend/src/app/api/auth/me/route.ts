import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models/User';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Not authenticated' },
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

    try {
      await dbConnect();
      const user = await UserModel.findById(payload.userId);
      if (user) {
        return NextResponse.json<ApiResponse>({
          success: true,
          data: {
            user: {
              id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              plan: user.plan,
              status: user.status,
            },
          },
        });
      }
    } catch {
      // Fallback to token payload if DB is unreachable
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: {
          id: payload.userId,
          email: payload.email,
          firstName: payload.email.split('@')[0],
          lastName: 'Studio',
          role: payload.role || 'free',
          plan: payload.plan || 'free',
          status: 'active',
        },
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
