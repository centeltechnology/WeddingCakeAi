import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_key_change_in_production';

interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  baker?: any;
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

    // Check if user is accessing their own baker data
    if (user.role === 'baker' && user.userId !== bakerId) {
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
    if (user.role === 'baker' && user.userId === bakerId) {
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

    // Load baker data to verify it exists
    const baker = await storage.getBaker(bakerId);
    if (!baker) {
      return res.status(404).json({ 
        error: 'Baker not found',
        message: 'The specified baker does not exist'
      });
    }

    // Check if user is accessing their own baker data
    if (user.role === 'baker' && user.userId !== bakerId) {
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
    if (user.role === 'baker' && user.userId === bakerId) {
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
  
  // Super admin can access any baker
  if (user.role === 'super_admin') return true;
  
  // Baker can only access their own data
  if (user.role === 'baker' && user.userId === bakerId) return true;
  
  return false;
}

export type { AuthenticatedRequest, JWTPayload };