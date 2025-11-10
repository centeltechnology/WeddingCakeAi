import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';

/**
 * Global error handler middleware
 * Catches all unhandled errors and returns sanitized responses
 */
export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the full error
  logger.error('Unhandled error', err, {
    requestId: (req as any).id,
    method: req.method,
    path: req.path,
    userId: (req as any).user?.id,
    tenantId: (req as any).tenant?.id,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Prepare error response
  const errorResponse: any = {
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : err.message || 'Unknown error',
  };

  // Add stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  logger.warn('404 Not Found', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
}
