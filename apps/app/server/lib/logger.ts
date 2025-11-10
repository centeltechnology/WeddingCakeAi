import { Request } from 'express';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  tenantId?: string;
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private minLevel: LogLevel;

  constructor() {
    const env = process.env.NODE_ENV || 'development';
    this.minLevel = env === 'production' ? 'info' : 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...context,
    };
    return JSON.stringify(logEntry);
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      console.log(this.formatLog('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      console.log(this.formatLog('info', message, context));
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatLog('warn', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      };
      console.error(this.formatLog('error', message, errorContext));
    }
  }

  // Helper to extract request context for logging
  requestContext(req: Request): LogContext {
    return {
      requestId: (req as any).id,
      userId: (req as any).user?.id,
      tenantId: (req as any).tenant?.id,
      method: req.method,
      path: req.path,
      ip: req.ip,
    };
  }
}

export const logger = new Logger();
