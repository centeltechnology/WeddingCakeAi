import rateLimit from 'express-rate-limit';
import { logger } from './logger.js';

/**
 * Strict rate limiting for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for auth endpoint', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many authentication attempts, please try again in 15 minutes',
    });
  },
});

/**
 * General API rate limiting
 * 100 requests per 15 minutes per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for API endpoint', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again in 15 minutes',
    });
  },
});

/**
 * Password reset rate limiting
 * 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for password reset', {
      ip: req.ip,
      email: req.body?.email,
    });
    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many password reset attempts. Please try again in 1 hour',
    });
  },
});
