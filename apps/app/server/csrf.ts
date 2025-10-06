import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

// Store CSRF tokens in memory (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Clean up expired tokens every hour
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (data.expires < now) {
      csrfTokens.delete(sessionId);
    }
  }
}, 60 * 60 * 1000);

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  csrfTokens.set(sessionId, { token, expires });
  return token;
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored) return false;
  
  if (stored.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF protection for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip for API endpoints that use JWT authentication
  if (req.path.startsWith('/api/super-admin/') || req.path.startsWith('/api/bakers/public')) {
    return next();
  }
  
  const sessionId = (req.session as any)?.id || 'anonymous';
  const token = req.body._csrf || req.headers['x-csrf-token'];
  
  if (!token || !validateCSRFToken(sessionId, token)) {
    return res.status(403).json({ 
      error: 'Invalid CSRF token',
      message: 'Request rejected for security reasons. Please refresh the page and try again.'
    });
  }
  
  next();
}

export function getCSRFToken(req: Request): string {
  const sessionId = (req.session as any)?.id || 'anonymous';
  return generateCSRFToken(sessionId);
}