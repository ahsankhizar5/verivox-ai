import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = password;

    // Create user
    const user = await UserModel.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role: 'free',
      plan: 'free',
      status: 'active',
    });

    // Generate token
    const token = generateToken(user);

    // Create response with user data
    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          plan: user.plan,
        },
      },
    });

    // Set httpOnly cookie with token
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
