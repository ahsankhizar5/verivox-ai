import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export async function POST() {
  const response = NextResponse.json<ApiResponse>({
    success: true,
    data: { message: 'Logged out successfully' },
  });

  // Clear the auth token cookie
  response.cookies.set({
    name: 'auth-token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
