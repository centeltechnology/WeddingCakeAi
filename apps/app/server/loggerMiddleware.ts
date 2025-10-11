import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface LogContext {
  requestId: string;
  userId: string | null;
  tenantId: string | null;
  route: string;
  method: string;
  status: number;
  durationMs: number;
  timestamp: string;
}

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = randomUUID();
  const startTime = Date.now();
  
  // Attach request ID to request for later use
  (req as any).requestId = requestId;
  
  // Log when response is finished
  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const session = (req as any).session;
    const userId = session?.userId || session?.bakerUserId || null;
    const tenantId = (req as any).tenant?.id || null;
    
    const logEntry: LogContext = {
      requestId,
      userId,
      tenantId,
      route: req.path,
      method: req.method,
      status: res.statusCode,
      durationMs,
      timestamp: new Date().toISOString(),
    };
    
    // Output structured JSON log
    console.log(JSON.stringify(logEntry));
  });
  
  next();
}
