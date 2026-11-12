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
    const { firstName, lastName, email } = body;

    // Validate input
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await UserModel.findOne({
        email: email.toLowerCase(),
        _id: { $ne: payload.userId },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const user = await UserModel.findByIdAndUpdate(
      payload.userId,
      {
        firstName,
        lastName,
        email: email.toLowerCase(),
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
      data: { user },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
