import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
    throw new Error('JWT_SECRET must be set to a strong secret (32+ characters) in production environment');
  }
  
  return secret || 'fallback_dev_secret_DO_NOT_USE_IN_PRODUCTION';
})();

interface UnifiedUser {
  id: string;
  role: string;
  tenantId: string | null;
}

export interface UnifiedRequest extends Request {
  user?: UnifiedUser;
  baker?: any;
}

/**
 * Unified authentication middleware - supports both session and JWT
 * Prioritizes session auth, falls back to JWT for backward compatibility
 */
export function ensureAuthUnified(req: UnifiedRequest, res: Response, next: NextFunction) {
  // 1. Check session first (primary auth method)
  if ((req.session as any)?.userId) {
    req.user = {
      id: (req.session as any).userId,
      role: (req.session as any).role || "baker",
      tenantId: (req.session as any).tenantId || (req.session as any).tenant_id || null,
    };
    return next();
  }

  // 2. Legacy JWT support (backward compatibility)
  const auth = req.headers?.authorization || "";
  if (auth.startsWith("Bearer ")) {
    try {
      const token = auth.slice(7);
      const payload: any = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: payload.sub || payload.id || payload.userId,
        role: payload.role || "baker",
        tenantId: payload.tenantId || payload.tenant_id || null,
      };
      return next();
    } catch (e) {
      // Invalid JWT, fall through to 401
    }
  }

  // 3. Also check x-baker-token header (legacy compatibility)
  const bakerToken = req.headers['x-baker-token'] as string;
  if (bakerToken) {
    try {
      const payload: any = jwt.verify(bakerToken, JWT_SECRET);
      req.user = {
        id: payload.sub || payload.id || payload.userId,
        role: payload.role || "baker",
        tenantId: payload.tenantId || payload.tenant_id || null,
      };
      return next();
    } catch (e) {
      // Invalid token, fall through to 401
    }
  }

  // 4. No valid authentication found
  return res.status(401).json({ 
    ok: false, 
    error: "Unauthenticated",
    message: "Authentication required" 
  });
}

/**
 * Require tenant context middleware
 * Use this after ensureAuthUnified for routes that modify tenant-owned resources
 */
export function requireTenant(req: UnifiedRequest, res: Response, next: NextFunction) {
  if (!req.user?.tenantId) {
    return res.status(400).json({ 
      ok: false, 
      error: "Missing tenant context",
      message: "Tenant context is required for this operation"
    });
  }
  return next();
}

/**
 * Require specific user roles
 * Usage: requireRole('admin', 'super_admin')
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: UnifiedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        ok: false,
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        ok: false,
        error: 'Access forbidden',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        requiredRoles: allowedRoles,
        currentRole: req.user.role
      });
    }

    next();
  };
}
