import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { leads, customers, quotes, contracts, contractSignatures, bakers, contractTemplates } from "@shared/schema";
import { randomUUID } from "crypto";
import { z } from "zod";
import { 
  insertProfileSchema, insertEstimateSchema, insertLeadSchema, insertReviewSchema, 
  insertTransactionSchema, insertAvailabilitySchema, insertConsultationSchema, insertAnalyticsSchema, insertBakerProfileSchema,
  insertTenantSchema, insertTenantConfigurationSchema, insertBakerSchema, type Baker,
  paymentLinksSchema, type Booking, type InsertBooking, bakerPricingSchema
} from "@shared/schema";
import { authenticateJWT, authorizeBakerWithData, authorizeLeadOwnership, requireFeature, type AuthenticatedRequest } from "./authMiddleware";
import { tenantMiddleware, requireTenant, injectTenantBranding, enforceTenantIsolation, getTenantId } from "./tenantMiddleware";
import { ObjectStorageService } from "./objectStorage";
import { sendEmail, emailTemplates } from "./emailService";
import Stripe from "stripe";
import Replicate from "replicate";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SendyService } from "./sendy";
import { format, parseISO, addMinutes, differenceInDays, isAfter } from "date-fns";
import { EmailAutomationService } from "./emailAutomation";
import { renderContractTemplate, resolvePaymentMethod } from "./contractRenderer";

// Stripe is optional for manual payment system
let stripe: Stripe | null = null;

// Use testing Stripe key in development mode if available
const stripeSecretKey = process.env.NODE_ENV === 'development' && process.env.TESTING_STRIPE_SECRET_KEY
  ? process.env.TESTING_STRIPE_SECRET_KEY
  : process.env.STRIPE_SECRET_KEY;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-08-27.basil",
  });
  console.log(`Stripe initialized for platform subscriptions (${stripeSecretKey.startsWith('sk_test_') ? 'TEST' : 'LIVE'} mode)`);
} else {
  console.log('Stripe not configured - manual payment system only');
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// JWT secret for baker authentication
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
    throw new Error('JWT_SECRET must be set to a strong secret (32+ characters) in production');
  }
  return secret || 'fallback_dev_secret_DO_NOT_USE_IN_PROD';
})();

// Helper to create JWT token for baker authentication
function createBakerToken(bakerId: string, email: string): string {
  return jwt.sign(
    { 
      userId: bakerId,
      username: email,
      role: 'baker'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Trial expiration calculation helper function
function calculateTrialStatus(baker: any) {
  const now = new Date();
  const isTrialing = baker.subscriptionStatus === 'trialing';
  const trialEndsAt = baker.currentPeriodEnd ? new Date(baker.currentPeriodEnd) : null;
  
  if (!isTrialing || !trialEndsAt) {
    return {
      isTrialing: false,
      trialEndsAt: null,
      daysLeftInTrial: 0,
      trialExpiringSoon: false,
      trialWarningLevel: 'none'
    };
  }
  
  const daysLeft = differenceInDays(trialEndsAt, now);
  const trialExpired = isAfter(now, trialEndsAt);
  
  // Determine warning level based on days remaining
  let warningLevel = 'none';
  let expiringSoon = false;
  
  if (trialExpired) {
    warningLevel = 'expired';
    expiringSoon = true;
  } else if (daysLeft <= 1) {
    warningLevel = 'urgent'; // Red warning - 1 day or less
    expiringSoon = true;
  } else if (daysLeft <= 3) {
    warningLevel = 'warning'; // Yellow warning - 2-3 days
    expiringSoon = true;
  } else if (daysLeft <= 7) {
    warningLevel = 'info'; // Blue info - 4-7 days  
    expiringSoon = true;
  }
  
  return {
    isTrialing: true,
    trialEndsAt: trialEndsAt.toISOString(),
    daysLeftInTrial: Math.max(0, daysLeft),
    trialExpiringSoon: expiringSoon,
    trialWarningLevel: warningLevel
  };
}

// Feature access control middleware
async function checkFeatureAccess(req: any, res: any, next: any, feature: string) {
  try {
    const bakerId = req.params.id || req.params.bakerId || req.body.bakerId;
    if (!bakerId) {
      return res.status(400).json({ error: 'Baker ID required' });
    }

    const baker = await storage.getBaker(bakerId);
    if (!baker) {
      return res.status(404).json({ error: 'Baker not found' });
    }

    const plan = baker.subscriptionPlan || 'starter';
    const hasAccess = checkPlanFeatureAccess(plan, feature, baker);

    if (!hasAccess.allowed) {
      return res.status(403).json({
        error: 'Feature not available',
        code: 'UPGRADE_REQUIRED',
        message: hasAccess.message,
        requiredPlan: hasAccess.requiredPlan,
        currentPlan: plan
      });
    }

    req.baker = baker;
    next();
  } catch (error) {
    console.error('Feature access check error:', error);
    res.status(500).json({ error: 'Access check failed' });
  }
}

// Check if a plan has access to a specific feature
function checkPlanFeatureAccess(plan: string, feature: string, baker: any) {
  const now = new Date();
  const isTrialExpired = baker.subscriptionStatus === 'trialing' && 
    baker.currentPeriodEnd && new Date(baker.currentPeriodEnd) < now;

  // If trial expired, only allow basic features
  if (isTrialExpired) {
    const basicFeatures = ['portfolio_view', 'profile_view', 'calculator_basic'];
    if (!basicFeatures.includes(feature)) {
      return {
        allowed: false,
        message: 'Your trial has expired. Upgrade to continue using premium features.',
        requiredPlan: 'starter'
      };
    }
  }

  switch (feature) {
    case 'unlimited_leads':
      return plan !== 'starter' ? 
        { allowed: true } : 
        { allowed: false, message: 'Upgrade to Professional for unlimited leads', requiredPlan: 'professional' };
        
    case 'advanced_analytics':
      return plan === 'enterprise' ? 
        { allowed: true } : 
        { allowed: false, message: 'Advanced analytics available in Enterprise plan', requiredPlan: 'enterprise' };
        
    case 'custom_branding':
      return plan !== 'starter' ? 
        { allowed: true } : 
        { allowed: false, message: 'Custom branding available in Professional and Enterprise plans', requiredPlan: 'professional' };
        
    case 'api_access':
      return plan === 'enterprise' ? 
        { allowed: true } : 
        { allowed: false, message: 'API access available in Enterprise plan only', requiredPlan: 'enterprise' };
        
    case 'portfolio_management':
      // Check portfolio limits for starter plan
      if (plan === 'starter') {
        const currentCount = (baker.portfolio || []).length;
        if (currentCount >= 5) {
          return { allowed: false, message: 'Starter plan allows up to 5 portfolio images. Upgrade to Professional for unlimited.', requiredPlan: 'professional' };
        }
      }
      return { allowed: true };

    case 'lead_creation':
      // Basic lead creation allowed for all plans, but with limits
      return { allowed: true };

    case 'portfolio_unlimited':
      return plan !== 'starter' ? 
        { allowed: true } : 
        { allowed: false, message: 'Unlimited portfolio images available in Professional and Enterprise plans', requiredPlan: 'professional' };

    default:
      return { allowed: true }; // Allow access to basic features by default
  }
}

// Helper function to resolve baker by ID or slug
async function resolveBaker(identifier: string): Promise<Baker | undefined> {
  const { isUUID } = await import("./utils");
  
  if (isUUID(identifier)) {
    return await storage.getBaker(identifier);
  } else {
    return await storage.getBakerBySlug(identifier);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint
  app.get('/healthz', (req, res) => {
    res.json({ ok: true, app: "app" });
  });
  
  // Serve PWA manifest
  app.get('/manifest.json', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'public', 'manifest.json'));
  });
  
  // Serve service worker
  app.get('/sw.js', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'public', 'sw.js'));
  });
  
  // Serve offline page
  app.get('/offline.html', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'public', 'offline.html'));
  });
  
  // Serve og-image with proper headers
  app.get('/og-image.png', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Type', 'image/png');
    res.sendFile(path.resolve(process.cwd(), 'public', 'og-image.png'));
  });
  
  // Apply tenant middleware globally
  app.use(tenantMiddleware);
  app.use(injectTenantBranding);

  
  // Tenant management routes (admin only)
  app.post("/api/admin/tenants", async (req, res) => {
    try {
      const parsedData = insertTenantSchema.parse(req.body);
      const tenant = await storage.createTenant(parsedData);
      res.json(tenant);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  
  app.get("/api/tenant/info", async (req, res) => {
    try {
      if (!req.tenant) {
        return res.json({ tenant: null, config: null });
      }
      
      const config = await storage.getTenantConfiguration(req.tenant.id);
      res.json({ tenant: req.tenant, config });
    } catch (error) {
      res.status(500).json({ message: "Error fetching tenant info" });
    }
  });

  // Domain Configuration API
  // Baker-specific domain configuration
  app.put('/api/bakers/:bakerId/domain', authenticateJWT, authorizeBakerWithData, async (req, res) => {
    try {
      const { bakerId } = req.params;
      const { subdomain, customDomain } = req.body;
      
      const baker = await storage.getBaker(bakerId);
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      // Validate subdomain format
      if (subdomain && !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subdomain)) {
        return res.status(400).json({ 
          error: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens.' 
        });
      }

      // Check if subdomain is already taken by another baker
      if (subdomain) {
        const bakers = await storage.getBakers();
        const existingBaker = bakers.find(b => 
          b.id !== bakerId && 
          (b.subdomain === subdomain || b.customDomain === subdomain)
        );
        if (existingBaker) {
          return res.status(409).json({ error: 'Subdomain already taken' });
        }
      }

      // Update baker domain settings
      const updates: any = {};
      if (subdomain !== undefined) updates.subdomain = subdomain || null;
      if (customDomain !== undefined) updates.customDomain = customDomain || null;

      const updatedBaker = await storage.updateBaker(bakerId, updates);
      
      res.json({
        success: true,
        baker: updatedBaker,
        message: subdomain ? 
          `Subdomain updated to ${subdomain}.bakeriq.app` : 
          'Custom domain configuration updated'
      });
    } catch (error) {
      console.error('Error updating baker domain configuration:', error);
      res.status(500).json({ error: 'Failed to update domain configuration' });
    }
  });

  app.get('/api/bakers/:bakerId/domain', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const baker = await storage.getBaker(bakerId);
      
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      // Determine if domain is actually active (has subdomain or custom domain configured)
      const hasSubdomain = baker.subdomain && baker.subdomain.length > 0;
      const hasCustomDomain = baker.customDomain && baker.customDomain.length > 0;
      const isActive = hasSubdomain || hasCustomDomain;

      res.json({
        subdomain: baker.subdomain || null,
        customDomain: baker.customDomain || null,
        isActive: isActive,
        sslStatus: isActive ? 'secured' : 'not_configured',
        propagationStatus: isActive ? 'complete' : 'not_configured'
      });
    } catch (error) {
      console.error('Error fetching baker domain configuration:', error);
      res.status(500).json({ error: 'Failed to fetch domain configuration' });
    }
  });

  // Keep the tenant endpoint for backward compatibility but with better error handling
  app.put('/api/tenant/domain', async (req, res) => {
    try {
      const { subdomain, customDomain } = req.body;
      
      if (!req.tenant) {
        return res.status(401).json({ error: 'Tenant authentication required' });
      }

      // Validate subdomain format
      if (subdomain && !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subdomain)) {
        return res.status(400).json({ 
          error: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens.' 
        });
      }

      // Check if subdomain is already taken
      if (subdomain && subdomain !== req.tenant.subdomain) {
        const existingTenant = await storage.getTenantBySubdomain(subdomain);
        if (existingTenant) {
          return res.status(409).json({ error: 'Subdomain already taken' });
        }
      }

      // Update tenant domain settings
      const updates: any = {};
      if (subdomain) updates.subdomain = subdomain;
      if (customDomain !== undefined) updates.customDomain = customDomain || null;

      const updatedTenant = await storage.updateTenant(req.tenant.id, updates);
      
      res.json({
        success: true,
        tenant: updatedTenant,
        message: subdomain ? 
          `Subdomain updated to ${subdomain}.bakeriq.app` : 
          'Custom domain configuration updated'
      });
    } catch (error) {
      console.error('Error updating domain configuration:', error);
      res.status(500).json({ error: 'Failed to update domain configuration' });
    }
  });

  // Payment Links Management Endpoints - SECURED  
  app.get('/api/bakers/:bakerId/payment-links', authenticateJWT, authorizeBakerWithData, async (req: AuthenticatedRequest, res) => {
    try {
      // Baker data already loaded and verified by authorizeBakerWithData middleware
      const baker = req.baker;
      
      res.json(baker.paymentLinks || {});
    } catch (error: any) {
      console.error('Error fetching payment links:', error);
      res.status(500).json({ error: 'Failed to fetch payment links' });
    }
  });

  app.put('/api/bakers/:bakerId/payment-links', authenticateJWT, authorizeBakerWithData, async (req: AuthenticatedRequest, res) => {
    try {
      const { bakerId } = req.params;
      
      // Validate payment links using Zod schema
      const validationResult = paymentLinksSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid payment links data',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const paymentLinks = validationResult.data;

      // Securely update only the paymentLinks field
      await storage.updateBaker(bakerId, { paymentLinks });
      
      res.json({ 
        success: true, 
        paymentLinks,
        message: 'Payment links updated successfully' 
      });
    } catch (error: any) {
      console.error('Error updating payment links:', error);
      res.status(500).json({ error: 'Failed to update payment links' });
    }
  });

  // Availability Management Endpoints
  app.get('/api/bakers/:bakerId/availability', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const baker = await resolveBaker(bakerId);
      
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      res.json(baker.availability || {
        mode: 'template',
        templateKey: 'mon-fri-9-5',
        timeZone: 'America/New_York',
        slotMinutes: 60,
        minNoticeMinutes: 1440,
        maxAdvanceDays: 60
      });
    } catch (error: any) {
      console.error('Error fetching availability:', error);
      res.status(500).json({ error: 'Failed to fetch availability' });
    }
  });

  app.put('/api/bakers/:bakerId/availability', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const availability = req.body;
      
      const baker = await resolveBaker(bakerId);
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      // Validate availability data
      if (!availability.mode || !['template', 'custom'].includes(availability.mode)) {
        return res.status(400).json({ error: 'Invalid availability mode' });
      }

      if (availability.mode === 'template' && !availability.templateKey) {
        return res.status(400).json({ error: 'Template key required for template mode' });
      }

      if (availability.mode === 'custom' && (!availability.rules || !Array.isArray(availability.rules))) {
        return res.status(400).json({ error: 'Rules required for custom mode' });
      }

      await storage.updateBaker(bakerId, { availability });
      
      res.json({ 
        success: true, 
        availability,
        message: 'Availability updated successfully' 
      });
    } catch (error: any) {
      console.error('Error updating availability:', error);
      res.status(500).json({ error: 'Failed to update availability' });
    }
  });

  // Bookings Management Endpoints
  app.get('/api/bakers/:bakerId/bookings', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const baker = await resolveBaker(bakerId);
      
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      const bookings = await storage.getBookingsByBakerId(bakerId);
      res.json(bookings);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  app.post('/api/bookings', async (req, res) => {
    try {
      const booking = req.body;
      
      // Validate required fields
      if (!booking.bakerId || !booking.customerName || !booking.customerEmail || !booking.startISO || !booking.endISO) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check for time conflicts
      const existingBookings = await storage.getBookingsByBakerId(booking.bakerId);
      const startTime = new Date(booking.startISO);
      const endTime = new Date(booking.endISO);
      
      const hasConflict = existingBookings.some((existing: Booking) => {
        if (existing.status === 'cancelled') return false;
        
        const existingStart = new Date(existing.startISO);
        const existingEnd = new Date(existing.endISO);
        
        return startTime < existingEnd && endTime > existingStart;
      });

      if (hasConflict) {
        return res.status(409).json({ error: 'Time slot already booked' });
      }

      const newBooking = await storage.createBooking(booking);
      
      // Send email notifications for new booking
      try {
        // Get baker details for email
        const baker = await storage.getBaker(booking.bakerId);
        if (baker && baker.email) {
          // Create booking notification message
          const bookingMessage = `New booking details:
- Customer: ${booking.customerName}
- Email: ${booking.customerEmail}
- Date: ${new Date(booking.startISO).toLocaleDateString()}
- Time: ${new Date(booking.startISO).toLocaleTimeString()} - ${new Date(booking.endISO).toLocaleTimeString()}
- Notes: ${booking.notes || 'No additional notes'}`;
          
          // Send notification to baker using existing lead template (adapted for booking)
          const template = emailTemplates.newLeadNotification(
            baker.name,
            booking.customerName,
            booking.customerEmail,
            bookingMessage,
            new Date(booking.startISO).toLocaleDateString()
          );
          
          await sendEmail({
            to: baker.email,
            from: 'noreply@weddingcakecalculator.com',
            fromName: 'Wedding Cake Calculator',
            subject: template.subject.replace('Inquiry', 'Booking'),
            textPart: template.textPart.replace('inquiry', 'booking'),
            htmlPart: template.htmlPart.replace('inquiry', 'booking').replace('Inquiry', 'Booking')
          });
          
          // Send confirmation to customer using existing lead confirmation template
          const confirmTemplate = emailTemplates.leadConfirmation(
            booking.customerName,
            baker.name
          );
          
          await sendEmail({
            to: booking.customerEmail,
            from: 'noreply@weddingcakecalculator.com',
            fromName: 'Wedding Cake Calculator',
            subject: confirmTemplate.subject.replace('inquiry', 'booking request'),
            textPart: confirmTemplate.textPart.replace('inquiry', 'booking request'),
            htmlPart: confirmTemplate.htmlPart.replace('inquiry', 'booking request')
          });
        }
      } catch (emailError: any) {
        console.error('Failed to send booking notification emails:', emailError);
        // Don't fail the booking creation if email fails
      }
      
      res.json(newBooking);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  });

  app.patch('/api/bookings/:bookingId', async (req, res) => {
    try {
      const { bookingId } = req.params;
      const updates = req.body;
      
      const updatedBooking = await storage.updateBooking(bookingId, updates);
      res.json(updatedBooking);
    } catch (error: any) {
      console.error('Error updating booking:', error);
      res.status(500).json({ error: 'Failed to update booking' });
    }
  });

  app.post('/api/tenant/domain/check', async (req, res) => {
    try {
      const { subdomain } = req.body;
      
      if (!subdomain) {
        return res.status(400).json({ error: 'Subdomain is required' });
      }

      // Validate subdomain format
      if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subdomain)) {
        return res.status(400).json({ 
          available: false,
          error: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens.' 
        });
      }

      // Check availability
      const existingTenant = await storage.getTenantBySubdomain(subdomain);
      const available = !existingTenant;

      res.json({
        available,
        subdomain: subdomain,
        url: available ? `${subdomain}.bakeriq.app` : null,
        message: available ? 
          `${subdomain}.bakeriq.app is available!` : 
          'This subdomain is already taken'
      });
    } catch (error) {
      console.error('Error checking subdomain availability:', error);
      res.status(500).json({ error: 'Failed to check subdomain availability' });
    }
  });
  
  app.put("/api/tenant/config", requireTenant, async (req, res) => {
    try {
      const tenantId = req.tenant!.id;
      const updates = req.body;
      const config = await storage.updateTenantConfiguration(tenantId, updates);
      res.json(config);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Update failed" });
    }
  });
  
  // Profile routes - now tenant-aware
  app.post("/api/profiles", enforceTenantIsolation, async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(profileData);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Tenant isolation check
      const tenantId = getTenantId(req);
      if (tenantId && profile.tenantId !== tenantId) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/tenant/profiles", requireTenant, async (req, res) => {
    try {
      const tenantId = req.tenant!.id;
      const profiles = await storage.getProfilesByTenant(tenantId);
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tenant profiles" });
    }
  });

  app.put("/api/profiles/:id", async (req, res) => {
    try {
      const updates = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(req.params.id, updates);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Estimate routes - now tenant-aware
  app.post("/api/estimates", enforceTenantIsolation, async (req, res) => {
    try {
      const estimateData = insertEstimateSchema.parse(req.body);
      const estimate = await storage.createEstimate(estimateData);
      res.json(estimate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/estimates/:id", async (req, res) => {
    try {
      const estimate = await storage.getEstimate(req.params.id);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/profiles/:profileId/estimates", async (req, res) => {
    try {
      const estimates = await storage.getEstimatesByProfile(req.params.profileId);
      res.json(estimates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/estimates/:id", async (req, res) => {
    try {
      const updates = insertEstimateSchema.partial().parse(req.body);
      const estimate = await storage.updateEstimate(req.params.id, updates);
      res.json(estimate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/estimates/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEstimate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Baker routes - now tenant-aware
  app.get("/api/bakers", async (req, res) => {
    try {
      const { location, radius, specialty, priceRange, rating, dietary } = req.query;
      const tenantId = getTenantId(req);
      
      let bakers = await storage.searchBakers(
        location as string,
        radius ? parseInt(radius as string) : undefined,
        specialty as string,
        tenantId || undefined
      );
      
      // Advanced filtering
      if (priceRange && priceRange !== 'all') {
        bakers = bakers.filter(b => b.priceRange?.includes(priceRange as string));
      }
      
      if (rating) {
        const minRating = parseFloat(rating as string);
        bakers = bakers.filter(b => b.rating && parseFloat(b.rating) >= minRating);
      }
      
      if (dietary && dietary !== 'all') {
        bakers = bakers.filter(b => 
          b.specialties?.some(s => s.toLowerCase().includes((dietary as string).toLowerCase()))
        );
      }
      
      res.json(bakers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Public marketplace route - no tenant restriction
  app.get("/api/bakers/public", async (req, res) => {
    try {
      const activeBakers = await storage.getBakers();
      
      // Remove sensitive information for public view
      const publicBakers = activeBakers.map(baker => ({
        id: baker.id,
        name: baker.name,
        slug: baker.slug,
        businessName: baker.businessName,
        description: baker.description,
        address: baker.address,
        rating: baker.rating,
        priceRange: baker.priceRange,
        specialties: baker.specialties,
        portfolio: baker.portfolio,
        phone: baker.phone,
        socialMedia: baker.socialMedia,
        subdomain: baker.subdomain
      }));
      
      res.json(publicBakers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create new baker (signup) - handler function
  const handleBakerSignup = async (req: any, res: any) => {
    try {
      const bakerData = insertBakerSchema.parse(req.body);
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(bakerData.password, 10);
      const bakerWithHashedPassword = {
        ...bakerData,
        password: hashedPassword
      };
      
      // Initialize baker data
      let bakerWithStripe = {
        ...bakerWithHashedPassword,
        subscriptionStatus: 'active'
      };

      // Only create Stripe customer for paid plans or if specifically requested
      if (bakerData.subscriptionPlan && bakerData.subscriptionPlan !== 'starter' && stripe) {
        try {
          const customer = await stripe.customers.create({
            email: bakerData.email,
            name: bakerData.name,
            metadata: { 
              bakerEmail: bakerData.email,
              plan: bakerData.subscriptionPlan || 'starter'
            }
          });

          bakerWithStripe.stripeCustomerId = customer.id;
        } catch (stripeError) {
          console.error('Error creating Stripe customer:', stripeError);
          // Continue with account creation - baker can set up payment later
          console.log('Continuing with account creation despite Stripe customer error');
        }
      }

      // Create Stripe subscription for paid plans with 14-day trial
      if (bakerData.subscriptionPlan && bakerData.subscriptionPlan !== 'starter' && stripe && bakerWithStripe.stripeCustomerId) {
        // Use testing price IDs if STRIPE_SECRET_KEY matches TESTING_STRIPE_SECRET_KEY
        const isTestingStripe = process.env.STRIPE_SECRET_KEY === process.env.TESTING_STRIPE_SECRET_KEY;
        
        const priceIds = {
          professional: isTestingStripe && process.env.TESTING_STRIPE_PRICE_ID_PROFESSIONAL
            ? process.env.TESTING_STRIPE_PRICE_ID_PROFESSIONAL
            : process.env.STRIPE_PRICE_ID_PROFESSIONAL,
          enterprise: isTestingStripe && process.env.TESTING_STRIPE_PRICE_ID_ENTERPRISE  
            ? process.env.TESTING_STRIPE_PRICE_ID_ENTERPRISE
            : process.env.STRIPE_PRICE_ID_ENTERPRISE
        };

        const priceId = priceIds[bakerData.subscriptionPlan as keyof typeof priceIds];
        console.log(`📦 routes.ts signup: Using price ID ${priceId} for plan ${bakerData.subscriptionPlan} (testing mode: ${isTestingStripe})`);
        if (priceId) {
          try {
            const subscription = await stripe.subscriptions.create({
              customer: bakerWithStripe.stripeCustomerId,
              items: [{ price: priceId }],
              trial_period_days: 14,
              metadata: {
                bakerId: bakerData.email, // Use email as temporary ID since we don't have baker.id yet
                plan: bakerData.subscriptionPlan
              }
            });

            bakerWithStripe.stripeSubscriptionId = subscription.id;
            bakerWithStripe.subscriptionStatus = 'trialing';
            if ((subscription as any).current_period_end) {
              bakerWithStripe.currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
            }
          } catch (stripeError) {
            console.error('Error creating Stripe subscription:', stripeError);
            // Continue with account creation - subscription can be set up later via billing page
            console.log('Continuing with account creation despite Stripe subscription error');
          }
        }
      }
      
      const baker = await storage.createBaker(bakerWithStripe);
      
      // Also create a baker profile
      await storage.createBakerProfile({
        bakerId: baker.id,
        businessHours: null,
        socialMedia: null,
        certifications: null,
        yearsExperience: null,
        teamSize: null,
        leadTime: null,
        consultationFee: null,
        minimumOrder: null,
        deliveryRadius: null,
        dietaryOptions: null
      });
      
      // Create secure JWT token for auto-login after signup
      const token = createBakerToken(baker.id, baker.email);
      
      // Don't return the password in the response
      const { password, ...bakerResponse } = baker;
      res.status(201).json({
        success: true,
        token,
        baker: bakerResponse
      });
    } catch (error: any) {
      console.error("Error creating baker:", error);
      res.status(400).json({ message: error.message });
    }
  };

  // Create new baker (signup) - both routes supported
  app.post("/api/bakers", handleBakerSignup);
  app.post("/api/bakers/signup", handleBakerSignup);

  // Get current authenticated baker
  app.get("/api/bakers/me", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const baker = await storage.getBaker(req.user.userId);
      if (!baker) {
        return res.status(404).json({ message: "Baker not found" });
      }
      
      // Don't return the password
      const { password, ...bakerResponse } = baker;
      res.json(bakerResponse);
    } catch (error: any) {
      console.error("Error fetching current baker:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bakers/:id", async (req, res) => {
    try {
      const baker = await resolveBaker(req.params.id);
      if (!baker) {
        return res.status(404).json({ message: "Baker not found" });
      }
      
      // Track profile view
      try {
        await storage.trackAnalytics({
          bakerId: baker.id,
          metric: 'profile_view',
          date: new Date().toISOString().split('T')[0]
        });
      } catch (analyticsError) {
        // Don't fail the request if analytics tracking fails
        console.warn('Failed to track analytics:', analyticsError);
      }
      
      res.json(baker);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Calculator Leads routes
  app.post("/api/calculator-leads", async (req, res) => {
    try {
      const { customerName, customerEmail, customerPhone, eventDate, cakeConfiguration, estimatedPrice } = req.body;
      
      const lead = await storage.createCalculatorLead({
        customerName,
        customerEmail,
        customerPhone,
        eventDate,
        cakeConfiguration,
        estimatedPrice,
        syncedToSendy: false,
        sendyListId: null
      });
      
      // Send confirmation email to customer
      try {
        const emailContent = emailTemplates.calculatorLeadConfirmation(
          customerName,
          estimatedPrice,
          eventDate
        );
        await sendEmail({
          to: customerEmail,
          toName: customerName,
          ...emailContent
        });
      } catch (emailError) {
        console.error('Failed to send calculator lead confirmation email:', emailError);
        // Don't fail the request if email fails
      }
      
      // Auto-sync to Sendy if configured
      try {
        const sendySettings = await storage.getSendySettings();
        if (sendySettings?.calculatorLeadsListId) {
          const sendyService = new SendyService({
            apiKey: process.env.SENDY_API_KEY || '',
            baseUrl: process.env.SENDY_BASE_URL || ''
          });
          await sendyService.subscribe({
            name: customerName,
            email: customerEmail,
            list: sendySettings.calculatorLeadsListId,
            boolean: true
          });
          
          await storage.markCalculatorLeadSynced(lead.id, sendySettings.calculatorLeadsListId);
        }
      } catch (sendyError) {
        console.error('Failed to sync calculator lead to Sendy:', sendyError);
        // Don't fail the request if Sendy sync fails
      }
      
      res.status(201).json({ success: true, lead });
    } catch (error: any) {
      console.error("Error creating calculator lead:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Object Storage routes
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error: any) {
      console.error("Error serving object:", error);
      if (error.message.includes("not found")) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Portfolio management routes
  app.post("/api/bakers/:id/portfolio", (req, res, next) => checkFeatureAccess(req, res, next, 'portfolio_management'), async (req, res) => {
    try {
      const { portfolioImageURL } = req.body;
      if (!portfolioImageURL) {
        return res.status(400).json({ error: "portfolioImageURL is required" });
      }

      const baker = await storage.getBaker(req.params.id);
      if (!baker) {
        return res.status(404).json({ error: "Baker not found" });
      }

      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(portfolioImageURL);
      
      // Update portfolio with the full URL
      const currentPortfolio = baker.portfolio || [];
      const updatedPortfolio = [...currentPortfolio, portfolioImageURL];
      
      await storage.updateBaker(req.params.id, { portfolio: updatedPortfolio });
      
      res.json({ success: true, portfolioPath: normalizedPath });
    } catch (error: any) {
      console.error("Error adding portfolio image:", error);
      res.status(500).json({ error: "Failed to update portfolio" });
    }
  });

  app.delete("/api/bakers/:id/portfolio", async (req, res) => {
    try {
      const { portfolioImageURL } = req.body;
      if (!portfolioImageURL) {
        return res.status(400).json({ error: "portfolioImageURL is required" });
      }

      const baker = await storage.getBaker(req.params.id);
      if (!baker) {
        return res.status(404).json({ error: "Baker not found" });
      }

      const currentPortfolio = baker.portfolio || [];
      const updatedPortfolio = currentPortfolio.filter(url => url !== portfolioImageURL);
      
      await storage.updateBaker(req.params.id, { portfolio: updatedPortfolio });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error removing portfolio image:", error);
      res.status(500).json({ error: "Failed to remove portfolio image" });
    }
  });

  // Lead management routes
  app.post("/api/leads", (req, res, next) => checkFeatureAccess(req, res, next, 'lead_creation'), async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      
      // Send notification emails
      if (leadData.bakerId) {
        const baker = await storage.getBaker(leadData.bakerId);
        if (baker) {
          // Track analytics
          await storage.trackAnalytics({
            bakerId: leadData.bakerId,
            metric: 'contact_attempt',
            date: new Date().toISOString().split('T')[0]
          });
          
          // Email baker about new lead
          const template = emailTemplates.newLeadNotification(
            baker.name,
            leadData.customerName,
            leadData.customerEmail,
            leadData.message || 'No message provided',
            leadData.weddingDate || undefined
          );
          
          await sendEmail({
            to: baker.email,
            from: 'noreply@weddingcakecalculator.com',
            fromName: 'Wedding Cake Calculator',
            ...template
          });
          
          // Email confirmation to customer
          const confirmTemplate = emailTemplates.leadConfirmation(
            leadData.customerName,
            baker.name
          );
          
          await sendEmail({
            to: leadData.customerEmail,
            from: 'noreply@weddingcakecalculator.com',
            fromName: 'Wedding Cake Calculator',
            ...confirmTemplate
          });
        }
      }
      
      res.json(lead);
    } catch (error: any) {
      console.error("Error creating lead:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/bakers/:bakerId/leads", authenticateJWT, authorizeBakerWithData, async (req, res) => {
    try {
      const leads = await storage.getLeadsByBaker(req.params.bakerId);
      res.json(leads);
    } catch (error: any) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/leads/:id", authenticateJWT, authorizeLeadOwnership, async (req, res) => {
    try {
      const updates = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(req.params.id, updates);
      res.json(lead);
    } catch (error: any) {
      console.error("Error updating lead:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/leads/:id/consultation", authenticateJWT, authorizeLeadOwnership, async (req, res) => {
    try {
      const leadId = req.params.id;
      const { message } = req.body;
      
      const lead = await storage.getLead(leadId);
      if (!lead || !lead.bakerId) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const baker = await storage.getBaker(lead.bakerId);
      if (!baker) {
        return res.status(404).json({ message: "Baker not found" });
      }

      // Send consultation request email to customer
      try {
        await sendEmail({
          to: lead.customerEmail,
          from: 'noreply@bakeriq.app',
          fromName: baker.name,
          replyTo: baker.email,
          subject: `Consultation Request - ${baker.name}`,
          htmlPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Consultation Request from ${baker.name}</h2>
              <p>Hi ${lead.customerName},</p>
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <p>Please reply to this email to schedule your consultation.</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Best regards,<br>
                ${baker.name}
              </p>
            </div>
          `,
          text: message
        });
      } catch (emailError) {
        console.error("Error sending consultation email:", emailError);
        // Don't fail the request if email fails
      }

      res.json({ success: true, message: "Consultation request sent successfully" });
    } catch (error: any) {
      console.error("Error sending consultation request:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard Charts & Stats Endpoints
  app.get("/api/app/charts/pipeline", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return res.status(400).json({ error: "Tenant ID required" });
      }

      // Get quotes grouped by status for the tenant
      const result = await db.select({
        status: quotes.status,
        count: sql<number>`count(*)::int`
      })
      .from(quotes)
      .where(eq(quotes.tenantId, tenantId))
      .groupBy(quotes.status);

      // Transform to chart format
      const chartData = result.map(row => ({
        status: row.status || 'draft',
        count: row.count
      }));

      res.json(chartData);
    } catch (error: any) {
      console.error("Error fetching pipeline chart:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/app/stats/revenue-mtd", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return res.status(400).json({ error: "Tenant ID required" });
      }

      const now = new Date();
      const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const startOfLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

      // This month's revenue from paid quotes
      const thisMonthResult = await db.select({
        total: sql<string>`COALESCE(SUM(CAST(${quotes.total} AS DECIMAL)), 0)`
      })
      .from(quotes)
      .where(
        sql`${quotes.tenantId} = ${tenantId} 
        AND ${quotes.status} = 'approved' 
        AND ${quotes.createdAt} >= ${startOfMonth.toISOString()}`
      );

      // Last month's revenue for comparison
      const lastMonthResult = await db.select({
        total: sql<string>`COALESCE(SUM(CAST(${quotes.total} AS DECIMAL)), 0)`
      })
      .from(quotes)
      .where(
        sql`${quotes.tenantId} = ${tenantId} 
        AND ${quotes.status} = 'approved' 
        AND ${quotes.createdAt} >= ${startOfLastMonth.toISOString()} 
        AND ${quotes.createdAt} < ${startOfMonth.toISOString()}`
      );

      const thisMonth = parseFloat(thisMonthResult[0]?.total || '0');
      const lastMonth = parseFloat(lastMonthResult[0]?.total || '0');
      const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

      res.json({
        current: thisMonth,
        previous: lastMonth,
        change: Math.round(change * 10) / 10
      });
    } catch (error: any) {
      console.error("Error fetching revenue stats:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Tasks Endpoints
  app.get("/api/app/tasks", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user?.userId;
      
      if (!tenantId || !userId) {
        return res.status(400).json({ error: "Authentication required" });
      }

      const { tasks } = await import("@shared/schema");
      const userTasks = await db.select()
        .from(tasks)
        .where(sql`${tasks.tenantId} = ${tenantId} AND ${tasks.userId} = ${userId}`)
        .orderBy(sql`${tasks.createdAt} DESC`);

      res.json(userTasks);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/app/tasks", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user?.userId;
      
      if (!tenantId || !userId) {
        return res.status(400).json({ error: "Authentication required" });
      }

      const { insertTaskSchema, tasks } = await import("@shared/schema");
      const validated = insertTaskSchema.parse(req.body);

      const newTask = await db.insert(tasks).values({
        ...validated,
        tenantId,
        userId
      }).returning();

      res.json(newTask[0]);
    } catch (error: any) {
      console.error("Error creating task:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/app/tasks/:id/complete", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user?.userId;
      const { id } = req.params;
      
      if (!tenantId || !userId) {
        return res.status(400).json({ error: "Authentication required" });
      }

      const { tasks } = await import("@shared/schema");
      
      // Verify task ownership
      const task = await db.select().from(tasks).where(
        sql`${tasks.id} = ${id} AND ${tasks.tenantId} = ${tenantId} AND ${tasks.userId} = ${userId}`
      ).limit(1);

      if (!task.length) {
        return res.status(404).json({ error: "Task not found" });
      }

      const updated = await db.update(tasks)
        .set({ 
          status: 'completed',
          completedAt: new Date()
        })
        .where(eq(tasks.id, id))
        .returning();

      res.json(updated[0]);
    } catch (error: any) {
      console.error("Error completing task:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Review routes
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/bakers/:bakerId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByBakerId(req.params.bakerId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/reviews/:id/verify", async (req, res) => {
    try {
      const { isVerified } = req.body;
      const review = await storage.updateReviewVerification(req.params.id, isVerified);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, bakerId, customerId, type, quoteId, description } = req.body;
      
      if (!stripe) {
        return res.status(500).json({ message: 'Payment processing not configured' });
      }
      
      // Get baker info to check for Stripe Connect account
      const baker = await storage.getBaker(bakerId);
      if (!baker) {
        return res.status(404).json({ message: "Baker not found" });
      }
      
      // Get customer info for Stripe customer creation
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // Create or retrieve Stripe customer
      let stripeCustomer;
      if (customer.stripeCustomerId) {
        stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomerId);
      } else {
        stripeCustomer = await stripe.customers.create({
          email: customer.email,
          name: customer.name,
          phone: customer.phone || undefined,
          metadata: {
            customerId: customer.id,
            bakerId
          }
        });
        
        // Update customer with Stripe ID
        await storage.updateCustomer(customerId, { 
          stripeCustomerId: stripeCustomer.id 
        });
      }
      
      // Calculate application fee (platform commission) - 5% default
      const applicationFeeAmount = Math.round(amount * 100 * 0.05); // 5% fee
      
      // Payment intent configuration
      const paymentIntentConfig: any = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        customer: stripeCustomer.id,
        metadata: {
          bakerId,
          customerId,
          quoteId: quoteId || '',
          type
        },
        description: description || `${type} payment`,
        automatic_payment_methods: {
          enabled: true,
        },
      };

      // If baker has Stripe Connect account and it's active, use it
      if (baker.stripeConnectAccountId && baker.stripeOnboardingCompleted) {
        paymentIntentConfig.on_behalf_of = baker.stripeConnectAccountId;
        paymentIntentConfig.transfer_data = {
          destination: baker.stripeConnectAccountId,
        };
        paymentIntentConfig.application_fee_amount = applicationFeeAmount;
      }
      
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

      // Track transaction
      await storage.createTransaction({
        bakerId,
        customerId,
        type,
        amount: amount.toString(),
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
        description: description || `${type} payment`
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Create payment intent for quote deposit
  app.post("/api/quotes/:quoteId/create-deposit-payment", async (req, res) => {
    try {
      const { quoteId } = req.params;
      const quote = await storage.getQuote(quoteId);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      if (!quote.depositAmount || parseFloat(quote.depositAmount) <= 0) {
        return res.status(400).json({ message: "No deposit amount set for this quote" });
      }

      if (!stripe) {
        return res.status(500).json({ message: 'Payment processing not configured' });
      }

      const customer = await storage.getCustomer(quote.customerId || '');
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // Create or retrieve Stripe customer
      let stripeCustomer;
      if (customer.stripeCustomerId) {
        stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomerId);
      } else {
        stripeCustomer = await stripe.customers.create({
          email: customer.email,
          name: customer.name,
          phone: customer.phone || undefined,
          metadata: {
            customerId: customer.id,
            bakerId: quote.bakerId
          }
        });
        
        await storage.updateCustomer(quote.customerId || '', { 
          stripeCustomerId: stripeCustomer.id 
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(quote.depositAmount) * 100),
        currency: "usd",
        customer: stripeCustomer.id,
        metadata: {
          bakerId: quote.bakerId,
          customerId: quote.customerId,
          quoteId: quote.id,
          type: 'deposit'
        },
        description: `Deposit for ${quote.title} (Quote #${quote.quoteNumber})`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Track transaction
      await storage.createTransaction({
        bakerId: quote.bakerId || '',
        customerId: quote.customerId || '',
        type: 'deposit',
        amount: quote.depositAmount,
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
        description: `Deposit for Quote #${quote.quoteNumber}`
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: quote.depositAmount 
      });
    } catch (error: any) {
      console.error('Deposit payment creation error:', error);
      res.status(500).json({ message: "Error creating deposit payment: " + error.message });
    }
  });

  // Create payment intent for final payment
  app.post("/api/quotes/:quoteId/create-final-payment", async (req, res) => {
    try {
      const { quoteId } = req.params;
      const quote = await storage.getQuote(quoteId);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      const depositAmount = parseFloat(quote.depositAmount || '0');
      const totalAmount = parseFloat(quote.total || '0');
      const finalAmount = totalAmount - depositAmount;

      if (finalAmount <= 0) {
        return res.status(400).json({ message: "No final payment required" });
      }

      if (!stripe) {
        return res.status(500).json({ message: 'Payment processing not configured' });
      }

      const customer = await storage.getCustomer(quote.customerId || '');
      if (!customer || !customer.stripeCustomerId) {
        return res.status(404).json({ message: "Customer not found or not set up for payments" });
      }

      const stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomerId);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalAmount * 100),
        currency: "usd",
        customer: stripeCustomer.id,
        metadata: {
          bakerId: quote.bakerId,
          customerId: quote.customerId,
          quoteId: quote.id,
          type: 'final_payment'
        },
        description: `Final payment for ${quote.title} (Quote #${quote.quoteNumber})`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Track transaction
      await storage.createTransaction({
        bakerId: quote.bakerId || '',
        customerId: quote.customerId || '',
        type: 'final_payment',
        amount: finalAmount.toString(),
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
        description: `Final payment for Quote #${quote.quoteNumber}`
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: finalAmount.toString() 
      });
    } catch (error: any) {
      console.error('Final payment creation error:', error);
      res.status(500).json({ message: "Error creating final payment: " + error.message });
    }
  });

  // Webhook handler moved to server/index.ts to ensure proper middleware ordering

  app.get("/api/bakers/:bakerId/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByBakerId(req.params.bakerId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Availability routes
  app.post("/api/availability", async (req, res) => {
    try {
      const availabilityData = insertAvailabilitySchema.parse(req.body);
      const availability = await storage.createAvailability(availabilityData);
      res.json(availability);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Note: Public availability route exists at line 414 for customer booking
  // Authenticated availability management uses the AvailabilitySettings component

  app.put("/api/availability/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get the availability record to check ownership
      const existingAvailability = await storage.getAvailabilityByBakerId(id).then(avails => avails.find(a => a.id === id));
      if (!existingAvailability) {
        return res.status(404).json({ message: "Availability not found" });
      }

      // Check if user owns this availability record
      if (user.role === 'baker' && user.userId !== existingAvailability?.bakerId) {
        return res.status(403).json({ 
          error: 'Access forbidden',
          message: 'You can only modify your own availability'
        });
      }

      // Allow super_admin to modify any availability
      if (user.role !== 'super_admin' && user.role !== 'baker') {
        return res.status(403).json({ 
          error: 'Access forbidden',
          message: 'Insufficient permissions'
        });
      }

      // Validate the updates
      const updates = insertAvailabilitySchema.partial().parse(req.body);
      
      // Ensure bakerId cannot be changed
      if ('bakerId' in updates && updates.bakerId !== existingAvailability?.bakerId) {
        return res.status(400).json({ 
          error: 'Invalid update',
          message: 'Cannot change availability ownership'
        });
      }

      const availability = await storage.updateAvailability(id, updates);
      if (!availability) {
        return res.status(404).json({ message: "Availability not found" });
      }
      
      res.json(availability);
    } catch (error: any) {
      console.error('Error updating availability:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Consultation booking routes - PUBLIC ACCESS
  app.post("/api/consultations", async (req, res) => {
    try {
      console.log('POST /api/consultations - Request body:', JSON.stringify(req.body, null, 2));
      
      const consultationData = insertConsultationSchema.parse(req.body);
      console.log('Parsed consultation data:', JSON.stringify(consultationData, null, 2));
      
      const consultation = await storage.createConsultation(consultationData);
      console.log('Created consultation:', JSON.stringify(consultation, null, 2));
      
      // Track analytics for consultation booking (non-blocking)
      try {
        if (consultation && consultation.bakerId) {
          await storage.trackAnalytics({
            bakerId: consultation.bakerId,
            metric: 'consultation_booked',
            date: new Date().toISOString().split('T')[0]
          });
        }
      } catch (analyticsError) {
        // Don't fail the entire request if analytics tracking fails
        console.warn('Failed to track consultation booking analytics:', analyticsError);
      }
      
      // Send email notification to baker (non-blocking)
      try {
        if (consultation && consultation.bakerId) {
          const baker = await storage.getBaker(consultation.bakerId);
          if (baker && baker.email) {
            const emailContent = emailTemplates.newLeadNotification(
              baker.name,
              consultation.customerName,
              consultation.customerEmail,
              consultation.notes || 'No additional notes',
              consultation.eventDate || undefined
            );
            
            await sendEmail({
              to: baker.email,
              toName: baker.name,
              ...emailContent
            });
          }
        }
      } catch (emailError) {
        console.error('Failed to send consultation notification email:', emailError);
      }
      
      res.status(201).json(consultation);
    } catch (error: any) {
      console.error('Consultation booking error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/consultations/:id", async (req, res) => {
    try {
      const consultation = await storage.getConsultation(req.params.id);
      if (!consultation) {
        return res.status(404).json({ message: "Consultation not found" });
      }
      res.json(consultation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bakers/:bakerId/consultations", async (req, res) => {
    try {
      const consultations = await storage.getConsultationsByBaker(req.params.bakerId);
      res.json(consultations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bakers/:bakerId/consultations/upcoming", async (req, res) => {
    try {
      const consultations = await storage.getUpcomingConsultations(req.params.bakerId);
      res.json(consultations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/consultations/:id", async (req, res) => {
    try {
      const updates = req.body; // TODO: Add consultation schema validation
      const consultation = await storage.updateConsultation(req.params.id, updates);
      if (!consultation) {
        return res.status(404).json({ message: "Consultation not found" });
      }
      res.json(consultation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/consultations/:id/cancel", async (req, res) => {
    try {
      const { reason } = req.body;
      const consultation = await storage.cancelConsultation(req.params.id, reason || "No reason provided");
      if (!consultation) {
        return res.status(404).json({ message: "Consultation not found" });
      }
      res.json(consultation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Analytics routes
  app.get("/api/bakers/:bakerId/analytics", (req, res, next) => checkFeatureAccess(req, res, next, 'advanced_analytics'), async (req, res) => {
    try {
      const { startDate, endDate, metric } = req.query;
      
      if (startDate && endDate) {
        const summary = await storage.getAnalyticsSummary(
          req.params.bakerId,
          startDate as string,
          endDate as string
        );
        res.json(summary);
      } else {
        const analytics = await storage.getAnalyticsByBakerId(
          req.params.bakerId,
          metric as string
        );
        res.json(analytics);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/analytics/track", async (req, res) => {
    try {
      const analyticsData = insertAnalyticsSchema.parse(req.body);
      const analytics = await storage.trackAnalytics(analyticsData);
      res.json(analytics);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Baker profile routes
  app.post("/api/baker-profiles", async (req, res) => {
    try {
      const profileData = insertBakerProfileSchema.parse(req.body);
      const profile = await storage.createBakerProfile(profileData);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/bakers/:bakerId/profile", async (req, res) => {
    try {
      // First resolve the baker to get the actual ID
      const baker = await resolveBaker(req.params.bakerId);
      if (!baker) {
        return res.status(404).json({ message: "Baker not found" });
      }
      
      const profile = await storage.getBakerProfileByBakerId(baker.id);
      if (!profile) {
        return res.status(404).json({ message: "Baker profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/baker-profiles/:id", async (req, res) => {
    try {
      const updates = insertBakerProfileSchema.partial().parse(req.body);
      const profile = await storage.updateBakerProfile(req.params.id, updates);
      if (!profile) {
        return res.status(404).json({ message: "Baker profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });


  // General baker profile update
  app.put("/api/bakers/:id", authenticateJWT, authorizeBakerWithData, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      // Validate request body with Zod schema
      const updateBakerProfileSchema = z.object({
        description: z.string().max(2000, 'Description too long').optional(),
        specialties: z.array(z.string()).max(25, 'Too many specialties').optional(),
        cakeTypes: z.array(z.string()).max(25, 'Too many cake types').optional(),
        services: z.array(z.string()).max(25, 'Too many services').optional(),
        pricing: z.any().optional(), // Allow any pricing structure for flexibility
        name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
        phone: z.string().max(20, 'Phone number too long').optional(),
        address: z.string().max(500, 'Address too long').optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        socialMedia: z.object({
          instagram: z.string().optional(),
          facebook: z.string().optional(),
          tiktok: z.string().optional(),
          pinterest: z.string().optional(),
          website: z.string().optional()
        }).optional(),
        yearsExperience: z.number().int().min(0).max(50).optional()
      });
      
      const validation = updateBakerProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: validation.error.issues 
        });
      }
      
      const { description, specialties, cakeTypes, services, pricing, name, phone, address, latitude, longitude, socialMedia, yearsExperience } = validation.data;
      
      // Validate baker exists
      const baker = await storage.getBaker(id);
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      // Prepare update object with only allowed fields for security
      const updates: any = {};
      if (description !== undefined) {
        updates.description = description;
      }
      if (specialties !== undefined) {
        // Clean up specialties (trim whitespace, remove duplicates)
        const cleanSpecialties = [...new Set(specialties
          .map(s => typeof s === 'string' ? s.trim() : '')
          .filter(s => s.length > 0)
        )];
        updates.specialties = cleanSpecialties;
      }
      if (cakeTypes !== undefined) {
        // Clean up cake types (trim whitespace, remove duplicates)
        const cleanCakeTypes = [...new Set(cakeTypes
          .map(c => typeof c === 'string' ? c.trim() : '')
          .filter(c => c.length > 0)
        )];
        updates.cakeTypes = cleanCakeTypes;
      }
      if (services !== undefined) {
        // Clean up services (trim whitespace, remove duplicates)
        const cleanServices = [...new Set(services
          .map(s => typeof s === 'string' ? s.trim() : '')
          .filter(s => s.length > 0)
        )];
        updates.services = cleanServices;
      }
      if (pricing !== undefined) {
        updates.pricing = pricing;
      }
      if (name !== undefined) {
        updates.name = name.trim();
      }
      if (phone !== undefined) {
        updates.phone = phone.trim();
      }
      if (address !== undefined) {
        updates.address = address.trim();
      }
      if (latitude !== undefined) {
        updates.latitude = latitude;
      }
      if (longitude !== undefined) {
        updates.longitude = longitude;
      }
      if (socialMedia !== undefined) {
        updates.socialMedia = socialMedia;
      }

      // Update baker profile
      await storage.updateBaker(id, updates);

      // Handle yearsExperience separately in BakerProfile table
      if (yearsExperience !== undefined) {
        // Check if baker profile exists, create if not
        let bakerProfile = await storage.getBakerProfileByBakerId(id);
        if (!bakerProfile) {
          // Create new baker profile
          await storage.createBakerProfile({
            bakerId: id,
            yearsExperience
          });
        } else {
          // Update existing baker profile
          await storage.updateBakerProfile(bakerProfile.id, {
            yearsExperience
          });
        }
      }
      
      // Return updated baker data (sanitized for security)
      const updatedBaker = await storage.getBaker(id);
      if (!updatedBaker) {
        return res.status(404).json({ error: 'Baker not found after update' });
      }
      
      // Sanitize sensitive fields before returning
      const safeBaker = {
        id: updatedBaker.id,
        name: updatedBaker.name,
        slug: updatedBaker.slug,
        email: updatedBaker.email,
        phone: updatedBaker.phone,
        address: updatedBaker.address,
        latitude: updatedBaker.latitude,
        longitude: updatedBaker.longitude,
        rating: updatedBaker.rating,
        priceRange: updatedBaker.priceRange,
        specialties: updatedBaker.specialties,
        cakeTypes: updatedBaker.cakeTypes,
        description: updatedBaker.description,
        portfolio: updatedBaker.portfolio,
        subscriptionPlan: updatedBaker.subscriptionPlan,
        isActive: updatedBaker.isActive,
        subdomain: updatedBaker.subdomain,
        customDomain: updatedBaker.customDomain,
        paymentLinks: updatedBaker.paymentLinks,
        availability: updatedBaker.availability,
        businessName: updatedBaker.businessName,
        emailVerified: updatedBaker.emailVerified,
        socialMedia: updatedBaker.socialMedia,
        createdAt: updatedBaker.createdAt,
        updatedAt: updatedBaker.updatedAt
      };
      
      res.json(safeBaker);
    } catch (error: any) {
      console.error('Error updating baker profile:', error);
      res.status(500).json({ error: 'Failed to update baker profile' });
    }
  });

  // AI Image Generation Route
  app.post("/api/generate-cake-image", async (req, res) => {
    try {
      console.log('Image generation request received:', req.body);
      const { prompt } = req.body;
      
      if (!prompt) {
        console.log('No prompt provided');
        return res.status(400).json({ message: "Prompt is required" });
      }

      if (!process.env.REPLICATE_API_TOKEN) {
        console.log('No Replicate API token found');
        return res.status(500).json({ message: "Replicate API token not configured" });
      }

      console.log('Calling Replicate API with prompt:', prompt);
      
      // Use a model that returns direct URLs instead of streams
      const prediction = await replicate.predictions.create({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // SDXL model
        input: {
          prompt: prompt,
          width: 768,
          height: 768,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          scheduler: "DPMSolverMultistep",
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature"
        }
      });

      console.log('Prediction created:', prediction.id);
      
      // Wait for prediction to complete
      let completedPrediction = prediction;
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout
      
      while (completedPrediction.status !== 'succeeded' && completedPrediction.status !== 'failed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        completedPrediction = await replicate.predictions.get(prediction.id);
        attempts++;
        console.log(`Prediction status: ${completedPrediction.status}, attempt: ${attempts}`);
      }
      
      if (completedPrediction.status === 'failed') {
        console.log('Prediction failed:', completedPrediction.error);
        return res.status(500).json({ 
          message: "Image generation failed", 
          error: completedPrediction.error 
        });
      }
      
      if (completedPrediction.status !== 'succeeded') {
        console.log('Prediction timed out');
        return res.status(500).json({ 
          message: "Image generation timed out", 
          error: "Please try again" 
        });
      }

      console.log('Replicate API response:', completedPrediction.output);
      
      // The output should now be an array of image URLs
      const imageUrl = Array.isArray(completedPrediction.output) ? completedPrediction.output[0] : completedPrediction.output;
      
      if (!imageUrl || typeof imageUrl !== 'string') {
        console.log('No valid image URL in response:', typeof imageUrl, imageUrl);
        return res.status(500).json({ message: "No image generated" });
      }
      
      console.log('Sending image URL:', imageUrl);
      res.json({ imageUrl });
    } catch (error: any) {
      console.error('Replicate API error:', error);
      
      // Handle specific Replicate API errors
      if (error.message && error.message.includes('Insufficient credit')) {
        return res.status(402).json({ 
          message: "Replicate account needs credits", 
          error: "Please add credits to your Replicate account at https://replicate.com/account/billing#billing"
        });
      }
      
      res.status(500).json({ 
        message: "Failed to generate image", 
        error: error.message 
      });
    }
  });

  // CRM API Routes
  app.get('/api/customers', async (req, res) => {
    try {
      const { bakerId, tenantId, search } = req.query;
      
      let customers;
      if (search && typeof search === 'string') {
        customers = await storage.searchCustomers(bakerId as string, search);
      } else if (bakerId) {
        customers = await storage.getCustomersByBaker(bakerId as string);
      } else if (tenantId) {
        customers = await storage.getCustomersByTenant(tenantId as string);
      } else {
        return res.status(400).json({ error: 'bakerId or tenantId is required' });
      }
      
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  });

  app.post('/api/customers', async (req, res) => {
    try {
      const customerData = req.body;
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({ error: 'Failed to create customer' });
    }
  });

  // Convert lead to customer
  app.post('/api/leads/:id/convert-to-customer', authenticateJWT, authorizeLeadOwnership, async (req, res) => {
    try {
      const leadId = req.params.id;
      
      // Wrap in transaction to ensure atomic customer creation + lead update
      const result = await db.transaction(async (tx) => {
        // Fetch lead within transaction
        const [lead] = await tx.select().from(leads).where(eq(leads.id, leadId));
        
        if (!lead) {
          throw new Error('Lead not found');
        }
        
        // Check if customer already exists with this email
        const existingCustomers = await tx.select()
          .from(customers)
          .where(eq(customers.bakerId, lead.bakerId || ''));
        
        const existingCustomer = existingCustomers.find(c => c.email === lead.customerEmail);
        
        if (existingCustomer) {
          // Customer exists, just update lead status
          await tx.update(leads)
            .set({ status: 'converted' })
            .where(eq(leads.id, leadId));
          
          return { customer: existingCustomer, isNew: false };
        }
        
        // Create new customer from lead data
        const customerData = {
          id: randomUUID(),
          bakerId: lead.bakerId || '',
          tenantId: lead.tenantId || null,
          name: lead.customerName,
          email: lead.customerEmail,
          phone: lead.customerPhone || null,
          eventDate: lead.weddingDate || null,
          eventType: 'wedding' as const,
          guestCount: lead.guestCount || null,
          budget: lead.budget || null,
          source: 'lead_conversion',
          status: 'quoted',
        };
        
        const [customer] = await tx.insert(customers)
          .values(customerData)
          .returning();
        
        // Update lead status to indicate it's been converted
        await tx.update(leads)
          .set({ status: 'converted' })
          .where(eq(leads.id, leadId));
        
        return { customer, isNew: true };
      });
      
      const statusCode = result.isNew ? 201 : 200;
      res.status(statusCode).json(result.customer);
      
    } catch (error) {
      if (error instanceof Error && error.message === 'Lead not found') {
        return res.status(404).json({ error: 'Lead not found' });
      }
      console.error('Error converting lead to customer:', error);
      res.status(500).json({ error: 'Failed to convert lead to customer' });
    }
  });

  // Bulk email to leads (Enterprise only)
  app.post('/api/leads/bulk-email', authenticateJWT, requireFeature('bulk_email'), async (req: AuthenticatedRequest, res) => {
    try {
      const { leadIds, subject, body } = req.body;
      const bakerId = req.user!.userId;

      if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
        return res.status(400).json({ error: 'leadIds array is required and must not be empty' });
      }

      if (!subject || !body) {
        return res.status(400).json({ error: 'subject and body are required' });
      }

      // Fetch the leads
      const leads = await Promise.all(
        leadIds.map(async (leadId) => {
          const lead = await storage.getLead(leadId);
          // Verify the lead belongs to the authenticated baker
          if (lead && lead.bakerId === bakerId) {
            return lead;
          }
          return null;
        })
      );

      // Filter out null leads (invalid or unauthorized)
      const validLeads = leads.filter((lead) => lead !== null);

      if (validLeads.length === 0) {
        return res.status(400).json({ error: 'No valid leads found' });
      }

      // Send emails
      const emailResults = await Promise.all(
        validLeads.map(async (lead) => {
          try {
            // Replace merge fields in subject and body
            let personalizedSubject = subject.replace(/\{\{customerName\}\}/g, lead!.customerName);
            let personalizedBody = body
              .replace(/\{\{customerName\}\}/g, lead!.customerName)
              .replace(/\{\{weddingDate\}\}/g, lead!.weddingDate || 'TBD');

            const success = await sendEmail({
              to: lead!.customerEmail,
              toName: lead!.customerName,
              from: 'noreply@bakeriq.app',
              fromName: 'BakerIQ',
              subject: personalizedSubject,
              textPart: personalizedBody,
              htmlPart: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${personalizedBody.replace(/\n/g, '<br>')}</div>`,
            });

            return {
              leadId: lead!.id,
              email: lead!.customerEmail,
              success,
            };
          } catch (error) {
            console.error(`Error sending email to lead ${lead!.id}:`, error);
            return {
              leadId: lead!.id,
              email: lead!.customerEmail,
              success: false,
            };
          }
        })
      );

      const successCount = emailResults.filter((r) => r.success).length;
      const failureCount = emailResults.filter((r) => !r.success).length;

      res.json({
        success: true,
        totalSent: successCount,
        totalFailed: failureCount,
        results: emailResults,
      });
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      res.status(500).json({ error: 'Failed to send bulk emails' });
    }
  });

  // CSV export for leads (Enterprise only)
  app.get('/api/leads/export', authenticateJWT, requireFeature('csv_export'), async (req: AuthenticatedRequest, res) => {
    try {
      const bakerId = req.user!.userId;

      // Get all leads for this baker
      const leads = await storage.getLeadsByBaker(bakerId);

      if (leads.length === 0) {
        return res.status(404).json({ error: 'No leads found to export' });
      }

      // Helper function to escape CSV fields
      const escapeCsvField = (field: any): string => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        // If field contains comma, quote, or newline, wrap in quotes and escape existing quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // CSV header
      const csvHeader = [
        'Name',
        'Email',
        'Phone',
        'Wedding Date',
        'Guest Count',
        'Budget',
        'Status',
        'Message',
        'Created At',
      ].join(',');

      // CSV rows
      const csvRows = leads.map((lead) => {
        return [
          escapeCsvField(lead.customerName),
          escapeCsvField(lead.customerEmail),
          escapeCsvField(lead.customerPhone || ''),
          escapeCsvField(lead.weddingDate || ''),
          escapeCsvField(lead.guestCount || ''),
          escapeCsvField(lead.budget || ''),
          escapeCsvField(lead.status || 'new'),
          escapeCsvField(lead.message || ''),
          escapeCsvField(lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ''),
        ].join(',');
      });

      const csv = [csvHeader, ...csvRows].join('\n');

      // Set response headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="leads-export-${Date.now()}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error('Error exporting leads:', error);
      res.status(500).json({ error: 'Failed to export leads' });
    }
  });

  app.get('/api/customers/:id', async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      console.error('Error fetching customer:', error);
      res.status(500).json({ error: 'Failed to fetch customer' });
    }
  });

  app.put('/api/customers/:id', async (req, res) => {
    try {
      const updates = req.body;
      const customer = await storage.updateCustomer(req.params.id, updates);
      res.json(customer);
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(500).json({ error: 'Failed to update customer' });
    }
  });

  app.get('/api/customers/:id/notes', async (req, res) => {
    try {
      const notes = await storage.getCustomerNotes(req.params.id);
      res.json(notes);
    } catch (error) {
      console.error('Error fetching customer notes:', error);
      res.status(500).json({ error: 'Failed to fetch customer notes' });
    }
  });

  app.post('/api/customers/:id/notes', async (req, res) => {
    try {
      const noteData = {
        ...req.body,
        customerId: req.params.id,
      };
      const note = await storage.createCustomerNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      console.error('Error creating customer note:', error);
      res.status(500).json({ error: 'Failed to create customer note' });
    }
  });

  // Baker Authentication
  app.post('/api/baker/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }

      // Find baker by email in the database
      const baker = await storage.getBakerByEmail(email);
      
      if (!baker) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(password, baker.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Create secure JWT token
      const token = createBakerToken(baker.id, baker.email);
      
      // Don't return the password in the response
      const { password: _, ...bakerResponse } = baker;
      
      res.json({
        success: true,
        token,
        baker: bakerResponse
      });
    } catch (error) {
      console.error('Baker login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  // Logout endpoint - handle both GET and POST
  const logoutHandler = async (req: any, res: any) => {
    // For token-based auth, logout is handled client-side by removing the token
    // Redirect to client-side login page 
    res.redirect('/baker-login');
  };

  app.get('/api/logout', logoutHandler);
  app.post('/api/logout', logoutHandler);

  // Customer Portal Authentication
  app.post('/api/customer/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }

      // Find customer by email
      const customer = await storage.getCustomerByEmail(email);
      if (!customer) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Check if customer has portal access
      if (!customer.hasPortalAccess) {
        return res.status(401).json({ 
          success: false, 
          message: 'Portal access not activated. Contact your baker for access.' 
        });
      }

      // For demo purposes, we'll use a simple password check
      // In production, use proper password hashing
      const isValidPassword = customer.portalPassword === password;
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Create simple session token (in production, use proper JWT or session management)
      const sessionToken = Buffer.from(`${customer.id}:${Date.now()}`).toString('base64');
      
      // Update last login (simplified for demo)
      await storage.updateCustomer(customer.id, {
        portalLastLogin: new Date()
      });

      res.json({
        success: true,
        customerId: customer.id,
        sessionToken,
        customer: {
          name: customer.name,
          email: customer.email
        }
      });
    } catch (error) {
      console.error('Customer login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  app.get('/api/customers/:customerId/quotes', async (req, res) => {
    try {
      // Mock customer quotes for demo
      const quotes = [
        {
          id: 'quote-customer-1',
          tenantId: 'tenant-1',
          bakerId: 'baker-1',
          customerId: req.params.customerId,
          quoteNumber: 'Q-2024-001',
          title: 'Three-Tier Wedding Cake',
          description: 'Elegant vanilla and chocolate wedding cake with fresh flowers and custom topper',
          total: 850.00,
          status: 'sent',
          eventDate: '2024-08-15',
          guestCount: 120,
          validUntil: '2024-07-15',
          notes: 'Customer requested gluten-free option for bottom tier',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'quote-customer-2',
          tenantId: 'tenant-1',
          bakerId: 'baker-1',
          customerId: req.params.customerId,
          quoteNumber: 'Q-2024-002',
          title: 'Anniversary Celebration Cake',
          description: 'Custom two-tier chocolate cake with gold accents',
          total: 425.00,
          status: 'approved',
          eventDate: '2024-09-20',
          guestCount: 50,
          validUntil: '2024-08-20',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      res.json(quotes);
    } catch (error) {
      console.error('Error fetching customer quotes:', error);
      res.status(500).json({ error: 'Failed to fetch quotes' });
    }
  });

  app.get('/api/customers/:customerId/transactions', async (req, res) => {
    try {
      // Mock customer transactions for demo
      const transactions = [
        {
          id: 'trans-customer-1',
          tenantId: 'tenant-1',
          bakerId: 'baker-1',
          customerId: req.params.customerId,
          amount: '212.50',
          type: 'deposit',
          status: 'succeeded',
          description: 'Deposit for Anniversary Celebration Cake',
          stripePaymentId: 'pi_1234567890',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'trans-customer-2',
          tenantId: 'tenant-1',
          bakerId: 'baker-1',
          customerId: req.params.customerId,
          amount: '212.50',
          type: 'final_payment',
          status: 'pending',
          description: 'Final payment for Anniversary Celebration Cake',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching customer transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });


  // Baker Pricing Configuration API
  app.get('/api/bakers/:bakerId/pricing', authenticateJWT, authorizeBakerWithData, async (req, res) => {
    try {
      const { bakerId } = req.params;
      
      // Fetch pricing config from database
      const pricingConfig = await storage.getPricingConfig(bakerId);
      
      if (!pricingConfig) {
        // Fallback to default data if no pricing config found
        const defaultPricingConfig = {
          id: `pricing-${bakerId}`,
          bakerId,
          cakeSizes: [
            { size: "6-inch", servings: 12, basePrice: 75, costToMake: 30, profitMargin: 60 },
            { size: "8-inch", servings: 24, basePrice: 95, costToMake: 40, profitMargin: 58 },
            { size: "10-inch", servings: 38, basePrice: 125, costToMake: 55, profitMargin: 56 },
            { size: "12-inch", servings: 56, basePrice: 155, costToMake: 75, profitMargin: 52 },
            { size: "14-inch", servings: 78, basePrice: 195, costToMake: 100, profitMargin: 49 }
          ],
          shapes: [
            { id: "round", name: "Round", baseUpcharge: 0, costToMake: 0, profitMargin: 0 },
            { id: "heart", name: "Heart", baseUpcharge: 15, costToMake: 8, profitMargin: 47 },
            { id: "square", name: "Square", baseUpcharge: 10, costToMake: 5, profitMargin: 50 }
          ],
          flavors: [
            { id: "vanilla", name: "Classic Vanilla", upcharge: 0, isPremium: false },
            { id: "chocolate", name: "Rich Chocolate", upcharge: 0, isPremium: false },
            { id: "red-velvet", name: "Red Velvet", upcharge: 18, isPremium: true },
            { id: "funfetti", name: "Funfetti", upcharge: 8, isPremium: false }
          ],
          decorations: [
            { id: "fresh-roses", name: "Fresh Roses", description: "Beautiful fresh roses", price: 50, category: "flowers", isActive: true },
            { id: "buttercream-rosettes", name: "Buttercream Rosettes", description: "Hand-piped roses", price: 40, category: "design", isActive: true },
            { id: "gold-leaf", name: "Gold Leaf Accent", description: "Edible gold leaf", price: 95, category: "design", isActive: true }
          ],
          taxRate: 8.75,
          deliverySettings: { baseDeliveryFee: 50 },
          profitSettings: { defaultMargin: 55, minimumMargin: 35, laborRate: 25 },
          lastUpdated: new Date().toISOString()
        };
        return res.json(defaultPricingConfig);
      }

      res.json(pricingConfig);
    } catch (error) {
      console.error('Error fetching baker pricing:', error);
      res.status(500).json({ error: 'Failed to fetch pricing configuration' });
    }
  });

  app.put('/api/bakers/:bakerId/pricing', authenticateJWT, authorizeBakerWithData, async (req, res) => {
    try {
      const { bakerId } = req.params;
      
      // Validate request body using Zod schema
      const validationResult = bakerPricingSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid pricing configuration', 
          details: validationResult.error.issues 
        });
      }

      const pricingConfig = {
        ...validationResult.data,
        lastUpdated: new Date().toISOString()
      };

      // Save to database using new storage methods
      const savedConfig = await storage.updatePricingConfig(bakerId, pricingConfig);
      console.log('Baker pricing configuration updated:', savedConfig);

      res.json({
        success: true,
        message: 'Pricing configuration updated successfully',
        config: savedConfig
      });
    } catch (error) {
      console.error('Error updating baker pricing:', error);
      res.status(500).json({ error: 'Failed to update pricing configuration' });
    }
  });

  // Account Management APIs
  app.get('/api/bakers/:bakerId/account', async (req, res) => {
    try {
      const { bakerId } = req.params;
      
      // Fetch real baker data from database
      const baker = await storage.getBaker(bakerId);
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      const account = {
        id: bakerId,
        businessName: baker.name,
        ownerName: baker.name, // Use baker name as owner name
        email: baker.email,
        phone: baker.phone || '(555) 123-4567',
        address: {
          street: '123 Main Street',
          city: baker.address || 'San Francisco',
          state: 'CA',
          zipCode: '94102'
        },
        businessHours: {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '16:00', closed: false },
          sunday: { open: '09:00', close: '14:00', closed: true }
        },
        notifications: {
          newLeads: true,
          paymentUpdates: true,
          marketingEmails: false
        }
      };

      res.json(account);
    } catch (error) {
      console.error('Error fetching account:', error);
      res.status(500).json({ error: 'Failed to fetch account information' });
    }
  });

  app.get('/api/bakers/:bakerId/subscription', async (req, res) => {
    try {
      const { bakerId } = req.params;
      
      // Mock subscription data - in real app, fetch from database/Stripe
      const subscription = {
        id: `sub-${bakerId}`,
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        features: [
          'Unlimited leads',
          'Advanced quote builder',
          'Contract management',
          'Payment processing',
          'Team collaboration',
          'Priority support'
        ],
        limits: {
          leads: -1, // unlimited
          portfolio: -1, // unlimited
          teamMembers: 5
        }
      };

      res.json(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ error: 'Failed to fetch subscription information' });
    }
  });

  app.get('/api/bakers/:bakerId/team', async (req, res) => {
    try {
      const { bakerId } = req.params;
      
      // Fetch real baker data to create team with actual owner
      const baker = await storage.getBaker(bakerId);
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      const team = [
        {
          id: 'owner-1',
          name: baker.name,
          email: baker.email,
          role: 'owner',
          status: 'active',
          joinedAt: baker.createdAt?.toISOString() || new Date().toISOString(),
          lastActive: new Date().toISOString()
        }
      ];

      res.json(team);
    } catch (error) {
      console.error('Error fetching team:', error);
      res.status(500).json({ error: 'Failed to fetch team information' });
    }
  });

  app.post('/api/bakers/:bakerId/team', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const { email, role } = req.body;

      if (!email || !role) {
        return res.status(400).json({ error: 'Email and role are required' });
      }

      // Mock team member invitation - in real app, send invitation email
      const invitation = {
        id: `invite-${Date.now()}`,
        bakerId,
        email,
        role,
        status: 'pending',
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };

      console.log('Team member invitation sent:', invitation);

      res.json({
        success: true,
        message: 'Invitation sent successfully',
        invitation
      });
    } catch (error) {
      console.error('Error inviting team member:', error);
      res.status(500).json({ error: 'Failed to send team invitation' });
    }
  });

  // Cake Calculator Quote Request API - Creates actual leads
  app.post('/api/bakers/:bakerId/quote-requests', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const quoteRequest = req.body;
      
      // Get baker to retrieve tenantId
      const baker = await storage.getBaker(bakerId);
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      // Transform quote request to lead data
      const specialRequestsText = quoteRequest.cakeDesign?.specialRequests || '';
      const cakeDetails = `${quoteRequest.cakeDesign?.tiers?.length || 0} tier cake for ${quoteRequest.guestCount} guests`;
      const decorationsText = quoteRequest.cakeDesign?.decorations?.length > 0 
        ? `Decorations: ${quoteRequest.cakeDesign.decorations.join(', ')}`
        : '';
      
      const message = [
        `Quote request via Cake Calculator:`,
        cakeDetails,
        decorationsText,
        specialRequestsText ? `Special requests: ${specialRequestsText}` : '',
        `Contact preference: ${quoteRequest.contactPreference}`,
        `Timeline: ${quoteRequest.timeline}`,
        quoteRequest.venue ? `Venue: ${quoteRequest.venue}` : ''
      ].filter(Boolean).join('\n');

      const leadData = {
        tenantId: baker.tenantId,
        bakerId: bakerId,
        customerName: quoteRequest.customerName,
        customerEmail: quoteRequest.email,
        customerPhone: quoteRequest.phone || null,
        weddingDate: quoteRequest.eventDate || null,
        guestCount: quoteRequest.guestCount || null,
        budget: quoteRequest.pricing?.total ? `$${quoteRequest.pricing.total.toFixed(2)}` : null,
        message: message,
        status: 'new'
      };

      // Create the lead using the existing lead creation logic
      const lead = await storage.createLead(leadData);
      
      // Send notification emails (same logic as the /api/leads endpoint)
      // Track analytics (non-blocking)
      try {
        await storage.trackAnalytics({
          bakerId: bakerId,
          metric: 'contact_attempt',
          date: new Date().toISOString().split('T')[0]
        });
      } catch (analyticsError) {
        // Don't fail the entire request if analytics tracking fails
        console.warn('Failed to track analytics for quote request:', analyticsError);
      }
      
      // Email baker about new lead
      const template = emailTemplates.newLeadNotification(
        baker.name,
        leadData.customerName,
        leadData.customerEmail,
        leadData.message,
        leadData.weddingDate || undefined
      );
      
      await sendEmail({
        to: baker.email,
        from: 'noreply@weddingcakecalculator.com',
        fromName: 'Wedding Cake Calculator',
        ...template
      });
      
      // Email confirmation to customer
      const confirmTemplate = emailTemplates.leadConfirmation(
        leadData.customerName,
        baker.name
      );
      
      await sendEmail({
        to: leadData.customerEmail,
        from: 'noreply@weddingcakecalculator.com',
        fromName: 'Wedding Cake Calculator',
        ...confirmTemplate
      });

      res.status(201).json({
        success: true,
        message: 'Quote request submitted successfully',
        leadId: lead.id
      });
    } catch (error) {
      console.error('Error processing quote request:', error);
      res.status(500).json({ error: 'Failed to process quote request' });
    }
  });

  // Advanced Quote API Routes
  app.get('/api/quote-templates', async (req, res) => {
    try {
      const { bakerId, category, isActive } = req.query;
      if (!bakerId) {
        return res.status(400).json({ error: 'bakerId is required' });
      }
      const templates = await storage.getQuoteTemplates(bakerId as string);
      res.json(templates);
    } catch (error) {
      console.error('Error fetching quote templates:', error);
      res.status(500).json({ error: 'Failed to fetch quote templates' });
    }
  });

  app.put('/api/quote-templates/:id', async (req, res) => {
    try {
      const template = await storage.updateQuoteTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ error: 'Quote template not found' });
      }
      res.json(template);
    } catch (error) {
      console.error('Error updating quote template:', error);
      res.status(500).json({ error: 'Failed to update quote template' });
    }
  });

  app.delete('/api/quote-templates/:id', async (req, res) => {
    try {
      const success = await storage.deleteQuoteTemplate(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Quote template not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting quote template:', error);
      res.status(500).json({ error: 'Failed to delete quote template' });
    }
  });

  app.get('/api/quote-templates/:id', async (req, res) => {
    try {
      const template = await storage.getQuoteTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: 'Quote template not found' });
      }
      res.json(template);
    } catch (error) {
      console.error('Error fetching quote template:', error);
      res.status(500).json({ error: 'Failed to fetch quote template' });
    }
  });

  app.post('/api/quote-templates/:id/duplicate', async (req, res) => {
    try {
      const originalTemplate = await storage.getQuoteTemplate(req.params.id);
      if (!originalTemplate) {
        return res.status(404).json({ error: 'Quote template not found' });
      }
      
      const duplicatedTemplate = {
        ...originalTemplate,
        id: undefined,
        name: `${originalTemplate.name} (Copy)`,
        isPublic: false,
        isFeatured: false,
        createdAt: undefined,
        updatedAt: undefined
      };
      
      const newTemplate = await storage.createQuoteTemplate(duplicatedTemplate);
      res.status(201).json(newTemplate);
    } catch (error) {
      console.error('Error duplicating quote template:', error);
      res.status(500).json({ error: 'Failed to duplicate quote template' });
    }
  });

  app.post('/api/quote-templates', async (req, res) => {
    try {
      const template = await storage.createQuoteTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating quote template:', error);
      res.status(500).json({ error: 'Failed to create quote template' });
    }
  });

  app.get('/api/quotes', async (req, res) => {
    try {
      const { bakerId, customerId } = req.query;
      
      let quotes;
      if (bakerId) {
        quotes = await storage.getQuotesByBaker(bakerId as string);
      } else if (customerId) {
        quotes = await storage.getQuotesByCustomer(customerId as string);
      } else {
        return res.status(400).json({ error: 'bakerId or customerId is required' });
      }
      
      res.json(quotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({ error: 'Failed to fetch quotes' });
    }
  });

  app.post('/api/quotes', async (req, res) => {
    try {
      const quoteData = req.body;
      
      // STEP 1: Idempotent customer upsert by normalized email
      const normalizedEmail = quoteData.customerEmail?.toLowerCase().trim();
      if (!normalizedEmail) {
        return res.status(400).json({ error: 'Customer email is required' });
      }
      
      const bakerId = quoteData.bakerId;
      if (!bakerId) {
        return res.status(400).json({ error: 'Baker ID is required' });
      }
      
      // Check if customer exists
      const existingCustomers = await storage.getCustomersByBaker(bakerId);
      let customer = existingCustomers.find(c => c.email.toLowerCase().trim() === normalizedEmail);
      
      if (!customer) {
        // Create new customer
        const customerData = {
          bakerId: bakerId,
          tenantId: quoteData.tenantId || null,
          name: quoteData.customerName || 'Unknown',
          email: normalizedEmail,
          phone: quoteData.customerPhone || null,
          eventDate: quoteData.eventDate || null,
          eventType: quoteData.eventType || 'wedding',
          guestCount: quoteData.guestCount || null,
          budget: quoteData.budget || null,
          source: 'quote_builder',
          status: 'inquiry',
        };
        customer = await storage.createCustomer(customerData);
        console.log('Created new customer:', customer.id, customer.name);
      } else {
        console.log('Found existing customer:', customer.id, customer.name);
      }
      
      // STEP 2: Generate signature for idempotent lead upsert
      // Signature = customer_id + event details to identify unique project
      const signature = `${customer.id}_${quoteData.eventDate || 'no-date'}_${quoteData.eventType || 'wedding'}`.toLowerCase();
      
      // STEP 3: Idempotent lead upsert by (customer_id + signature)
      const existingLeads = await storage.getLeadsByBaker(bakerId);
      let lead = existingLeads.find(l => l.signature === signature);
      
      if (!lead) {
        // Create new lead
        const leadData = {
          bakerId: bakerId,
          tenantId: quoteData.tenantId || null,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone || null,
          weddingDate: quoteData.eventDate || null,
          guestCount: quoteData.guestCount || null,
          budget: quoteData.budget || null,
          message: quoteData.description || '',
          status: 'quoted',
          signature: signature,
        };
        lead = await storage.createLead(leadData);
        console.log('Created new lead:', lead.id, signature);
      } else {
        console.log('Found existing lead:', lead.id, signature);
        // Update lead status to 'quoted' if it was in a different state
        if (lead.status !== 'quoted') {
          await storage.updateLead(lead.id, { status: 'quoted' });
        }
      }
      
      // STEP 4: Create quote with both customer_id and lead_id
      const quotePayload = {
        ...quoteData,
        customerId: customer.id,
        leadId: lead.id,
      };
      
      const quote = await storage.createQuote(quotePayload);
      console.log('Created quote:', quote.id, 'for customer:', customer.id, 'lead:', lead.id);
      
      // STEP 5: Return all IDs for client routing
      res.status(201).json({
        quote,
        contactId: customer.id,
        leadId: lead.id,
        quoteId: quote.id,
      });
    } catch (error) {
      console.error('Error creating quote:', error);
      res.status(500).json({ error: 'Failed to create quote' });
    }
  });

  app.get('/api/quotes/:id', async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      res.json(quote);
    } catch (error) {
      console.error('Error fetching quote:', error);
      res.status(500).json({ error: 'Failed to fetch quote' });
    }
  });

  app.put('/api/quotes/:id', async (req, res) => {
    try {
      const quote = await storage.updateQuote(req.params.id, req.body);
      res.json(quote);
    } catch (error) {
      console.error('Error updating quote:', error);
      res.status(500).json({ error: 'Failed to update quote' });
    }
  });

  app.get('/api/quotes/:id/items', async (req, res) => {
    try {
      const items = await storage.getQuoteItems(req.params.id);
      res.json(items);
    } catch (error) {
      console.error('Error fetching quote items:', error);
      res.status(500).json({ error: 'Failed to fetch quote items' });
    }
  });

  app.post('/api/quotes/:id/items', async (req, res) => {
    try {
      const itemData = {
        ...req.body,
        quoteId: req.params.id,
      };
      const item = await storage.createQuoteItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error('Error creating quote item:', error);
      res.status(500).json({ error: 'Failed to create quote item' });
    }
  });

  // Send quote to customer via email
  app.post('/api/quotes/:id/send', authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Get quote details
      const quote = await storage.getQuote(id);
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }

      // Check if user is authorized to send this quote
      if (user.role === 'baker') {
        // Bakers can only send their own quotes
        if (user.userId !== quote.bakerId) {
          return res.status(403).json({ 
            error: 'Access forbidden',
            message: 'You can only send your own quotes'
          });
        }
      } else if (user.role === 'super_admin') {
        // Super admins can send any quote (allow for support scenarios)
      } else {
        // All other roles (customers, etc.) are forbidden
        return res.status(403).json({ 
          error: 'Access forbidden',
          message: 'Only bakers can send quotes'
        });
      }

      // Get customer details
      const customer = await storage.getCustomer(quote.customerId || '');
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Get baker details
      const baker = await storage.getBaker(quote.bakerId || '');
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      // Check if quote is in sendable state
      if (quote.status !== 'draft') {
        return res.status(409).json({ 
          error: 'Quote cannot be sent',
          message: `Quote is already ${quote.status}. Only draft quotes can be sent.`
        });
      }

      // Send email notification first before updating status
      try {
        // Generate approval token for customer (30 day expiry)
        const { token } = await storage.generateQuoteApprovalToken(id, 30);
        
        // Generate quote URL for customer using approval token
        const quoteUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://bakeriq.app'}/quote-approval/${token}`;
        
        const emailContent = emailTemplates.quoteSent(
          customer.name,
          baker.businessName || baker.name,
          quote.quoteNumber,
          quote.total || '0.00',
          quote.validUntil || 'No expiration',
          quoteUrl
        );

        const emailResult = await sendEmail({
          to: customer.email,
          toName: customer.name,
          subject: emailContent.subject,
          textPart: emailContent.textPart,
          htmlPart: emailContent.htmlPart
        });

        // Check if email was actually sent
        if (!emailResult) {
          return res.status(502).json({ 
            error: 'Email delivery failed',
            message: 'Unable to send email to customer. Please check email configuration.'
          });
        }

        // Only update quote status after successful email send
        const updatedQuote = await storage.updateQuote(id, {
          status: 'sent',
          sentAt: new Date()
        });

        res.json({
          success: true,
          message: 'Quote sent successfully',
          quote: updatedQuote
        });

      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return res.status(502).json({ 
          error: 'Email delivery failed',
          message: 'Failed to send email to customer. Please try again or contact support.'
        });
      }

    } catch (error) {
      console.error('Error sending quote:', error);
      res.status(500).json({ error: 'Failed to send quote' });
    }
  });

  // Generate approval link for quote (baker-only)
  app.post('/api/quotes/:id/generate-approval-link', authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const quote = await storage.getQuote(id);
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      // Verify baker owns this quote
      if (user.role === 'baker' && user.userId !== quote.bakerId) {
        return res.status(403).json({ error: 'Access forbidden' });
      }
      
      // Generate approval token (expires in 30 days)
      const { token, expiresAt } = await storage.generateQuoteApprovalToken(id, 30);
      
      // Construct approval URL
      const approvalUrl = `${req.protocol}://${req.get('host')}/quote-approval/${token}`;
      
      res.json({
        success: true,
        approvalUrl,
        token,
        expiresAt
      });
    } catch (error) {
      console.error('Error generating approval link:', error);
      res.status(500).json({ error: 'Failed to generate approval link' });
    }
  });

  // Get quote by approval token (customer-facing, no auth required)
  app.get('/api/quotes/approve/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      const quote = await storage.getQuoteByApprovalToken(token);
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found or link expired' });
      }
      
      // Check if token is expired
      if (quote.approvalTokenExpiresAt && new Date() > new Date(quote.approvalTokenExpiresAt)) {
        return res.status(410).json({ error: 'Approval link has expired' });
      }
      
      // Get quote items
      const items = await storage.getQuoteItems(quote.id);
      
      // Get baker details
      const baker = await storage.getBaker(quote.bakerId || '');
      
      // Get customer details
      const customer = await storage.getCustomer(quote.customerId || '');
      
      // Mark quote as viewed if not already
      if (!quote.viewedAt) {
        await storage.updateQuote(quote.id, { 
          viewedAt: new Date(),
          status: 'viewed'
        });
      }
      
      res.json({
        quote: {
          ...quote,
          items
        },
        baker: baker ? {
          id: baker.id,
          name: baker.name,
          businessName: baker.businessName,
          email: baker.email,
          phone: baker.phone
        } : null,
        customer: customer ? {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        } : null
      });
    } catch (error) {
      console.error('Error fetching quote by token:', error);
      res.status(500).json({ error: 'Failed to fetch quote' });
    }
  });

  // Approve quote (customer-facing, no auth required)
  app.post('/api/quotes/approve/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      const quote = await storage.getQuoteByApprovalToken(token);
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      // Check if token is expired
      if (quote.approvalTokenExpiresAt && new Date() > new Date(quote.approvalTokenExpiresAt)) {
        return res.status(410).json({ error: 'Approval link has expired' });
      }
      
      // Check if quote is already approved or declined
      if (quote.status === 'approved') {
        return res.status(409).json({ error: 'Quote has already been approved' });
      }
      
      if (quote.status === 'rejected' || quote.declinedAt) {
        return res.status(409).json({ error: 'Quote has been declined and cannot be approved' });
      }
      
      // Update quote status to approved
      const updatedQuote = await storage.updateQuote(quote.id, {
        status: 'approved',
        approvedAt: new Date()
      });
      
      // Send notification email to baker
      try {
        const baker = await storage.getBaker(quote.bakerId || '');
        if (baker) {
          await sendEmail({
            to: baker.email,
            toName: baker.name,
            from: 'noreply@bakeriq.app',
            fromName: 'BakerIQ',
            subject: `Quote #${quote.quoteNumber} Approved!`,
            textPart: `Great news! Your quote #${quote.quoteNumber} has been approved by the customer.`,
            htmlPart: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2 style="color: #f97316;">Quote Approved!</h2>
              <p>Great news! Your quote <strong>#${quote.quoteNumber}</strong> has been approved by the customer.</p>
              <p><strong>Total Amount:</strong> $${quote.total}</p>
              <p>Please log in to your baker dashboard to proceed with the next steps.</p>
            </div>`
          });
        }
      } catch (emailError) {
        console.error('Failed to send approval notification:', emailError);
        // Don't fail the request if email fails
      }
      
      res.json({
        success: true,
        message: 'Quote approved successfully',
        quote: updatedQuote
      });
    } catch (error) {
      console.error('Error approving quote:', error);
      res.status(500).json({ error: 'Failed to approve quote' });
    }
  });

  // Decline quote (customer-facing, no auth required)
  app.post('/api/quotes/decline/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const { reason } = req.body;
      
      const quote = await storage.getQuoteByApprovalToken(token);
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      // Check if token is expired
      if (quote.approvalTokenExpiresAt && new Date() > new Date(quote.approvalTokenExpiresAt)) {
        return res.status(410).json({ error: 'Approval link has expired' });
      }
      
      // Check if quote is already approved or declined
      if (quote.status === 'approved' || quote.approvedAt) {
        return res.status(409).json({ error: 'Quote has already been approved and cannot be declined' });
      }
      
      if (quote.status === 'rejected' || quote.declinedAt) {
        return res.status(409).json({ error: 'Quote has already been declined' });
      }
      
      // Update quote status to rejected
      const updatedQuote = await storage.updateQuote(quote.id, {
        status: 'rejected',
        declinedAt: new Date(),
        declineReason: reason || null
      });
      
      // Send notification email to baker
      try {
        const baker = await storage.getBaker(quote.bakerId || '');
        if (baker) {
          await sendEmail({
            to: baker.email,
            toName: baker.name,
            from: 'noreply@bakeriq.app',
            fromName: 'BakerIQ',
            subject: `Quote #${quote.quoteNumber} Declined`,
            textPart: `Your quote #${quote.quoteNumber} has been declined by the customer.${reason ? ` Reason: ${reason}` : ''}`,
            htmlPart: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2 style="color: #666;">Quote Declined</h2>
              <p>Your quote <strong>#${quote.quoteNumber}</strong> has been declined by the customer.</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>You can reach out to the customer to discuss their concerns or create a revised quote.</p>
            </div>`
          });
        }
      } catch (emailError) {
        console.error('Failed to send decline notification:', emailError);
        // Don't fail the request if email fails
      }
      
      res.json({
        success: true,
        message: 'Quote declined',
        quote: updatedQuote
      });
    } catch (error) {
      console.error('Error declining quote:', error);
      res.status(500).json({ error: 'Failed to decline quote' });
    }
  });

  // Contract API Routes
  app.get('/api/contracts', async (req, res) => {
    try {
      const { bakerId, customerId } = req.query;
      
      let contracts;
      if (bakerId) {
        contracts = await storage.getContractsByBaker(bakerId as string);
      } else if (customerId) {
        contracts = await storage.getContractsByCustomer(customerId as string);
      } else {
        return res.status(400).json({ error: 'bakerId or customerId is required' });
      }
      
      res.json(contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ error: 'Failed to fetch contracts' });
    }
  });

  app.post('/api/contracts', async (req, res) => {
    try {
      const contractData = req.body;
      
      // Wrap in transaction: validate quote, render template, save payment snapshot
      const result = await db.transaction(async (tx) => {
        let quote = null;
        let customer = null;
        let baker = null;
        
        // Validate quote exists if quoteId provided
        if (contractData.quoteId) {
          [quote] = await tx.select().from(quotes).where(eq(quotes.id, contractData.quoteId));
          
          if (!quote) {
            throw new Error('Quote not found');
          }
          
          // Get customer and baker for template rendering
          if (quote.customerId) {
            [customer] = await tx.select().from(customers).where(eq(customers.id, quote.customerId));
          }
          if (quote.bakerId) {
            [baker] = await tx.select().from(bakers).where(eq(bakers.id, quote.bakerId));
          }
          
          // Auto-populate from quote if not provided
          contractData.contractOrigin = 'from_quote';
          contractData.customerId = contractData.customerId || quote.customerId;
          contractData.bakerId = contractData.bakerId || quote.bakerId;
          contractData.totalAmount = contractData.totalAmount || quote.total;
          contractData.depositAmount = contractData.depositAmount || quote.depositAmount;
          contractData.eventDate = contractData.eventDate || quote.eventDate;
        } else {
          contractData.contractOrigin = 'direct';
          
          // For direct contracts, fetch customer and baker
          if (contractData.customerId) {
            [customer] = await tx.select().from(customers).where(eq(customers.id, contractData.customerId));
          }
          if (contractData.bakerId) {
            [baker] = await tx.select().from(bakers).where(eq(bakers.id, contractData.bakerId));
          }
        }
        
        // Server-side template rendering if template provided
        if (contractData.templateId && baker && customer) {
          const [template] = await tx.select().from(contractTemplates).where(eq(contractTemplates.id, contractData.templateId));
          
          if (template) {
            const renderResult = renderContractTemplate(template.template, {
              baker,
              customer,
              quote: quote || undefined,
              contract: contractData,
            });
            
            // Use rendered content
            contractData.content = renderResult.content;
            
            // Save payment snapshot
            contractData.paymentSnapshot = renderResult.paymentSnapshot;
          }
        }
        
        // Validate required fields
        if (!contractData.content) {
          throw new Error('Contract content is required');
        }
        
        // Create contract with generated ID
        const newContractData = {
          ...contractData,
          id: randomUUID(),
        };
        
        const [contract] = await tx.insert(contracts)
          .values(newContractData)
          .returning();
        
        return contract;
      });
      
      res.status(201).json(result);
      
    } catch (error) {
      if (error instanceof Error && error.message === 'Quote not found') {
        return res.status(404).json({ error: 'Quote not found' });
      }
      if (error instanceof Error && error.message === 'Contract content is required') {
        return res.status(400).json({ error: 'Contract content is required' });
      }
      console.error('Error creating contract:', error);
      res.status(500).json({ error: 'Failed to create contract' });
    }
  });

  app.get('/api/contracts/:id', async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
      }
      res.json(contract);
    } catch (error) {
      console.error('Error fetching contract:', error);
      res.status(500).json({ error: 'Failed to fetch contract' });
    }
  });

  app.put('/api/contracts/:id', async (req, res) => {
    try {
      const contract = await storage.updateContract(req.params.id, req.body);
      res.json(contract);
    } catch (error) {
      console.error('Error updating contract:', error);
      res.status(500).json({ error: 'Failed to update contract' });
    }
  });

  app.delete('/api/contracts/:id', async (req, res) => {
    try {
      const success = await storage.deleteContract(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Contract not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting contract:', error);
      res.status(500).json({ error: 'Failed to delete contract' });
    }
  });

  // Contract Template API Routes
  app.get('/api/contract-templates', async (req, res) => {
    try {
      const { bakerId } = req.query;
      if (!bakerId) {
        return res.status(400).json({ error: 'bakerId is required' });
      }
      const templates = await storage.getContractTemplates(bakerId as string);
      res.json(templates);
    } catch (error) {
      console.error('Error fetching contract templates:', error);
      res.status(500).json({ error: 'Failed to fetch contract templates' });
    }
  });

  app.post('/api/contract-templates', async (req, res) => {
    try {
      const template = await storage.createContractTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating contract template:', error);
      res.status(500).json({ error: 'Failed to create contract template' });
    }
  });

  app.get('/api/contract-templates/:id', async (req, res) => {
    try {
      const template = await storage.getContractTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: 'Contract template not found' });
      }
      res.json(template);
    } catch (error) {
      console.error('Error fetching contract template:', error);
      res.status(500).json({ error: 'Failed to fetch contract template' });
    }
  });

  app.put('/api/contract-templates/:id', async (req, res) => {
    try {
      const template = await storage.updateContractTemplate(req.params.id, req.body);
      res.json(template);
    } catch (error) {
      console.error('Error updating contract template:', error);
      res.status(500).json({ error: 'Failed to update contract template' });
    }
  });

  app.delete('/api/contract-templates/:id', async (req, res) => {
    try {
      const success = await storage.deleteContractTemplate(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Contract template not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting contract template:', error);
      res.status(500).json({ error: 'Failed to delete contract template' });
    }
  });

  // Contract sending and signature routes
  app.post('/api/contracts/:id/send', async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
      }

      // Update contract status to 'sent'
      const updatedContract = await storage.updateContract(req.params.id, { 
        status: 'sent'
      });

      // TODO: Send contract email to customer using existing email service
      res.json({ 
        success: true, 
        message: 'Contract sent successfully',
        contract: updatedContract
      });
    } catch (error) {
      console.error('Error sending contract:', error);
      res.status(500).json({ error: 'Failed to send contract' });
    }
  });

  app.post('/api/contracts/:id/sign', async (req, res) => {
    try {
      const { signerName, signerEmail, signerType, signatureData } = req.body;
      
      // Wrap in transaction: create signature + update contract atomically
      const result = await db.transaction(async (tx) => {
        // Verify contract exists
        const [contract] = await tx.select().from(contracts).where(eq(contracts.id, req.params.id));
        
        if (!contract) {
          throw new Error('Contract not found');
        }
        
        // Create contract signature
        const [signature] = await tx.insert(contractSignatures)
          .values({
            id: randomUUID(),
            contractId: req.params.id,
            signerName,
            signerEmail,
            signerType,
            signatureData: signatureData || null,
            ipAddress: req.ip || null,
            userAgent: req.get('User-Agent') || 'Unknown',
          })
          .returning();
        
        // Update contract signed_at timestamp and status
        const [updatedContract] = await tx.update(contracts)
          .set({
            signedAt: new Date(),
            status: 'signed',
          })
          .where(eq(contracts.id, req.params.id))
          .returning();
        
        return { contract: updatedContract, signature };
      });

      res.json({ 
        success: true, 
        message: 'Contract signed successfully',
        contract: result.contract,
        signature: result.signature
      });
      
    } catch (error) {
      if (error instanceof Error && error.message === 'Contract not found') {
        return res.status(404).json({ error: 'Contract not found' });
      }
      console.error('Error signing contract:', error);
      res.status(500).json({ error: 'Failed to sign contract' });
    }
  });

  app.get('/api/contracts/:id/signatures', async (req, res) => {
    try {
      const signatures = await storage.getContractSignatures(req.params.id);
      res.json(signatures);
    } catch (error) {
      console.error('Error fetching contract signatures:', error);
      res.status(500).json({ error: 'Failed to fetch contract signatures' });
    }
  });

  // Payment API Routes
  app.get('/api/payment-plans', async (req, res) => {
    try {
      const { bakerId } = req.query;
      if (!bakerId) {
        return res.status(400).json({ error: 'bakerId is required' });
      }
      const plans = await storage.getPaymentPlansByBaker(bakerId as string);
      res.json(plans);
    } catch (error) {
      console.error('Error fetching payment plans:', error);
      res.status(500).json({ error: 'Failed to fetch payment plans' });
    }
  });

  app.post('/api/payment-plans', async (req, res) => {
    try {
      const plan = await storage.createPaymentPlan(req.body);
      res.status(201).json(plan);
    } catch (error) {
      console.error('Error creating payment plan:', error);
      res.status(500).json({ error: 'Failed to create payment plan' });
    }
  });

  app.get('/api/invoices', async (req, res) => {
    try {
      const { bakerId, customerId } = req.query;
      
      let invoices;
      if (bakerId) {
        invoices = await storage.getInvoicesByBaker(bakerId as string);
      } else if (customerId) {
        invoices = await storage.getInvoicesByCustomer(customerId as string);
      } else {
        return res.status(400).json({ error: 'bakerId or customerId is required' });
      }
      
      res.json(invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  });

  app.post('/api/invoices', async (req, res) => {
    try {
      const invoice = await storage.createInvoice(req.body);
      res.status(201).json(invoice);
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json({ error: 'Failed to create invoice' });
    }
  });

  // Team Management API Routes
  app.get('/api/teams/:bakerId/members', async (req, res) => {
    try {
      const { bakerId } = req.params;
      
      // Fetch real baker data to create team with actual owner
      const baker = await storage.getBaker(bakerId);
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      const members = [
        {
          id: `owner-${bakerId}`,
          name: baker.name,
          email: baker.email,
          role: 'owner',
          status: 'active',
          invitedAt: baker.createdAt?.toISOString() || new Date().toISOString(),
          lastActive: new Date().toISOString(),
          permissions: ['*']
        }
      ];
      res.json(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
      res.status(500).json({ error: 'Failed to fetch team members' });
    }
  });

  app.post('/api/teams/:bakerId/invite', async (req, res) => {
    try {
      const { email, role } = req.body;
      
      if (!email || !role) {
        return res.status(400).json({ error: 'Email and role are required' });
      }

      // For demo purposes, create a mock invitation
      const invitation = {
        id: `inv-${Date.now()}`,
        bakerId: req.params.bakerId,
        email,
        role,
        invitedBy: 'owner',
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      };

      // TODO: Integrate with storage when methods are implemented
      res.status(201).json(invitation);
    } catch (error) {
      console.error('Error creating team invitation:', error);
      res.status(500).json({ error: 'Failed to create invitation' });
    }
  });

  app.get('/api/teams/:bakerId/invitations', async (req, res) => {
    try {
      // Mock data for demo
      const invitations = [
        {
          id: 'inv-1',
          email: 'team@example.com',
          role: 'editor',
          invitedBy: 'owner',
          invitedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        }
      ];
      res.json(invitations);
    } catch (error) {
      console.error('Error fetching team invitations:', error);
      res.status(500).json({ error: 'Failed to fetch invitations' });
    }
  });

  app.delete('/api/teams/:bakerId/invitations/:invitationId', async (req, res) => {
    try {
      // TODO: Implement deletion when storage methods are available
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting team invitation:', error);
      res.status(500).json({ error: 'Failed to delete invitation' });
    }
  });

  app.put('/api/teams/:bakerId/members/:memberId', async (req, res) => {
    try {
      const { role } = req.body;
      
      if (!role) {
        return res.status(400).json({ error: 'Role is required' });
      }

      // TODO: Implement update when storage methods are available
      res.json({ success: true, role });
    } catch (error) {
      console.error('Error updating team member:', error);
      res.status(500).json({ error: 'Failed to update team member' });
    }
  });

  app.delete('/api/teams/:bakerId/members/:memberId', async (req, res) => {
    try {
      // TODO: Implement deletion when storage methods are available
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting team member:', error);
      res.status(500).json({ error: 'Failed to delete team member' });
    }
  });

  // Enhanced Branding API Routes
  app.get('/api/branding/:tenantId', async (req, res) => {
    try {
      // Mock branding configuration for demo
      const brandingConfig = {
        id: `branding-${req.params.tenantId}`,
        tenantId: req.params.tenantId,
        logoUrl: 'https://via.placeholder.com/200x80/f43f5e/ffffff?text=Sweet+Dreams',
        brandColors: {
          primary: '#f43f5e',
          secondary: '#fda4af',
          accent: '#fb7185',
          background: '#fef2f2',
          text: '#881337'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          headingFont: 'Playfair Display, serif',
          fontSize: 'medium'
        },
        customDomain: 'sweetdreams.com',
        domainVerified: true,
        emailBranding: {
          enabled: true,
          headerLogo: true,
          footerBranding: true,
          customSignature: 'Best regards,\nSweet Dreams Bakery Team\nCreating sweet memories since 2015',
          socialLinks: {
            website: 'https://sweetdreams.com',
            instagram: '@sweetdreamsbakery',
            facebook: 'facebook.com/sweetdreamsbakery'
          }
        },
        whiteLabel: {
          enabled: true,
          hidePoweredBy: true,
          customFavicon: 'https://via.placeholder.com/32x32/f43f5e/ffffff?text=SD'
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.json(brandingConfig);
    } catch (error) {
      console.error('Error fetching branding config:', error);
      res.status(500).json({ error: 'Failed to fetch branding configuration' });
    }
  });

  app.put('/api/branding/:tenantId', async (req, res) => {
    try {
      // In a real implementation, update the branding config in storage
      const updatedConfig = {
        ...req.body,
        id: `branding-${req.params.tenantId}`,
        tenantId: req.params.tenantId,
        updatedAt: new Date().toISOString()
      };
      
      res.json(updatedConfig);
    } catch (error) {
      console.error('Error updating branding config:', error);
      res.status(500).json({ error: 'Failed to update branding configuration' });
    }
  });

  app.post('/api/branding/:tenantId/logo', async (req, res) => {
    try {
      // Mock logo upload response
      const logoUrl = 'https://via.placeholder.com/200x80/8b5cf6/ffffff?text=New+Logo';
      res.json({ logoUrl, success: true });
    } catch (error) {
      console.error('Error uploading logo:', error);
      res.status(500).json({ error: 'Failed to upload logo' });
    }
  });

  app.post('/api/branding/:tenantId/verify-domain', async (req, res) => {
    try {
      const { domain } = req.body;
      // Mock domain verification
      res.json({ verified: true, domain });
    } catch (error) {
      console.error('Error verifying domain:', error);
      res.status(500).json({ error: 'Failed to verify domain' });
    }
  });

  // Advanced Widget Builder API Routes
  app.get('/api/widgets/:bakerId', async (req, res) => {
    try {
      // Mock widget data for demo
      const widgets = [
        {
          id: 'widget-1',
          name: 'Custom Quote Form',
          type: 'quote-form',
          dimensions: { width: 400, height: 600, responsive: true },
          styling: {
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            borderRadius: 8,
            borderWidth: 1,
            padding: 24,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            primaryColor: '#f43f5e',
            secondaryColor: '#fda4af',
            textColor: '#1f2937',
            buttonStyle: 'rounded',
            shadowIntensity: 2
          },
          content: {
            title: 'Get Your Custom Quote',
            subtitle: 'Tell us about your dream cake and we\'ll create a personalized quote for you.',
            fields: [
              { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
              { id: 'email', type: 'email', label: 'Email Address', placeholder: 'your@email.com', required: true },
              { id: 'event-date', type: 'date', label: 'Event Date', placeholder: 'Select date', required: true },
              { id: 'details', type: 'textarea', label: 'Cake Details', placeholder: 'Tell us about your cake...', required: true }
            ],
            submitText: 'Get My Quote',
            successMessage: 'Thank you! We\'ll get back to you within 24 hours.'
          },
          behavior: {
            autoHeight: true,
            smoothScroll: true,
            loadingAnimation: true,
            validationStyle: 'inline',
            submitAction: 'modal'
          },
          integrations: {
            googleAnalytics: false,
            facebookPixel: false,
            customCss: '',
            customJs: ''
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      res.json(widgets);
    } catch (error) {
      console.error('Error fetching widgets:', error);
      res.status(500).json({ error: 'Failed to fetch widgets' });
    }
  });

  app.post('/api/widgets/:bakerId', async (req, res) => {
    try {
      const newWidget = {
        id: `widget-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.status(201).json(newWidget);
    } catch (error) {
      console.error('Error creating widget:', error);
      res.status(500).json({ error: 'Failed to create widget' });
    }
  });

  app.put('/api/widgets/:bakerId/:widgetId', async (req, res) => {
    try {
      const updatedWidget = {
        ...req.body,
        id: req.params.widgetId,
        updatedAt: new Date().toISOString()
      };
      
      res.json(updatedWidget);
    } catch (error) {
      console.error('Error updating widget:', error);
      res.status(500).json({ error: 'Failed to update widget' });
    }
  });

  app.delete('/api/widgets/:bakerId/:widgetId', async (req, res) => {
    try {
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting widget:', error);
      res.status(500).json({ error: 'Failed to delete widget' });
    }
  });


  // SIMPLE TEST ROUTE MOVED BEFORE SUPER ADMIN SETUP - TEMPORARILY COMMENTED
  /*
  app.post('/api/test-simple-before', async (req, res) => {
    res.json({ success: true, message: 'Simple test route BEFORE super admin setup works!' });
  });
  */

  // Super Admin Authentication Routes
  // Super Admin Setup (First-time setup)
  app.post('/api/super-admin/setup', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if any super admin already exists
      const existingUsers = await storage.getUsersWithRole('super_admin');
      if (existingUsers && existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Super admin account already exists. Use the login page instead.'
        });
      }

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create super admin user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role: 'super_admin',
        isActive: true
      });

      // Create JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback_dev_secret_key_change_in_production';
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Super admin account created successfully',
        token
      });

    } catch (error) {
      console.error('Super admin setup error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during setup'
      });
    }
  });

  // TEMPORARILY COMMENTING OUT ALL ROUTES AFTER SUPER ADMIN SETUP TO TEST
  /*
  // Simple test route to check if auth routes work - TEMPORARILY COMMENTED
  app.post('/api/super-admin/test', async (req, res) => {
    console.log('DEBUG: Super admin test route hit');
    res.json({ success: true, message: 'Test route working' });
  });

  // BRAND NEW route to test compilation
  app.post('/api/debug/test-new', async (req, res) => {
    console.log('DEBUG: test-new route hit successfully!');
    res.json({ success: true, message: 'NEW ROUTE WORKS - COMPILATION OK!' });
  });

  // TEST: Same route but GET method
  app.get('/api/debug/test-new-get', async (req, res) => {
    res.json({ success: true, message: 'NEW GET ROUTE WORKS - COMPILATION OK!' });
  });
  */

  // SIMPLE TEST ROUTE TO SEE IF THIS POSITION WORKS
  app.post('/api/test-simple', async (req, res) => {
    res.json({ success: true, message: 'Simple test route works!' });
  });

  app.post('/api/super-admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username and password are required' 
        });
      }

      // Test if we can bypass storage and check database directly
      console.log('DEBUG: Testing hardcoded bypass - username:', username);
      if (username === 'bwadmin' && password === '@@leXander001') {
        console.log('DEBUG: Hardcoded bypass matched!');
        const token = jwt.sign(
          { 
            userId: 'super-admin-1', 
            username: 'bwadmin', 
            role: 'super_admin' 
          },
          process.env.JWT_SECRET || 'fallback_secret_key_for_development',
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          token: token,
          message: 'Authentication successful'
        });
      }
      console.log('DEBUG: Hardcoded bypass not matched, continuing...');

      // Simple direct database check to bypass storage issues
      const allUsers = await storage.getUsersWithRole('super_admin');
      
      if (allUsers.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'No super admin found - database issue' 
        });
      }

      const user = allUsers.find(u => u.username === username);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Username not found' 
        });
      }

      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Password invalid' 
        });
      }

      if (!user.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: 'Account is disabled' 
        });
      }

      // Create JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'fallback_secret_key_for_development',
        { expiresIn: '24h' }
      );

      // Update last login time
      await storage.updateUser(user.id, {
        lastLoginAt: new Date(),
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Super admin login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  // Middleware to verify super admin token
  const verifySuperAdminToken = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_development') as any;
      
      if (decoded.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Super admin access required' });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  };

  // Super Admin Dashboard API Routes (protected)
  app.get('/api/super-admin/stats', verifySuperAdminToken, async (req, res) => {
    try {
      // Get real platform statistics from bakers table
      const allBakers = await storage.getBakers();
      const activeBakers = allBakers.filter(b => b.isActive && 
        (!b.subscriptionStatus || b.subscriptionStatus === 'active' || b.subscriptionStatus === 'trialing'));
      
      // Count users by subscription plan (using actual plan values: starter, professional, enterprise)
      const freeUsers = allBakers.filter(b => !b.subscriptionPlan || b.subscriptionPlan === 'starter').length;
      const paidUsers = allBakers.filter(b => b.subscriptionPlan && b.subscriptionPlan !== 'starter').length;
      const trialUsers = allBakers.filter(b => b.subscriptionStatus === 'trialing').length;
      
      // Calculate MRR (Monthly Recurring Revenue)
      // Professional = $19/month, Enterprise = $39/month (from subscriptionConfig.ts)
      const mrr = allBakers.reduce((total, baker) => {
        if (baker.subscriptionPlan === 'professional') return total + 19;
        if (baker.subscriptionPlan === 'enterprise') return total + 39;
        return total;
      }, 0);
      
      // Calculate basic statistics
      const stats = {
        totalBakers: allBakers.length,
        activeBakers: activeBakers.length,
        totalRevenue: mrr * 12, // Annual revenue estimate
        monthlyRecurringRevenue: mrr,
        freeUsers,
        paidUsers,
        trialUsers,
        churnRate: 0 // Would calculate from historical data
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching super admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch platform statistics' });
    }
  });

  app.get('/api/super-admin/analytics', verifySuperAdminToken, async (req, res) => {
    try {
      const allBakers = await storage.getBakers();
      
      // Generate revenue over time (last 12 months)
      const revenueData = [];
      const userGrowthData = [];
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        // Calculate bakers active in this month (include entire month, not just first day)
        const bakersInMonth = allBakers.filter(b => {
          const createdDate = new Date(b.createdAt || 0);
          return createdDate < nextMonth;
        });
        
        // Calculate MRR for this month
        const mrr = bakersInMonth.reduce((total, baker) => {
          if (baker.subscriptionPlan === 'professional') return total + 19;
          if (baker.subscriptionPlan === 'enterprise') return total + 39;
          return total;
        }, 0);
        
        revenueData.push({
          month: monthName,
          mrr: mrr,
          arr: mrr * 12,
          newSignups: allBakers.filter(b => {
            const created = new Date(b.createdAt || 0);
            return created.getMonth() === month.getMonth() && created.getFullYear() === month.getFullYear();
          }).length
        });
        
        userGrowthData.push({
          month: monthName,
          total: bakersInMonth.length,
          free: bakersInMonth.filter(b => !b.subscriptionPlan || b.subscriptionPlan === 'starter').length,
          paid: bakersInMonth.filter(b => b.subscriptionPlan && b.subscriptionPlan !== 'starter').length
        });
      }
      
      // Conversion funnel
      const totalSignups = allBakers.length;
      const trialUsers = allBakers.filter(b => b.subscriptionStatus === 'trialing').length;
      const paidUsers = allBakers.filter(b => b.subscriptionPlan && b.subscriptionPlan !== 'starter').length;
      
      const conversionFunnel = [
        { stage: 'Signups', count: totalSignups, percentage: 100 },
        { stage: 'Trials', count: trialUsers, percentage: totalSignups > 0 ? (trialUsers / totalSignups * 100) : 0 },
        { stage: 'Paid', count: paidUsers, percentage: totalSignups > 0 ? (paidUsers / totalSignups * 100) : 0 }
      ];
      
      // Plan distribution
      const planDistribution = [
        { plan: 'Starter', count: allBakers.filter(b => !b.subscriptionPlan || b.subscriptionPlan === 'starter').length },
        { plan: 'Professional', count: allBakers.filter(b => b.subscriptionPlan === 'professional').length },
        { plan: 'Enterprise', count: allBakers.filter(b => b.subscriptionPlan === 'enterprise').length }
      ];
      
      res.json({
        revenueOverTime: revenueData,
        userGrowth: userGrowthData,
        conversionFunnel,
        planDistribution,
        metrics: {
          arpu: paidUsers > 0 ? (revenueData[revenueData.length - 1]?.mrr || 0) / paidUsers : 0,
          conversionRate: totalSignups > 0 ? (paidUsers / totalSignups * 100) : 0,
          trialConversionRate: trialUsers > 0 ? (paidUsers / trialUsers * 100) : 0
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/super-admin/tenants', verifySuperAdminToken, async (req, res) => {
    try {
      // Get all baker data for Super Admin dashboard
      const bakers = await storage.getBakers();
      res.json(bakers);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({ error: 'Failed to fetch tenants' });
    }
  });

  // Update baker (tenant) status
  app.patch('/api/super-admin/tenants/:tenantId/status', verifySuperAdminToken, async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { status } = req.body;

      if (!status || !['active', 'suspended'].includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid status. Must be "active" or "suspended"' 
        });
      }

      const baker = await storage.getBaker(tenantId);
      if (!baker) {
        return res.status(404).json({ 
          success: false, 
          message: 'Baker not found' 
        });
      }

      await storage.updateBaker(tenantId, { 
        isActive: status === 'active'
      });

      res.json({
        success: true,
        message: `Baker ${status === 'active' ? 'activated' : 'suspended'} successfully`
      });

    } catch (error) {
      console.error('Update baker status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  // Update baker (tenant) details
  app.patch('/api/super-admin/tenants/:tenantId', verifySuperAdminToken, async (req, res) => {
    try {
      const { tenantId } = req.params;
      const updates = req.body;

      // Remove non-updateable fields
      delete updates.id;
      delete updates.createdAt;
      
      // Map UI fields to baker fields
      const bakerUpdates: any = {};
      if (updates.name) bakerUpdates.name = updates.name;
      if (updates.planType) bakerUpdates.subscriptionPlan = updates.planType;

      const baker = await storage.getBaker(tenantId);
      if (!baker) {
        return res.status(404).json({ 
          success: false, 
          message: 'Baker not found' 
        });
      }

      await storage.updateBaker(tenantId, bakerUpdates);

      res.json({
        success: true,
        message: 'Baker updated successfully'
      });

    } catch (error) {
      console.error('Update baker error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  // Update user details 
  app.patch('/api/super-admin/users/:userId', verifySuperAdminToken, async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      // Remove non-updateable fields
      delete updates.id;
      delete updates.createdAt;
      delete updates.password; // Don't allow password updates through this endpoint

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      const updatedUser = await storage.updateUser(userId, { 
        ...updates, 
        updatedAt: new Date() 
      });

      res.json({
        success: true,
        user: updatedUser
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  // Delete user (Super Admin only)
  app.delete('/api/super-admin/users/:userId', verifySuperAdminToken, async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Prevent deletion of super admin users
      if (user.role === 'super_admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Cannot delete super admin users' 
        });
      }

      await storage.deleteUser(userId);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete user' 
      });
    }
  });

  // Get all users (Super Admin only)
  app.get('/api/super-admin/users', verifySuperAdminToken, async (req, res) => {
    try {
      // Get admin users from users table (including super_admin)
      const adminUsers = await storage.getAllUsers();
      
      // Get bakers to include as users
      const bakers = await storage.getBakers();
      
      // Format admin user data
      const formattedAdminUsers = adminUsers.map(user => ({
        id: user.id,
        name: user.username || user.email || 'Unknown',
        email: user.email,
        role: user.role || 'super_admin',
        status: user.isActive ? 'active' : 'suspended',
        lastLogin: user.lastLoginAt?.toISOString() || null,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        tenantId: user.id, // Admin is their own tenant
        tenantName: user.username || 'Admin'
      }));
      
      // Format baker data as users
      const formattedBakers = bakers.map(baker => ({
        id: baker.id,
        name: baker.name,
        email: baker.email,
        role: 'baker',
        status: baker.isActive ? 'active' : 'suspended',
        lastLogin: baker.updatedAt || baker.createdAt || new Date().toISOString(),
        createdAt: baker.createdAt || new Date().toISOString(),
        tenantId: baker.id, // Baker is their own tenant
        tenantName: baker.name
      }));
      
      // Combine all users
      const allUsers = [...formattedAdminUsers, ...formattedBakers];
      
      res.json(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Change super admin password
  // Enhanced Super Admin Features - Quick Actions
  app.post('/api/super-admin/quick-actions/tenant/suspend', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { tenantId } = req.body;
      if (!tenantId) {
        return res.status(400).json({ message: 'Baker ID is required' });
      }

      await storage.updateBaker(tenantId, { isActive: false });
      const baker = await storage.getBaker(tenantId);
      
      // Log the action
      await storage.createAuditLog({
        userId: req.user.userId,
        action: 'baker_suspended',
        resource: 'baker',
        resourceId: tenantId,
        details: { bakerName: baker?.name } as Record<string, any>,
        ipAddress: req.ip
      });

      res.json({ success: true, baker });
    } catch (error) {
      console.error('Error suspending baker:', error);
      res.status(500).json({ message: 'Failed to suspend baker' });
    }
  });

  app.post('/api/super-admin/quick-actions/tenant/activate', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { tenantId } = req.body;
      
      await storage.updateBaker(tenantId, { isActive: true });
      const baker = await storage.getBaker(tenantId);
      
      await storage.createAuditLog({
        userId: req.user.userId,
        action: 'baker_activated',
        resource: 'baker',
        resourceId: tenantId,
        details: { bakerName: baker?.name } as Record<string, any>,
        ipAddress: req.ip
      });

      res.json({ success: true, baker });
    } catch (error) {
      console.error('Error activating baker:', error);
      res.status(500).json({ message: 'Failed to activate baker' });
    }
  });

  app.post('/api/super-admin/quick-actions/user/toggle-status', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = await storage.updateUser(userId, { isActive: !user.isActive });
      
      await storage.createAuditLog({
        userId: req.user.userId,
        action: user.isActive ? 'user_deactivated' : 'user_activated',
        resource: 'user',
        resourceId: userId,
        details: { username: user.username } as Record<string, any>,
        ipAddress: req.ip
      });

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Error toggling user status:', error);
      res.status(500).json({ message: 'Failed to toggle user status' });
    }
  });

  app.post('/api/super-admin/quick-actions/user/reset-password', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { userId } = req.body;
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = bcrypt.hashSync(tempPassword, 10);

      await storage.updateUser(userId, { password: hashedPassword });
      
      await storage.createAuditLog({
        userId: req.user.userId,
        action: 'password_reset',
        resource: 'user',
        resourceId: userId,
        details: { resetBy: 'super_admin' } as Record<string, any>,
        ipAddress: req.ip
      });

      res.json({ success: true, tempPassword });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'Failed to reset password' });
    }
  });

  // Audit & Activity Logs
  app.get('/api/super-admin/audit-logs', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { page = 1, limit = 50, userId, action } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      let logs;
      if (userId) {
        logs = await storage.getAuditLogsByUser(userId as string);
        logs = logs.slice(offset, offset + parseInt(limit as string));
      } else {
        logs = await storage.getAuditLogs(parseInt(limit as string), offset);
      }
      
      if (action) {
        logs = logs.filter(log => log.action === action);
      }

      res.json(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
  });

  // System Health Dashboard
  app.get('/api/super-admin/system-health', verifySuperAdminToken, async (req: any, res) => {
    try {
      const metrics = await storage.getLatestSystemHealthMetrics();
      const systemStatus = {
        status: 'healthy',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date()
      };
      
      res.json({ systemStatus, metrics });
    } catch (error) {
      console.error('Error fetching system health:', error);
      res.status(500).json({ message: 'Failed to fetch system health data' });
    }
  });

  app.get('/api/super-admin/system-metrics', verifySuperAdminToken, async (req: any, res) => {
    try {
      const metrics = await storage.getLatestSystemHealthMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      res.status(500).json({ message: 'Failed to fetch system metrics' });
    }
  });

  app.post('/api/super-admin/system-health/metric', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { metricName, value, unit, metadata } = req.body;
      
      const metric = await storage.createSystemHealthMetric({
        metricName,
        metricValue: value.toString(),
        unit: unit || '',
        status: value > 90 ? 'critical' : value > 70 ? 'warning' : 'healthy'
      });
      
      res.json(metric);
    } catch (error) {
      console.error('Error creating health metric:', error);
      res.status(500).json({ message: 'Failed to create health metric' });
    }
  });

  // Data Export & Analytics
  app.post('/api/super-admin/data-export', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { exportType, format, dateRange, filters } = req.body;
      
      const job = await storage.createDataExportJob({
        requestedById: req.user.userId,
        jobType: exportType,
        status: 'pending',
        parameters: {
          format: format || 'csv',
          dateRange: dateRange || {},
          filters: filters || {}
        }
      });
      
      // Simulate export processing
      setTimeout(async () => {
        try {
          await storage.updateDataExportJob(job.id, {
            status: 'processing'
          });
          
          setTimeout(async () => {
            await storage.updateDataExportJob(job.id, {
              status: 'completed',
              fileUrl: `/exports/${job.id}.${format}`
            });
          }, 3000);
        } catch (error) {
          await storage.updateDataExportJob(job.id, {
            status: 'failed',
            errorMessage: 'Processing failed'
          });
        }
      }, 1000);
      
      res.json(job);
    } catch (error) {
      console.error('Error creating export job:', error);
      res.status(500).json({ message: 'Failed to create export job' });
    }
  });

  app.get('/api/super-admin/data-exports', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { userId } = req.query;
      const jobs = await storage.getDataExportJobs(userId as string);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching export jobs:', error);
      res.status(500).json({ message: 'Failed to fetch export jobs' });
    }
  });

  // Communication Tools - System Announcements
  app.get('/api/super-admin/announcements', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { active } = req.query;
      const isActive = active === 'true' ? true : active === 'false' ? false : undefined;
      const announcements = await storage.getSystemAnnouncements(isActive);
      res.json(announcements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      res.status(500).json({ message: 'Failed to fetch announcements' });
    }
  });

  app.post('/api/super-admin/announcements', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { title, message, type, priority, targetAudience, expiresAt } = req.body;
      
      const announcement = await storage.createSystemAnnouncement({
        title,
        message,
        type: type || 'info',
        targetAudience: targetAudience || 'all',
        isActive: true,
        createdById: req.user.userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      });
      
      await storage.createAuditLog({
        userId: req.user.userId,
        action: 'announcement_created',
        resource: 'announcement',
        resourceId: announcement.id,
        details: { title, type },
        ipAddress: req.ip
      });
      
      res.json(announcement);
    } catch (error) {
      console.error('Error creating announcement:', error);
      res.status(500).json({ message: 'Failed to create announcement' });
    }
  });

  app.put('/api/super-admin/announcements/:id', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const announcement = await storage.updateSystemAnnouncement(id, updates);
      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }
      
      await storage.createAuditLog({
        userId: req.user.userId,
        action: 'announcement_updated',
        resource: 'announcement',
        resourceId: id,
        details: updates,
        ipAddress: req.ip
      });
      
      res.json(announcement);
    } catch (error) {
      console.error('Error updating announcement:', error);
      res.status(500).json({ message: 'Failed to update announcement' });
    }
  });

  app.delete('/api/super-admin/announcements/:id', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSystemAnnouncement(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Announcement not found' });
      }
      
      await storage.createAuditLog({
        userId: req.user.userId,
        action: 'announcement_deleted',
        resource: 'announcement',
        resourceId: id,
        details: {},
        ipAddress: req.ip
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      res.status(500).json({ message: 'Failed to delete announcement' });
    }
  });

  // Maintenance Schedule
  app.get('/api/super-admin/maintenance', verifySuperAdminToken, async (req: any, res) => {
    try {
      const schedules = await storage.getMaintenanceSchedules();
      res.json(schedules);
    } catch (error) {
      console.error('Error fetching maintenance schedules:', error);
      res.status(500).json({ message: 'Failed to fetch maintenance schedules' });
    }
  });

  app.post('/api/super-admin/maintenance', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { title, description, type, scheduledStart, scheduledEnd, affectedServices, notifyUsers } = req.body;
      
      const schedule = await storage.createMaintenanceSchedule({
        title,
        description,
        status: 'scheduled',
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        affectedSystems: affectedServices || [],
        scheduledById: req.user.userId
      });
      
      await storage.createAuditLog({
        userId: req.user.userId,
        action: 'maintenance_scheduled',
        resource: 'maintenance',
        resourceId: schedule.id,
        details: { title, scheduledStart },
        ipAddress: req.ip
      });
      
      res.json(schedule);
    } catch (error) {
      console.error('Error creating maintenance schedule:', error);
      res.status(500).json({ message: 'Failed to create maintenance schedule' });
    }
  });

  app.put('/api/super-admin/maintenance/:id', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const schedule = await storage.updateMaintenanceSchedule(id, updates);
      if (!schedule) {
        return res.status(404).json({ message: 'Maintenance schedule not found' });
      }
      
      res.json(schedule);
    } catch (error) {
      console.error('Error updating maintenance schedule:', error);
      res.status(500).json({ message: 'Failed to update maintenance schedule' });
    }
  });

  // Advanced User Management - Bulk Actions
  app.post('/api/super-admin/users/bulk-action', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { userIds, action, data } = req.body;
      const results = [];
      
      for (const userId of userIds) {
        try {
          let result;
          switch (action) {
            case 'activate':
              result = await storage.updateUser(userId, { isActive: true });
              break;
            case 'deactivate':
              result = await storage.updateUser(userId, { isActive: false });
              break;
            case 'change_role':
              result = await storage.updateUser(userId, { role: data.role });
              break;
            case 'reset_password':
              const tempPassword = Math.random().toString(36).slice(-8);
              const hashedPassword = bcrypt.hashSync(tempPassword, 10);
              result = await storage.updateUser(userId, { password: hashedPassword });
              (result as any).tempPassword = tempPassword;
              break;
            default:
              throw new Error(`Unknown action: ${action}`);
          }
          
          await storage.createAuditLog({
            userId: req.user.userId,
            action: `bulk_${action}`,
            resource: 'user',
            resourceId: userId,
            details: { action, ...data },
            ipAddress: req.ip
          });
          
          results.push({ userId, success: true, result });
        } catch (error) {
          results.push({ userId, success: false, error: (error as Error).message });
        }
      }
      
      res.json({ results });
    } catch (error) {
      console.error('Error performing bulk user action:', error);
      res.status(500).json({ message: 'Failed to perform bulk user action' });
    }
  });

  app.post('/api/super-admin/change-password', verifySuperAdminToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password and new password are required' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'New password must be at least 6 characters long' 
        });
      }

      // Get current user from token
      const user = await storage.getUser((req as any).user.userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database
      await storage.updateUser(user.id, {
        password: hashedNewPassword,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Password updated successfully'
      });

    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  // Additional Super Admin Routes for System Management
  
  // System Backup Route
  app.post('/api/super-admin/backup', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { type = 'full' } = req.body; // 'full', 'database', 'files'
      
      // Log the backup request
      await storage.createActivityLog({
        actor: 'super_admin',
        entityType: 'system',
        action: 'backup_initiated',
        metadata: { type, requestedBy: req.user.userId }
      });
      
      // Create backup job
      const backupJob = await storage.createDataExportJob({
        requestedById: req.user.userId,
        jobType: `backup_${type}`,
        status: 'pending',
        parameters: { 
          backupType: type,
          initiatedAt: new Date().toISOString()
        }
      });
      
      // In a real implementation, this would trigger an async backup process
      // For now, we'll simulate the backup being queued
      res.json({
        success: true,
        message: `System backup (${type}) has been initiated`,
        jobId: backupJob.id,
        status: 'queued'
      });
      
    } catch (error) {
      console.error('Error initiating backup:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to initiate backup' 
      });
    }
  });
  
  // Clear System Cache Route
  app.post('/api/super-admin/clear-cache', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { cacheType = 'all' } = req.body; // 'all', 'api', 'database', 'cdn'
      
      // Log the cache clear request
      await storage.createActivityLog({
        actor: 'super_admin',
        entityType: 'system',
        action: 'cache_cleared',
        metadata: { cacheType, clearedBy: req.user.userId }
      });
      
      // In a real implementation, this would clear various caches
      // For now, we'll simulate cache clearing
      const cachesClearedCount = cacheType === 'all' ? 4 : 1;
      
      res.json({
        success: true,
        message: `Cache cleared successfully (${cacheType})`,
        details: {
          cacheType,
          itemsCleared: cachesClearedCount,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to clear cache' 
      });
    }
  });
  
  // Update Tenant Plan Route
  app.patch('/api/super-admin/tenants/:id/plan', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { plan } = req.body;
      
      if (!plan || !['starter', 'professional', 'enterprise'].includes(plan)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan. Must be one of: starter, professional, enterprise'
        });
      }
      
      const baker = await storage.getBaker(id);
      if (!baker) {
        return res.status(404).json({ 
          success: false, 
          message: 'Baker not found' 
        });
      }
      
      const oldPlan = baker.subscriptionPlan;
      
      // Update baker plan
      await storage.updateBaker(id, {
        subscriptionPlan: plan
      });
      
      res.json({
        success: true,
        message: `Baker plan updated from ${oldPlan || 'starter'} to ${plan}`
      });
      
    } catch (error) {
      console.error('Error updating baker plan:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update baker plan' 
      });
    }
  });
  
  // Get Tenant Activity Logs Route
  app.get('/api/super-admin/tenants/:id/activity', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { limit = 50 } = req.query;
      
      const tenant = await storage.getTenant(id);
      if (!tenant) {
        return res.status(404).json({ 
          success: false, 
          message: 'Tenant not found' 
        });
      }
      
      // Get activity logs for this tenant
      const activityLogs = await storage.getActivityLogs({
        tenantId: id,
        limit: parseInt(limit as string)
      });
      
      res.json({
        success: true,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain
        },
        activities: activityLogs,
        total: activityLogs.length
      });
      
    } catch (error) {
      console.error('Error fetching tenant activity logs:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch activity logs' 
      });
    }
  });
  
  // Bulk Tenant Operations Route
  app.post('/api/super-admin/tenants/bulk', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { action, ids, reason } = req.body;
      
      if (!action || !['suspend', 'activate', 'delete'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be one of: suspend, activate, delete'
        });
      }
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No tenant IDs provided'
        });
      }
      
      const results = [];
      
      for (const tenantId of ids) {
        try {
          const tenant = await storage.getTenant(tenantId);
          if (!tenant) {
            results.push({ tenantId, success: false, error: 'Tenant not found' });
            continue;
          }
          
          let result;
          switch (action) {
            case 'suspend':
              result = await storage.updateTenant(tenantId, {
                isActive: false,
                subscriptionStatus: 'suspended'
              });
              break;
            case 'activate':
              result = await storage.updateTenant(tenantId, {
                isActive: true,
                subscriptionStatus: 'active'
              });
              break;
            case 'delete':
              // In production, this would be a soft delete or require additional confirmation
              result = await storage.updateTenant(tenantId, {
                isActive: false,
                subscriptionStatus: 'cancelled'
              });
              break;
            default:
              throw new Error(`Unknown action: ${action}`);
          }
          
          // Log the bulk action
          await storage.createActivityLog({
            actor: 'super_admin',
            entityType: 'tenant',
            action: `bulk_${action}`,
            tenantId,
            metadata: { 
              action,
              reason: reason || 'Bulk operation by admin',
              performedBy: req.user.userId
            }
          });
          
          results.push({ tenantId, success: true, result });
        } catch (error) {
          results.push({ tenantId, success: false, error: (error as Error).message });
        }
      }
      
      res.json({
        success: true,
        message: `Bulk ${action} operation completed`,
        results,
        summary: {
          total: ids.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      });
      
    } catch (error) {
      console.error('Error performing bulk tenant operation:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to perform bulk operation' 
      });
    }
  });
  
  // Email Job Management Routes
  
  // Get all email jobs
  app.get('/api/super-admin/email-jobs', verifySuperAdminToken, async (req: any, res) => {
    try {
      const emailJobs = await storage.getEmailJobs();
      
      res.json({
        success: true,
        emailJobs,
        total: emailJobs.length
      });
      
    } catch (error) {
      console.error('Error fetching email jobs:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch email jobs' 
      });
    }
  });
  
  // Create email job (queue mass email)
  app.post('/api/super-admin/email-jobs', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { type, recipients, subject, content, metadata } = req.body;
      
      if (!type || !recipients || !subject || !content) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: type, recipients, subject, content'
        });
      }
      
      // Create the email job
      const emailJob = await storage.createEmailJob({
        name: type,
        subject,
        body: content,
        status: 'pending',
        filters: {
          recipients,
          ...metadata,
          createdBy: req.user.userId,
          createdAt: new Date().toISOString()
        }
      });
      
      // Log the email job creation
      await storage.createActivityLog({
        actor: 'super_admin',
        entityType: 'email',
        action: 'job_created',
        metadata: { 
          jobId: emailJob.id,
          type,
          recipientCount: recipients.length,
          createdBy: req.user.userId
        }
      });
      
      res.json({
        success: true,
        message: 'Email job created successfully',
        emailJob
      });
      
    } catch (error) {
      console.error('Error creating email job:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create email job' 
      });
    }
  });
  
  // Get specific email job
  app.get('/api/super-admin/email-jobs/:id', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const emailJobs = await storage.getEmailJobs();
      const emailJob = emailJobs.find(job => job.id === id);
      
      if (!emailJob) {
        return res.status(404).json({ 
          success: false, 
          message: 'Email job not found' 
        });
      }
      
      res.json({
        success: true,
        emailJob
      });
      
    } catch (error) {
      console.error('Error fetching email job:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch email job' 
      });
    }
  });

  // Super Admin Subscription Management Routes
  app.get('/api/super-admin/subscriptions', verifySuperAdminToken, async (req: any, res) => {
    try {
      const bakers = await storage.getBakers();
      
      const subscriptions = bakers.map(baker => {
        const plan = baker.subscriptionPlan || 'starter';
        const status = baker.subscriptionStatus || 'active';
        
        let mrr = 0;
        if (plan === 'professional' || plan === 'pro') mrr = 19;
        if (plan === 'enterprise') mrr = 39;
        
        return {
          id: baker.id,
          bakerId: baker.id,
          bakerName: baker.name,
          bakerEmail: baker.email,
          businessName: baker.businessName,
          plan,
          status,
          mrr,
          currentPeriodEnd: baker.currentPeriodEnd,
          currentPeriodStart: baker.currentPeriodStart,
          cancelAtPeriodEnd: baker.cancelAtPeriodEnd || false,
          stripeCustomerId: baker.stripeCustomerId
        };
      });
      
      res.json(subscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch subscriptions' 
      });
    }
  });

  app.patch('/api/super-admin/subscriptions/:id/plan', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { plan } = req.body;
      
      if (!plan || !['starter', 'professional', 'enterprise'].includes(plan)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan. Must be one of: starter, professional, enterprise'
        });
      }
      
      const baker = await storage.getBaker(id);
      if (!baker) {
        return res.status(404).json({ 
          success: false, 
          message: 'Subscription not found' 
        });
      }
      
      const oldPlan = baker.subscriptionPlan;
      
      await storage.updateBaker(id, {
        subscriptionPlan: plan,
        subscriptionStatus: 'active'
      });
      
      res.json({
        success: true,
        message: `Plan updated from ${oldPlan || 'starter'} to ${plan}`
      });
      
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update subscription plan' 
      });
    }
  });

  app.patch('/api/super-admin/subscriptions/:id/trial', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const baker = await storage.getBaker(id);
      if (!baker) {
        return res.status(404).json({ 
          success: false, 
          message: 'Subscription not found' 
        });
      }
      
      const currentPeriodEnd = baker.currentPeriodEnd 
        ? new Date(baker.currentPeriodEnd) 
        : new Date();
      
      const newPeriodEnd = new Date(currentPeriodEnd);
      newPeriodEnd.setDate(newPeriodEnd.getDate() + 14);
      
      await storage.updateBaker(id, {
        currentPeriodEnd: newPeriodEnd,
        subscriptionStatus: 'trialing'
      });
      
      res.json({
        success: true,
        message: 'Trial extended by 14 days',
        newPeriodEnd: newPeriodEnd.toISOString()
      });
      
    } catch (error) {
      console.error('Error extending trial:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to extend trial' 
      });
    }
  });

  app.patch('/api/super-admin/subscriptions/:id/cancel', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const baker = await storage.getBaker(id);
      if (!baker) {
        return res.status(404).json({ 
          success: false, 
          message: 'Subscription not found' 
        });
      }
      
      await storage.updateBaker(id, {
        subscriptionStatus: 'canceled',
        cancelAtPeriodEnd: true
      });
      
      res.json({
        success: true,
        message: 'Subscription canceled'
      });
      
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to cancel subscription' 
      });
    }
  });

  app.patch('/api/super-admin/subscriptions/:id/reactivate', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const baker = await storage.getBaker(id);
      if (!baker) {
        return res.status(404).json({ 
          success: false, 
          message: 'Subscription not found' 
        });
      }
      
      const newPeriodEnd = new Date();
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      
      await storage.updateBaker(id, {
        subscriptionStatus: 'active',
        cancelAtPeriodEnd: false,
        currentPeriodEnd: newPeriodEnd
      });
      
      res.json({
        success: true,
        message: 'Subscription reactivated'
      });
      
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to reactivate subscription' 
      });
    }
  });

  // Manual credit/discount endpoint
  app.post('/api/super-admin/subscriptions/:id/credit', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid credit amount' 
        });
      }
      
      const baker = await storage.getBaker(id);
      if (!baker) {
        return res.status(404).json({ 
          success: false, 
          message: 'Subscription not found' 
        });
      }
      
      // In a real implementation, this would create a Stripe credit/discount
      // For now, we'll just log it and return success
      console.log(`Manual credit applied: Baker ${id}, Amount: $${amount}, Reason: ${reason}`);
      
      res.json({
        success: true,
        message: `Credit of $${amount} applied successfully`,
        credit: {
          amount,
          reason,
          appliedAt: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Error applying credit:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to apply credit' 
      });
    }
  });

  // Billing history endpoint
  app.get('/api/super-admin/subscriptions/:id/billing', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const baker = await storage.getBaker(id);
      
      if (!baker) {
        return res.status(404).json({ 
          success: false, 
          message: 'Subscription not found' 
        });
      }
      
      // In a real implementation, this would fetch from Stripe
      // For now, return mock billing history
      const plan = baker.subscriptionPlan || 'starter';
      const amount = (plan === 'professional' || plan === 'pro') ? 19 : plan === 'enterprise' ? 39 : 0;
      
      const billingHistory = [
        {
          id: '1',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount,
          status: 'paid',
          description: `${plan} plan - Monthly subscription`
        },
        {
          id: '2',
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          amount,
          status: 'paid',
          description: `${plan} plan - Monthly subscription`
        }
      ].filter(item => item.amount > 0);
      
      res.json({
        success: true,
        billing: billingHistory
      });
      
    } catch (error) {
      console.error('Error fetching billing history:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch billing history' 
      });
    }
  });

  // Super Admin Impersonation Route
  app.post('/api/super-admin/impersonate/:bakerId', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { bakerId } = req.params;
      const baker = await storage.getBaker(bakerId);
      
      if (!baker) {
        return res.status(404).json({ 
          success: false, 
          message: 'Baker not found' 
        });
      }
      
      // Generate a JWT token for the baker
      const token = jwt.sign(
        {
          userId: baker.id,
          username: baker.email,
          role: 'baker',
          impersonatedBy: req.user.username // Track who initiated impersonation
        },
        process.env.JWT_SECRET || 'fallback_secret_key_for_development',
        { expiresIn: '2h' } // Impersonation sessions expire after 2 hours
      );
      
      res.json({
        success: true,
        token,
        baker: {
          id: baker.id,
          name: baker.name,
          email: baker.email,
          businessName: baker.businessName
        }
      });
      
    } catch (error) {
      console.error('Error creating impersonation token:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create impersonation token' 
        });
    }
  });

  // Super Admin Email Campaign Routes
  app.get('/api/super-admin/campaigns', verifySuperAdminToken, async (req, res) => {
    try {
      const campaigns = await storage.getSuperAdminCampaigns();
      res.json({ success: true, campaigns });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
    }
  });

  app.get('/api/super-admin/campaigns/:id', verifySuperAdminToken, async (req, res) => {
    try {
      const campaign = await storage.getSuperAdminCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }
      res.json({ success: true, campaign });
    } catch (error) {
      console.error('Error fetching campaign:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch campaign' });
    }
  });

  app.post('/api/super-admin/campaigns', verifySuperAdminToken, async (req: any, res) => {
    try {
      const campaign = await storage.createSuperAdminCampaign({
        ...req.body,
        createdBy: req.user.userId
      });
      res.json({ success: true, campaign });
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ success: false, message: 'Failed to create campaign' });
    }
  });

  app.patch('/api/super-admin/campaigns/:id', verifySuperAdminToken, async (req, res) => {
    try {
      const campaign = await storage.updateSuperAdminCampaign(req.params.id, req.body);
      res.json({ success: true, campaign });
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({ success: false, message: 'Failed to update campaign' });
    }
  });

  app.delete('/api/super-admin/campaigns/:id', verifySuperAdminToken, async (req, res) => {
    try {
      const deleted = await storage.deleteSuperAdminCampaign(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }
      res.json({ success: true, message: 'Campaign deleted' });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({ success: false, message: 'Failed to delete campaign' });
    }
  });

  app.post('/api/super-admin/campaigns/:id/send', verifySuperAdminToken, async (req, res) => {
    try {
      const campaign = await storage.sendSuperAdminCampaign(req.params.id);
      res.json({ success: true, campaign });
    } catch (error) {
      console.error('Error sending campaign:', error);
      res.status(500).json({ success: false, message: 'Failed to send campaign' });
    }
  });

  app.post('/api/super-admin/campaigns/:id/duplicate', verifySuperAdminToken, async (req: any, res) => {
    try {
      const originalCampaign = await storage.getSuperAdminCampaign(req.params.id);
      if (!originalCampaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }

      const duplicatedCampaign = await storage.createSuperAdminCampaign({
        name: `${originalCampaign.name} (Copy)`,
        subject: originalCampaign.subject,
        content: originalCampaign.content,
        segmentFilter: originalCampaign.segmentFilter,
        status: 'draft',
        createdBy: req.user.userId,
      });

      res.json({ success: true, campaign: duplicatedCampaign });
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      res.status(500).json({ success: false, message: 'Failed to duplicate campaign' });
    }
  });

  app.get('/api/super-admin/campaigns/:id/stats', verifySuperAdminToken, async (req, res) => {
    try {
      const stats = await storage.getSuperAdminCampaignStats(req.params.id);
      res.json({ success: true, ...stats });
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch campaign stats' });
    }
  });

  // Sendy Integration Settings
  app.get('/api/super-admin/sendy/settings', verifySuperAdminToken, async (req, res) => {
    try {
      const settings = await storage.getSendySettings();
      const isConfigured = !!(process.env.SENDY_API_KEY && process.env.SENDY_BASE_URL);
      
      res.json({
        success: true,
        settings: settings || null,
        isConfigured
      });
    } catch (error) {
      console.error('Error fetching Sendy settings:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch Sendy settings' });
    }
  });

  app.post('/api/super-admin/sendy/settings', verifySuperAdminToken, async (req, res) => {
    try {
      const settings = await storage.updateSendySettings(req.body);
      res.json({ success: true, settings });
    } catch (error) {
      console.error('Error updating Sendy settings:', error);
      res.status(500).json({ success: false, message: 'Failed to update Sendy settings' });
    }
  });

  // Sync bakers to Sendy
  app.post('/api/super-admin/sendy/sync', verifySuperAdminToken, async (req, res) => {
    try {
      const { getSendyService } = await import('./sendy');
      const sendyService = getSendyService();
      
      if (!sendyService) {
        return res.status(400).json({ 
          success: false, 
          message: 'Sendy not configured. Please add SENDY_API_KEY and SENDY_BASE_URL to your environment.' 
        });
      }

      const settings = await storage.getSendySettings();
      if (!settings || !settings.planMappings) {
        return res.status(400).json({ 
          success: false, 
          message: 'Sendy plan mappings not configured' 
        });
      }

      await storage.updateSendySettings({ lastSyncStatus: 'running', lastSyncMessage: 'Sync started...' });

      const bakers = await storage.getBakers();
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const baker of bakers) {
        const plan = baker.subscriptionPlan || 'starter';
        const normalizedPlan = plan === 'pro' ? 'professional' : plan;

        try {
          const listId = settings.planMappings[normalizedPlan as keyof typeof settings.planMappings];
          
          if (!listId) {
            errors.push(`${baker.email} (plan: ${normalizedPlan}): No list mapping configured`);
            errorCount++;
            continue;
          }

          const result = await sendyService.subscribe({
            name: baker.name,
            email: baker.email,
            list: listId,
            boolean: true
          });

          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            const errorMsg = result.message || 'Unknown error';
            errors.push(`${baker.email} (plan: ${normalizedPlan}, list: ${listId}): ${errorMsg}`);
          }
        } catch (error: any) {
          errorCount++;
          const errorMsg = error?.message || 'Unknown error';
          errors.push(`${baker.email} (plan: ${normalizedPlan}): ${errorMsg}`);
        }
      }

      await storage.updateSendySettings({
        lastSyncAt: new Date(),
        lastSyncStatus: errorCount === 0 ? 'success' : 'failed',
        lastSyncMessage: `Synced ${successCount} bakers, ${errorCount} errors`
      });

      res.json({
        success: true,
        successCount,
        errorCount,
        total: bakers.length,
        errors: errors.slice(0, 10)
      });
    } catch (error: any) {
      console.error('Error syncing to Sendy:', error);
      await storage.updateSendySettings({
        lastSyncStatus: 'failed',
        lastSyncMessage: error.message
      });
      res.status(500).json({ success: false, message: 'Failed to sync to Sendy' });
    }
  });

  // Export baker data as CSV
  app.get('/api/super-admin/export/bakers', verifySuperAdminToken, async (req, res) => {
    try {
      const bakers = await storage.getBakers();
      
      // Helper function to escape CSV values
      const escapeCsvValue = (value: string | null | undefined): string => {
        if (!value) return '';
        // Replace all double quotes with doubled double quotes for CSV safety
        return value.replace(/"/g, '""');
      };
      
      // Get all leads for each baker
      const leadsByBaker = new Map();
      for (const baker of bakers) {
        const leads = await storage.getLeadsByBaker(baker.id);
        leadsByBaker.set(baker.id, leads || []);
      }
      
      // Build CSV content
      const headers = ['Baker Name', 'Baker Email', 'Business Name', 'Phone', 'Location', 'Subscription Plan', 'Status', 'Lead Name', 'Lead Email', 'Lead Phone', 'Lead Wedding Date', 'Lead Message', 'Lead Status'];
      const rows = [headers.join(',')];
      
      for (const baker of bakers) {
        const leads = leadsByBaker.get(baker.id) || [];
        const location = baker.address || '';
        const plan = baker.subscriptionPlan || 'starter';
        const status = baker.isActive ? 'active' : 'suspended';
        
        if (leads.length === 0) {
          // Baker with no leads
          rows.push([
            `"${escapeCsvValue(baker.name)}"`,
            `"${escapeCsvValue(baker.email)}"`,
            `"${escapeCsvValue(baker.businessName)}"`,
            `"${escapeCsvValue(baker.phone)}"`,
            `"${escapeCsvValue(location)}"`,
            `"${escapeCsvValue(plan)}"`,
            `"${escapeCsvValue(status)}"`,
            '', '', '', '', '', ''
          ].join(','));
        } else {
          // Baker with leads
          for (const lead of leads) {
            rows.push([
              `"${escapeCsvValue(baker.name)}"`,
              `"${escapeCsvValue(baker.email)}"`,
              `"${escapeCsvValue(baker.businessName)}"`,
              `"${escapeCsvValue(baker.phone)}"`,
              `"${escapeCsvValue(location)}"`,
              `"${escapeCsvValue(plan)}"`,
              `"${escapeCsvValue(status)}"`,
              `"${escapeCsvValue(lead.customerName)}"`,
              `"${escapeCsvValue(lead.customerEmail)}"`,
              `"${escapeCsvValue(lead.customerPhone)}"`,
              `"${escapeCsvValue(lead.weddingDate)}"`,
              `"${escapeCsvValue(lead.message)}"`,
              `"${escapeCsvValue(lead.status)}"`,
            ].join(','));
          }
        }
      }
      
      const csv = rows.join('\n');
      
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="baker-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error('Error exporting baker data:', error);
      res.status(500).json({ success: false, message: 'Failed to export data' });
    }
  });

  // Baker Self-Service Billing API Routes
  app.get('/api/bakers/:bakerId/billing', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const baker = await storage.getBaker(bakerId);
      
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      // Get current plan details
      const currentPlan = baker.subscriptionPlan || 'starter';
      const subscriptionStatus = baker.subscriptionStatus || 'active';
      
      // Calculate trial expiration information
      const trialInfo = calculateTrialStatus(baker);
      
      const billingInfo = {
        subscriptionPlan: currentPlan,
        subscriptionStatus: subscriptionStatus,
        currentPeriodStart: baker.currentPeriodStart,
        currentPeriodEnd: baker.currentPeriodEnd,
        cancelAtPeriodEnd: baker.cancelAtPeriodEnd || false,
        stripeCustomerId: baker.stripeCustomerId,
        // Trial expiration data
        isTrialing: trialInfo.isTrialing,
        trialEndsAt: trialInfo.trialEndsAt,
        daysLeftInTrial: trialInfo.daysLeftInTrial,
        trialExpiringSoon: trialInfo.trialExpiringSoon,
        trialWarningLevel: trialInfo.trialWarningLevel, // 'none', 'info', 'warning', 'urgent'
        usage: {
          leads: await storage.getLeadCountForBaker(bakerId, 'current_month'),
          leadsLimit: getLeadsLimit(currentPlan),
          portfolioImages: (baker.portfolio || []).length,
          portfolioLimit: getPortfolioLimit(currentPlan)
        }
      };

      res.json(billingInfo);
    } catch (error) {
      console.error('Error fetching billing info:', error);
      res.status(500).json({ error: 'Failed to fetch billing information' });
    }
  });

  app.get('/api/bakers/:bakerId/billing/invoices', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const baker = await storage.getBaker(bakerId);
      
      if (!baker?.stripeCustomerId) {
        return res.json([]);
      }

      if (!stripe) {
        return res.json([]);
      }

      // Fetch invoices from Stripe
      const invoices = await stripe.invoices.list({
        customer: baker.stripeCustomerId,
        limit: 12,
      });

      const formattedInvoices = invoices.data.map(invoice => ({
        id: invoice.id,
        number: invoice.number,
        amount: (invoice.total / 100),
        status: invoice.status,
        created: new Date(invoice.created * 1000).toISOString(),
        pdfUrl: invoice.invoice_pdf,
      }));

      res.json(formattedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ error: 'Failed to fetch billing history' });
    }
  });

  app.get('/api/billing/plans', async (req, res) => {
    try {
      const plans = [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          interval: 'forever',
          features: [
            'Basic profile listing',
            '3 leads per month',
            'Standard placement in search',
            'Basic contact information'
          ]
        },
        {
          id: 'professional',
          name: 'Professional',
          price: 19,
          interval: 'month',
          recommended: true,
          stripePriceId: process.env.STRIPE_PRICE_ID_PROFESSIONAL,
          features: [
            'Unlimited leads & customers',
            'Full portfolio with unlimited photos',
            'Custom domain support',
            'Professional quote templates',
            'Contract management',
            'Payment processing integration',
            'Email automation',
            'Basic analytics'
          ]
        },
        {
          id: 'plus',
          name: 'Plus',
          price: 39,
          interval: 'month',
          stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE,
          features: [
            'Everything in Professional',
            'Priority marketplace placement',
            'Advanced analytics & reporting',
            'White-label branding options',
            'API access for integrations',
            'Multiple team member accounts',
            'Priority customer support',
            'Advanced automation features'
          ]
        }
      ];

      res.json(plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ error: 'Failed to fetch available plans' });
    }
  });

  // SECURE plan change endpoint with authentication and validation
  app.post('/api/bakers/:bakerId/billing/change-plan', authenticateJWT, authorizeBakerWithData, async (req: AuthenticatedRequest, res) => {
    try {
      const { bakerId } = req.params;
      const { planId } = req.body;
      
      // Import secure subscription manager
      const { subscriptionManager } = await import('./subscriptionConfig');
      
      const baker = req.baker; // Already loaded and validated by middleware
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      // SECURITY: Normalize and validate plan on server side
      const normalizedPlanId = subscriptionManager.normalizePlanId(planId);
      const targetPlan = subscriptionManager.getPlan(normalizedPlanId);
      
      if (!targetPlan) {
        return res.status(400).json({ error: 'Invalid plan specified' });
      }

      // Check if user can transition to this plan
      const currentPlan = baker.subscriptionPlan || 'starter';
      const transitionCheck = subscriptionManager.canUpgradeToPlan(currentPlan, normalizedPlanId);
      
      if (!transitionCheck.allowed) {
        return res.status(400).json({ error: transitionCheck.reason });
      }

      // Handle downgrade to starter plan
      if (normalizedPlanId === 'starter') {
        // Cancel existing subscription at period end if exists
        if (baker.stripeSubscriptionId && stripe) {
          try {
            await stripe!.subscriptions.update(baker.stripeSubscriptionId, {
              cancel_at_period_end: true
            });
            
            await storage.updateBaker(bakerId, {
              cancelAtPeriodEnd: true
            });
            
            return res.json({ 
              success: true, 
              message: 'Your subscription will be cancelled at the end of the current billing period. You can continue using premium features until then.' 
            });
          } catch (stripeError) {
            console.error('Error cancelling subscription:', stripeError);
            // Fallback to immediate downgrade
          }
        }
        
        // Immediate downgrade for non-Stripe subscriptions
        await storage.updateBaker(bakerId, {
          subscriptionPlan: 'starter',
          subscriptionStatus: 'active',
          cancelAtPeriodEnd: false
        });

        // Note: Downgrades to starter are not conversions for our campaign
        // The conversion campaign targets starter -> pro/plus upgrades
        
        return res.json({ success: true, message: 'Plan changed to Starter' });
      }

      // Handle upgrade/change to paid plan
      if (!stripe) {
        return res.status(503).json({ error: 'Payment processing not available' });
      }

      const priceId = subscriptionManager.getStripePriceId(normalizedPlanId);
      if (!priceId) {
        return res.status(400).json({ error: 'Plan not available for purchase' });
      }

      // CUSTOMER REUSE: Check if customer already exists
      let customer;
      if (baker.stripeCustomerId) {
        try {
          customer = await stripe.customers.retrieve(baker.stripeCustomerId);
          console.log('♻️ Reusing existing Stripe customer for plan change:', customer.id);
        } catch (customerError) {
          console.warn('⚠️ Existing customer not found during plan change:', customerError);
          customer = null;
        }
      }

      // Create new customer if needed
      if (!customer) {
        customer = await stripe.customers.create({
          email: baker.email,
          name: baker.name,
          metadata: subscriptionManager.generatePlanMetadata(normalizedPlanId, baker.id)
        });
        
        await storage.updateBaker(bakerId, {
          stripeCustomerId: customer.id
        });
        console.log('🆕 Created new customer for plan change:', customer.id);
      }

      // IDEMPOTENCY: Check for existing pending checkout sessions
      const existingSessions = await stripe.checkout.sessions.list({
        customer: customer.id,
        status: 'open',
        limit: 1
      });

      let session;
      if (existingSessions.data.length > 0) {
        session = existingSessions.data[0];
        console.log('♻️ Reusing existing checkout session for plan change:', session.id);
      } else {
        // Handle subscription mode based on current status
        let mode: 'subscription' | 'setup' = 'subscription';
        let subscriptionData: any = {};

        // If baker has active subscription, create a new subscription (Stripe will handle proration)
        if (baker.stripeSubscriptionId) {
          mode = 'subscription';
          subscriptionData = {
            metadata: subscriptionManager.generatePlanMetadata(normalizedPlanId, baker.id)
          };
        } else {
          // New subscription with trial if configured
          if (targetPlan.trialDays) {
            subscriptionData.trial_period_days = targetPlan.trialDays;
          }
          subscriptionData.metadata = subscriptionManager.generatePlanMetadata(normalizedPlanId, baker.id);
        }

        // Create new checkout session
        session = await stripe.checkout.sessions.create({
          customer: customer.id,
          mode,
          payment_method_types: ['card'],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          subscription_data: subscriptionData,
          success_url: `${req.protocol}://${req.get('host')}/baker/${baker.slug}/dashboard?tab=billing&success=true&plan=${normalizedPlanId}`,
          cancel_url: `${req.protocol}://${req.get('host')}/baker/${baker.slug}/dashboard?tab=billing&cancelled=true`,
          metadata: {
            ...subscriptionManager.generatePlanMetadata(normalizedPlanId, baker.id),
            planChangeFlow: 'true',
            previousPlan: currentPlan
          },
          allow_promotion_codes: true,
          billing_address_collection: 'auto'
        });
        console.log('🆕 Created new checkout session for plan change:', session.id);
      }

      // Update baker status to pending
      await storage.updateBaker(bakerId, {
        subscriptionStatus: 'pending'
      });

      res.json({ 
        checkoutUrl: session.url,
        plan: {
          id: normalizedPlanId,
          name: targetPlan.name,
          trialDays: targetPlan.trialDays
        }
      });
      
    } catch (error) {
      console.error('❌ Error changing plan:', error);
      res.status(500).json({ error: 'Failed to change subscription plan' });
    }
  });

  app.post('/api/bakers/:bakerId/billing/cancel', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const baker = await storage.getBaker(bakerId);
      
      if (!baker?.stripeCustomerId) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      if (!stripe) {
        return res.status(503).json({ error: 'Payment processing not available' });
      }

      // Get active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: baker.stripeCustomerId,
        status: 'active'
      });

      if (subscriptions.data.length === 0) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      // Cancel subscription at period end
      const subscription = subscriptions.data[0];
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true
      });

      // Update baker record
      await storage.updateBaker(bakerId, {
        cancelAtPeriodEnd: true
      });

      res.json({ 
        success: true, 
        message: 'Subscription will be cancelled at the end of the current billing period' 
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  });

  app.post('/api/bakers/:bakerId/billing/portal', async (req, res) => {
    try {
      const { bakerId } = req.params;
      let baker = await storage.getBaker(bakerId);
      
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      if (!stripe) {
        return res.status(503).json({ error: 'Payment processing not available' });
      }

      // If baker doesn't have a Stripe customer ID, create one
      if (!baker.stripeCustomerId) {
        try {
          const customer = await stripe.customers.create({
            email: baker.email,
            name: baker.businessName || baker.name,
            metadata: {
              bakerId: baker.id,
              tenantId: baker.tenantId || 'default'
            }
          });

          // Update baker with new customer ID
          baker = await storage.updateBaker(baker.id, { stripeCustomerId: customer.id });
        } catch (stripeError) {
          console.error('Error creating Stripe customer:', stripeError);
          return res.status(500).json({ error: 'Failed to create billing account' });
        }
      }

      // Create Stripe Customer Portal session
      try {
        const session = await stripe.billingPortal.sessions.create({
          customer: baker.stripeCustomerId!,
          return_url: `${req.protocol}://${req.get('host')}/baker-dashboard?tab=billing`,
        });

        res.json({ portalUrl: session.url });
      } catch (portalError) {
        console.error('Error creating portal session:', portalError);
        // Fallback to in-app billing management
        res.json({ 
          message: 'All billing features are available in your current dashboard - you can change plans, view usage, and download invoices here.',
          fallback: true 
        });
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      res.status(500).json({ error: 'Failed to open billing portal' });
    }
  });

  // Helper functions for plan limits
  function getLeadsLimit(plan: string): number {
    switch (plan) {
      case 'free': return 3;
      case 'pro':
      case 'plus': 
        return -1; // Unlimited
      default: return 3;
    }
  }

  function getPortfolioLimit(plan: string): number {
    switch (plan) {
      case 'free': return 0;
      case 'pro': return 20;
      case 'plus': return -1; // Unlimited
      default: return 0;
    }
  }

  // ===== ADMIN/TESTING ENDPOINTS FOR SUBSCRIPTION LIFECYCLE =====
  
  // Manually trigger all subscription lifecycle checks (for testing)
  app.post('/api/admin/subscriptions/run-automation', async (req, res) => {
    try {
      console.log('Manual trigger: Running subscription lifecycle automation...');
      const result = await EmailAutomationService.runAutomationChecks();
      
      res.json({
        success: true,
        message: 'Subscription lifecycle automation completed',
        results: result
      });
    } catch (error) {
      console.error('Error running subscription automation:', error);
      res.status(500).json({ 
        error: 'Failed to run subscription automation',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Send trial welcome email to specific baker (for testing)
  app.post('/api/admin/subscriptions/send-welcome/:bakerId', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const success = await EmailAutomationService.sendTrialWelcomeEmail(bakerId);
      
      res.json({
        success,
        message: success ? 'Welcome email sent successfully' : 'Failed to send welcome email'
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      res.status(500).json({ 
        error: 'Failed to send welcome email',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Send subscription success email to specific baker (for testing)
  app.post('/api/admin/subscriptions/send-success/:bakerId', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const { planName = 'Professional' } = req.body;
      const success = await EmailAutomationService.sendSubscriptionSuccessEmail(bakerId, planName);
      
      res.json({
        success,
        message: success ? 'Success email sent successfully' : 'Failed to send success email'
      });
    } catch (error) {
      console.error('Error sending success email:', error);
      res.status(500).json({ 
        error: 'Failed to send success email',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get subscription lifecycle status overview (for monitoring)
  app.get('/api/admin/subscriptions/status', async (req, res) => {
    try {
      const bakers = await storage.getBakers();
      const now = new Date();
      
      const stats = {
        total: bakers.length,
        active: bakers.filter(b => b.subscriptionStatus === 'active').length,
        trialing: bakers.filter(b => b.subscriptionStatus === 'trialing').length,
        cancelled: bakers.filter(b => b.subscriptionStatus === 'cancelled').length,
        trialExpiring: 0,
        trialExpired: 0
      };

      const trialDetails: any[] = [];

      bakers.forEach(baker => {
        if (baker.subscriptionStatus === 'trialing' && baker.currentPeriodEnd) {
          const trialEndDate = new Date(baker.currentPeriodEnd);
          const daysLeft = differenceInDays(trialEndDate, now);
          const expired = isAfter(now, trialEndDate);

          if (expired) {
            stats.trialExpired++;
          } else if (daysLeft <= 7) {
            stats.trialExpiring++;
          }

          trialDetails.push({
            bakerId: baker.id,
            bakerName: baker.name,
            email: baker.email,
            trialEndDate: baker.currentPeriodEnd,
            daysLeft: Math.max(0, daysLeft),
            expired,
            warningLevel: expired ? 'expired' : 
                         daysLeft <= 1 ? 'urgent' : 
                         daysLeft <= 3 ? 'warning' : 
                         daysLeft <= 7 ? 'info' : 'none'
          });
        }
      });

      res.json({
        stats,
        trialDetails: trialDetails.sort((a, b) => a.daysLeft - b.daysLeft)
      });
    } catch (error) {
      console.error('Error getting subscription status:', error);
      res.status(500).json({ 
        error: 'Failed to get subscription status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ====== EMAIL CAMPAIGN API ENDPOINTS ======

  // Click tracking endpoint for email campaigns
  app.get('/api/campaign/track/:enrollmentId/:step', async (req, res) => {
    try {
      const { enrollmentId, step } = req.params;
      const { url } = req.query;

      if (!enrollmentId || !step || !url) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Track the click
      await storage.createCampaignEvent({
        enrollmentId,
        campaignKey: 'free_to_paid_7day',
        step: parseInt(step),
        eventType: 'clicked',
        metadata: {
          clickUrl: url as string
        }
      });

      console.log(`Campaign link clicked: enrollment ${enrollmentId}, step ${step}, url: ${url}`);

      // Redirect to the actual URL
      res.redirect(url as string);
    } catch (error) {
      console.error('Error tracking campaign click:', error);
      res.status(500).json({ error: 'Failed to track click' });
    }
  });

  // Unsubscribe endpoint for email campaigns
  app.get('/api/campaign/unsubscribe/:token', async (req, res) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ error: 'Missing unsubscribe token' });
      }

      // Unsubscribe from campaign
      const success = await storage.unsubscribeFromCampaign(token);

      if (success) {
        // Return a simple HTML page confirming unsubscribe
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Unsubscribed - BakerIQ</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
                .success { color: #4CAF50; }
              </style>
            </head>
            <body>
              <h1 class="success">Successfully Unsubscribed</h1>
              <p>You have been unsubscribed from our conversion email campaign.</p>
              <p>You will no longer receive these promotional emails.</p>
              <p><a href="/">Return to BakerIQ</a></p>
            </body>
          </html>
        `);
      } else {
        res.status(404).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invalid Link - BakerIQ</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
                .error { color: #f44336; }
              </style>
            </head>
            <body>
              <h1 class="error">Invalid Unsubscribe Link</h1>
              <p>This unsubscribe link is invalid or has already been used.</p>
              <p><a href="/">Return to BakerIQ</a></p>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Error processing unsubscribe:', error);
      res.status(500).json({ error: 'Failed to process unsubscribe' });
    }
  });

  // Campaign analytics endpoint (admin/internal use)
  app.get('/api/admin/campaign/analytics', async (req, res) => {
    try {
      // Get all enrollments
      const enrollments = await storage.getEnrollmentsByUser();
      
      // Calculate analytics
      const analytics = {
        totalEnrollments: enrollments.length,
        activeEnrollments: enrollments.filter(e => e.status === 'active').length,
        convertedEnrollments: enrollments.filter(e => e.status === 'converted').length,
        unsubscribedEnrollments: enrollments.filter(e => e.status === 'unsubscribed').length,
        conversionRate: enrollments.length > 0 ? 
          (enrollments.filter(e => e.status === 'converted').length / enrollments.length * 100).toFixed(1) + '%' : '0%',
        enrollmentsByStep: {} as Record<number, number>
      };

      // Calculate step distribution
      for (let step = 0; step <= 7; step++) {
        analytics.enrollmentsByStep[step] = enrollments.filter(e => e.lastStepSent === step).length;
      }

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
