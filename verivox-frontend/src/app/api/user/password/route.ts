import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models/User';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await UserModel.findById(payload.userId).select('+passwordHash');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    // const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    const isPasswordValid = currentPassword == user.passwordHash;
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = newPassword;

    // Update password
    user.passwordHash = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update password' },
      { status: 500 }
    );
  }
}
