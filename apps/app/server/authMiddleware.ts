import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { subscriptionManager } from "./subscriptionConfig";

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
    throw new Error('JWT_SECRET must be set to a strong secret (32+ characters) in production environment');
  }
  
  return secret || 'fallback_dev_secret_DO_NOT_USE_IN_PRODUCTION';
})();

interface JWTPayload {
  id?: string;
  userId?: string;
  username?: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  baker?: any;
}

/**
 * Authorize Lead Ownership middleware - verifies the lead belongs to the authenticated baker
 */
export async function authorizeLeadOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    const leadId = req.params.id;
    if (!leadId) {
      return res.status(400).json({ 
        error: 'Lead ID required',
        message: 'Missing lead ID in request parameters'
      });
    }

    // Get the lead and check ownership
    const lead = await storage.getLead(leadId);
    if (!lead) {
      return res.status(404).json({ 
        error: 'Lead not found',
        message: 'The requested lead does not exist'
      });
    }

    // Verify the lead belongs to the authenticated baker
    if (lead.bakerId !== req.user.userId) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only access leads that belong to you'
      });
    }

    next();
  } catch (error) {
    console.error('Lead authorization error:', error);
    return res.status(500).json({ 
      error: 'Authorization error',
      message: 'Internal server error during authorization'
    });
  }
}

/**
 * JWT Authentication middleware - verifies token and adds user to request
 */
export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header or baker_token header
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    // Fallback to baker_token header (for compatibility with frontend)
    if (!token) {
      token = req.headers['x-baker-token'] as string;
    }
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please log in again'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Authentication failed'
      });
    } else {
      return res.status(500).json({ 
        error: 'Authentication error',
        message: 'Internal server error during authentication'
      });
    }
  }
}

/**
 * Baker authorization middleware - ensures user can only access their own baker data
 */
export function authorizeBakerAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const bakerId = req.params.bakerId || req.params.id;
    const user = req.user;

    if (!bakerId) {
      return res.status(400).json({ 
        error: 'Baker ID required',
        message: 'Baker ID not provided in request'
      });
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    // Get user ID - support both 'id' and 'userId' property names
    const userId = user.id || user.userId;
    
    // Check if user is accessing their own baker data
    if (user.role === 'baker' && userId !== bakerId) {
      return res.status(403).json({ 
        error: 'Access forbidden',
        message: 'You can only access your own data'
      });
    }

    // Allow super_admin to access any baker data
    if (user.role === 'super_admin') {
      return next();
    }

    // For baker role, ensure they're accessing their own data
    if (user.role === 'baker' && userId === bakerId) {
      return next();
    }

    // Deny access for any other scenario
    return res.status(403).json({ 
      error: 'Access forbidden',
      message: 'Insufficient permissions'
    });

  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({ 
      error: 'Authorization error',
      message: 'Internal server error during authorization'
    });
  }
}

/**
 * Enhanced baker authorization that also loads baker data
 */
export async function authorizeBakerWithData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const bakerId = req.params.bakerId || req.params.id;
    const user = req.user;

    if (!bakerId) {
      return res.status(400).json({ 
        error: 'Baker ID required',
        message: 'Baker ID not provided in request'
      });
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    // Load baker data to verify it exists - try by ID first, then by slug
    let baker = await storage.getBaker(bakerId);
    if (!baker) {
      baker = await storage.getBakerBySlug(bakerId);
    }
    if (!baker) {
      return res.status(404).json({ 
        error: 'Baker not found',
        message: 'The specified baker does not exist'
      });
    }

    // Update params to use the actual baker ID for downstream use
    req.params.bakerId = baker.id;

    // Get user ID - support both 'id' and 'userId' property names
    const userId = user.id || user.userId;
    
    // Check if user is accessing their own baker data
    if (user.role === 'baker' && userId !== baker.id) {
      return res.status(403).json({ 
        error: 'Access forbidden',
        message: 'You can only access your own data'
      });
    }

    // Allow super_admin to access any baker data
    if (user.role === 'super_admin') {
      req.baker = baker;
      return next();
    }

    // For baker role, ensure they're accessing their own data
    if (user.role === 'baker' && userId === baker.id) {
      req.baker = baker;
      return next();
    }

    // Deny access for any other scenario
    return res.status(403).json({ 
      error: 'Access forbidden',
      message: 'Insufficient permissions'
    });

  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({ 
      error: 'Authorization error',
      message: 'Internal server error during authorization'
    });
  }
}

/**
 * Helper function to check if user can access baker resource
 */
export function canAccessBaker(user: JWTPayload, bakerId: string): boolean {
  if (!user) return false;
  
  // Get user ID - support both 'id' and 'userId' property names
  const userId = user.id || user.userId;
  
  // Super admin can access any baker
  if (user.role === 'super_admin') return true;
  
  // Baker can only access their own data
  if (user.role === 'baker' && userId === bakerId) return true;
  
  return false;
}

/**
 * Middleware to check if baker has access to a specific feature based on their subscription plan
 * Usage: requireFeature('bulk_email'), requireFeature('csv_export')
 */
export function requireFeature(featureName: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      // Super admins have access to all features
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Get baker's subscription plan
      const bakerId = req.user.id || req.user.userId;
      if (!bakerId) {
        return res.status(400).json({ 
          error: 'Baker ID required',
          message: 'User ID not found in authentication'
        });
      }
      const baker = await storage.getBaker(bakerId);
      if (!baker) {
        return res.status(404).json({ 
          error: 'Baker not found',
          message: 'Baker account not found'
        });
      }

      // Check if baker's plan has access to the requested feature
      const hasAccess = subscriptionManager.hasFeatureAccess(baker.subscriptionPlan, featureName);
      
      if (!hasAccess) {
        const plan = subscriptionManager.getPlan(baker.subscriptionPlan || 'starter');
        return res.status(403).json({ 
          error: 'Feature not available',
          message: `This feature requires an Enterprise plan. Your current plan is ${plan?.name || 'Starter'}.`,
          requiredPlan: 'enterprise',
          currentPlan: baker.subscriptionPlan || 'starter',
          upgradeUrl: `/billing`
        });
      }

      next();
    } catch (error) {
      console.error('Feature authorization error:', error);
      return res.status(500).json({ 
        error: 'Authorization error',
        message: 'Internal server error during feature authorization'
      });
    }
  };
}

/**
 * Middleware to check if baker has Enterprise plan
 */
export async function requireEnterprisePlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    // Super admins have access to all features
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Get baker's subscription plan
    const bakerId = req.user.id || req.user.userId;
    if (!bakerId) {
      return res.status(400).json({ 
        error: 'Baker ID required',
        message: 'User ID not found in authentication'
      });
    }
    const baker = await storage.getBaker(bakerId);
    if (!baker) {
      return res.status(404).json({ 
        error: 'Baker not found',
        message: 'Baker account not found'
      });
    }

    // Check if baker has enterprise plan
    const isEnterprise = subscriptionManager.isEnterprisePlan(baker.subscriptionPlan);
    
    if (!isEnterprise) {
      const plan = subscriptionManager.getPlan(baker.subscriptionPlan || 'starter');
      return res.status(403).json({ 
        error: 'Enterprise plan required',
        message: `This feature is only available on the Enterprise plan. Your current plan is ${plan?.name || 'Starter'}.`,
        requiredPlan: 'enterprise',
        currentPlan: baker.subscriptionPlan || 'starter',
        upgradeUrl: `/billing`
      });
    }

    next();
  } catch (error) {
    console.error('Enterprise plan check error:', error);
    return res.status(500).json({ 
      error: 'Authorization error',
      message: 'Internal server error during plan verification'
    });
  }
}

/**
 * Middleware to require specific user roles
 * Usage: requireRole('admin'), requireRole('admin', 'super_admin')
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      // Check if user's role is in the allowed roles list
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Access forbidden',
          message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
          requiredRoles: allowedRoles,
          currentRole: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      return res.status(500).json({ 
        error: 'Authorization error',
        message: 'Internal server error during role verification'
      });
    }
  };
}

export type { AuthenticatedRequest, JWTPayload };