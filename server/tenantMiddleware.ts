import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { Tenant, TenantConfiguration } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      tenantConfig?: TenantConfiguration;
    }
  }
}

export interface TenantRequest extends Request {
  tenant: Tenant;
  tenantConfig?: TenantConfiguration;
}

/**
 * Middleware to detect and load tenant information based on subdomain or custom domain
 */
export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const hostname = req.get('host') || req.hostname;
    let tenant: Tenant | undefined;
    
    // Extract subdomain or check for custom domain
    if (hostname.includes('.')) {
      const parts = hostname.split('.');
      
      // Check if it's a custom domain first
      tenant = await storage.getTenantByDomain(hostname);
      
      // If not a custom domain, check for subdomain pattern
      if (!tenant && parts.length >= 3) {
        // Extract subdomain (e.g., "venue1" from "venue1.weddingcakeai.com")
        const subdomain = parts[0];
        
        // Skip common prefixes that aren't tenant subdomains
        if (!['www', 'api', 'admin', 'app'].includes(subdomain)) {
          tenant = await storage.getTenantBySubdomain(subdomain);
        }
      }
    }
    
    // If tenant found, load configuration and attach to request
    if (tenant) {
      req.tenant = tenant;
      const config = await storage.getTenantConfiguration(tenant.id);
      if (config) {
        req.tenantConfig = config;
      }
    }
    
    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    next(); // Continue without tenant context
  }
}

/**
 * Middleware to require tenant context - returns 404 if no tenant found
 */
export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.tenant) {
    return res.status(404).json({ 
      error: 'Venue not found',
      message: 'This subdomain or domain is not associated with any venue.' 
    });
  }
  next();
}

/**
 * Middleware to inject tenant branding variables into response locals for SSR
 */
export function injectTenantBranding(req: Request, res: Response, next: NextFunction) {
  if (req.tenant && req.tenantConfig) {
    res.locals.tenant = req.tenant;
    res.locals.branding = {
      primaryColor: req.tenantConfig.primaryColor,
      secondaryColor: req.tenantConfig.secondaryColor,
      accentColor: req.tenantConfig.accentColor,
      logoUrl: req.tenantConfig.logoUrl,
      customMessages: req.tenantConfig.customMessages,
      customCss: req.tenantConfig.customCss,
    };
  } else {
    // Default branding for main platform
    res.locals.branding = {
      primaryColor: '#B8860B',
      secondaryColor: '#F5E6B3',
      accentColor: '#8B7355',
      logoUrl: null,
      customMessages: {
        heroTitle: 'Design Your Dream Wedding Cake',
        heroSubtitle: 'Connect with expert bakers and visualize your perfect cake'
      },
      customCss: null,
    };
  }
  next();
}

/**
 * Helper function to get tenant ID from request, with fallback
 */
export function getTenantId(req: Request): string | null {
  return req.tenant?.id || null;
}

/**
 * Middleware to ensure data isolation by automatically adding tenantId to request body
 */
export function enforceTenantIsolation(req: Request, res: Response, next: NextFunction) {
  const tenantId = getTenantId(req);
  
  // Add tenantId to request body for POST/PUT operations
  if (tenantId && req.body && (req.method === 'POST' || req.method === 'PUT')) {
    req.body.tenantId = tenantId;
  }
  
  next();
}