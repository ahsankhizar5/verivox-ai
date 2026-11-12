import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models/User';
import { DetectionModel } from '@/lib/db/models/Detection';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Delete all user's detections
    await DetectionModel.deleteMany({ userId: payload.userId });

    // Delete user account
    const user = await UserModel.findByIdAndDelete(payload.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Clear auth cookie
    const response = NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
