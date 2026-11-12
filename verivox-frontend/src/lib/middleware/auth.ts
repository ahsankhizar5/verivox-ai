import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';
import type { ApiResponse, AuthTokenPayload } from '@/types';

/**
 * Middleware to verify authentication
 */
export function withAuth(handler: (request: NextRequest, payload: AuthTokenPayload, ...args: any[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const token = extractToken(request.headers.get('Authorization'));
      
      if (!token) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Unauthorized - No token provided' },
          { status: 401 }
        );
      }

      const payload = verifyToken(token);
      
      if (!payload) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Unauthorized - Invalid token' },
          { status: 401 }
        );
      }

      return handler(request, payload, ...args);
    } catch (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Authentication error' },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware to check user role
 */
export function withRole(allowedRoles: string[]) {
  return (handler: (request: NextRequest, payload: AuthTokenPayload, ...args: any[]) => Promise<NextResponse>) => {
    return withAuth(async (request: NextRequest, payload: AuthTokenPayload, ...args: any[]) => {
      if (!allowedRoles.includes(payload.role)) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(request, payload, ...args);
    });
  };
}
