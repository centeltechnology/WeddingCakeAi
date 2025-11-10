import { randomBytes, createHash } from 'crypto';
import { db } from '../db.js';
import { refreshTokens } from '../../shared/schema.js';
import { eq, and, lt } from 'drizzle-orm';
import { logger } from './logger.js';

const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export interface RefreshTokenData {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

/**
 * Generate a secure random refresh token
 */
export function generateRefreshToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Hash a refresh token for secure storage
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Create a new refresh token for a user
 */
export async function createRefreshToken(userId: string): Promise<string> {
  try {
    const token = generateRefreshToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await db.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt,
    });

    logger.info('Refresh token created', { userId });
    return token;
  } catch (error) {
    logger.error('Failed to create refresh token', error, { userId });
    throw error;
  }
}

/**
 * Verify a refresh token and return user ID if valid
 * Token is marked as used after verification (one-time use)
 */
export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const tokenHash = hashToken(token);
    const now = new Date();

    // Find unused, non-expired token
    const [tokenRecord] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          eq(refreshTokens.usedAt, null as any),
          lt(now, refreshTokens.expiresAt)
        )
      )
      .limit(1);

    if (!tokenRecord) {
      logger.warn('Invalid or expired refresh token attempt');
      return null;
    }

    // Mark token as used (one-time use for security)
    await db
      .update(refreshTokens)
      .set({ usedAt: now })
      .where(eq(refreshTokens.id, tokenRecord.id));

    logger.info('Refresh token verified and invalidated', { userId: tokenRecord.userId });
    return tokenRecord.userId;
  } catch (error) {
    logger.error('Failed to verify refresh token', error);
    return null;
  }
}

/**
 * Revoke all refresh tokens for a user (e.g., on logout)
 */
export async function revokeUserTokens(userId: string): Promise<void> {
  try {
    await db
      .update(refreshTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.usedAt, null as any)
        )
      );

    logger.info('All refresh tokens revoked for user', { userId });
  } catch (error) {
    logger.error('Failed to revoke refresh tokens', error, { userId });
    throw error;
  }
}

/**
 * Clean up expired refresh tokens (run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const now = new Date();
    const result = await db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, now));

    const count = result.rowCount || 0;
    logger.info(`Cleaned up ${count} expired refresh tokens`);
    return count;
  } catch (error) {
    logger.error('Failed to cleanup expired tokens', error);
    return 0;
  }
}
