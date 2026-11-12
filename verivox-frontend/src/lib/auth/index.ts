import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthTokenPayload, User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(user: User): string {
  const payload: AuthTokenPayload = {
    userId: user._id!.toString(),
    email: user.email,
    role: user.role,
    plan: user.plan,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    return jwt.verify(token, secret) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Extract token from NextRequest (checks both cookies and Authorization header)
 */
export function extractTokenFromRequest(request: any): string | null {
  // First try to get from cookie (for browser requests)
  const cookieToken = request.cookies?.get?.('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  // Fall back to Authorization header (for API requests)
  const authHeader = request.headers.get('Authorization');
  return extractToken(authHeader);
}

/**
 * Check if user has required role
 */
export function hasRole(
  userRole: string,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check if user can access resource
 */
export function canAccessResource(
  userRole: string,
  resourceOwnerId: string,
  requestUserId: string
): boolean {
  // Admins and super admins can access everything
  if (userRole === 'admin' || userRole === 'super_admin') {
    return true;
  }
  // Users can access their own resources
  return resourceOwnerId === requestUserId;
}
