import { Express, Request, Response } from 'express';
import { logger } from './lib/logger.js';
import { healthCheck, detailedHealthCheck } from './lib/healthChecks.js';
import {
  verifyRefreshToken,
  createRefreshToken,
  revokeUserTokens,
} from './lib/refreshTokens.js';
import {
  verifyWebhookSignature,
  isEventProcessed,
  recordWebhookEvent,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentFailed,
} from './lib/stripeWebhooks.js';
import { authRateLimiter, passwordResetLimiter } from './lib/rateLimiting.js';
import jwt from 'jsonwebtoken';

// JWT secret with production-safe validation
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production' && (!secret || secret.length < 32)) {
    throw new Error('JWT_SECRET must be set and at least 32 characters in production');
  }
  
  return secret || 'fallback_dev_secret_key_change_in_production';
})();

export function registerSecurityRoutes(app: Express) {
  // Health check endpoints
  app.get('/healthz', healthCheck);
  app.get('/health/detailed', detailedHealthCheck);

  /**
   * Refresh token endpoint
   * POST /api/auth/refresh
   * Body: { refreshToken: string }
   * Returns: { accessToken: string, refreshToken: string }
   */
  app.post('/api/auth/refresh', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Refresh token is required',
        });
      }

      // Verify and consume the refresh token (one-time use)
      const userId = await verifyRefreshToken(refreshToken);

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired refresh token',
        });
      }

      // Generate new access token
      const accessToken = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: '7d',
      });

      // Generate new refresh token (rotation)
      const newRefreshToken = await createRefreshToken(userId);

      logger.info('Token refreshed successfully', { userId });

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      logger.error('Refresh token endpoint error', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to refresh token',
      });
    }
  });

  /**
   * Logout endpoint (revokes all refresh tokens)
   * POST /api/auth/logout
   * Headers: Authorization: Bearer <accessToken>
   */
  app.post('/api/auth/logout', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Access token required',
        });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

      // Revoke all refresh tokens for this user
      await revokeUserTokens(decoded.userId);

      logger.info('User logged out', { userId: decoded.userId });

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout endpoint error', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to logout',
      });
    }
  });

  /**
   * Stripe webhook endpoint with signature verification and idempotency
   * POST /api/stripe/webhook
   */
  app.post('/api/stripe/webhook', async (req: Request, res: Response) => {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        logger.warn('Stripe webhook received without signature');
        return res.status(400).json({ error: 'Missing signature' });
      }

      // Verify webhook signature
      const event = verifyWebhookSignature(req, signature);

      if (!event) {
        logger.warn('Invalid Stripe webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Check idempotency - have we already processed this event?
      const alreadyProcessed = await isEventProcessed(event.id);

      if (alreadyProcessed) {
        logger.info('Webhook event already processed', { eventId: event.id });
        return res.json({ received: true, alreadyProcessed: true });
      }

      // Process event based on type
      let processed = false;
      let error: string | undefined;

      try {
        switch (event.type) {
          case 'customer.subscription.created':
            await handleSubscriptionCreated(event.data.object as any);
            processed = true;
            break;

          case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data.object as any);
            processed = true;
            break;

          case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object as any);
            processed = true;
            break;

          case 'invoice.payment_failed':
            await handleInvoicePaymentFailed(event.data.object as any);
            processed = true;
            break;

          default:
            logger.info('Unhandled webhook event type', { eventType: event.type });
            processed = true; // Mark as processed even if unhandled
        }
      } catch (err) {
        error = err instanceof Error ? err.message : 'Unknown error';
        logger.error('Webhook event processing failed', err, {
          eventId: event.id,
          eventType: event.type,
        });
      }

      // Record event processing
      await recordWebhookEvent(event.id, event.type, event.data.object, processed, error);

      res.json({ received: true });
    } catch (error) {
      logger.error('Stripe webhook endpoint error', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  logger.info('Security routes registered');
}
