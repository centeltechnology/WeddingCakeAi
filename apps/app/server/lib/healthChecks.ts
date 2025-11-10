import { Request, Response } from 'express';
import { db } from '../db.js';
import { sql } from 'drizzle-orm';
import { logger } from './logger.js';

const startTime = Date.now();

/**
 * Simple health check endpoint
 * Returns 200 if service is up and database is accessible
 */
export async function healthCheck(req: Request, res: Response) {
  try {
    // Test database connectivity
    await db.execute(sql`SELECT 1`);

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connectivity failed',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Detailed health check with system metrics
 */
export async function detailedHealthCheck(req: Request, res: Response) {
  const checks: any = {
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    status: 'healthy',
    checks: {},
  };

  // Database check
  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    const duration = Date.now() - start;

    checks.checks.database = {
      status: 'healthy',
      responseTime: `${duration}ms`,
    };
  } catch (error) {
    checks.status = 'unhealthy';
    checks.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    logger.error('Database health check failed', error);
  }

  // Memory check
  const memoryUsage = process.memoryUsage();
  checks.checks.memory = {
    status: 'healthy',
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
  };

  // Environment check
  checks.checks.environment = {
    nodeEnv: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
  };

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(checks);
}
