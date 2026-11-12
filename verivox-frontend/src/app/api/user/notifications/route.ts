import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models/User';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { detectionAlerts, accountUpdates, marketingEmails, weeklyReports } = body;

    // Update notification preferences - store as a plain object
    const user = await UserModel.findByIdAndUpdate(
      payload.userId,
      {
        notificationPreferences: {
          detectionAlerts,
          accountUpdates,
          marketingEmails,
          weeklyReports,
        },
        updatedAt: new Date(),
      },
      { new: true, select: '-passwordHash' }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { preferences: (user as any).notificationPreferences },
    });
  } catch (error: any) {
    console.error('Notification preferences update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const user = await UserModel.findById(payload.userId).select('notificationPreferences');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { preferences: (user as any).notificationPreferences || {} },
    });
  } catch (error: any) {
    console.error('Get notification preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get notification preferences' },
      { status: 500 }
    );
  }
}
