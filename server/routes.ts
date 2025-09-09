import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { 
  insertProfileSchema, insertEstimateSchema, insertLeadSchema, insertReviewSchema, 
  insertTransactionSchema, insertAvailabilitySchema, insertAnalyticsSchema, insertBakerProfileSchema,
  insertTenantSchema, insertTenantConfigurationSchema, insertBakerSchema
} from "@shared/schema";
import { tenantMiddleware, requireTenant, injectTenantBranding, enforceTenantIsolation, getTenantId } from "./tenantMiddleware";
import { ObjectStorageService } from "./objectStorage";
import { sendEmail, emailTemplates } from "./emailService";
import Stripe from "stripe";
import Replicate from "replicate";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { format, parseISO, addMinutes, differenceInDays, isAfter } from "date-fns";
import { EmailAutomationService } from "./emailAutomation";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

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
    const bakerId = req.params.bakerId || req.body.bakerId;
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

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.put('/api/bakers/:bakerId/domain', async (req, res) => {
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
          `Subdomain updated to ${subdomain}.bakewise.com` : 
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

      res.json({
        subdomain: baker.subdomain || null,
        customDomain: baker.customDomain || null,
        isActive: true, // Simplified for now
        sslStatus: 'secured',
        propagationStatus: 'complete'
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
          `Subdomain updated to ${subdomain}.bakewise.com` : 
          'Custom domain configuration updated'
      });
    } catch (error) {
      console.error('Error updating domain configuration:', error);
      res.status(500).json({ error: 'Failed to update domain configuration' });
    }
  });

  // Stripe Connect Onboarding Endpoints
  app.post('/api/bakers/:bakerId/stripe-connect/create-account', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const baker = await storage.getBaker(bakerId);
      
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      // Create Stripe Connect account if it doesn't exist
      let connectAccountId = baker.stripeConnectAccountId;
      
      if (!connectAccountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'US',
          email: baker.email,
          business_profile: {
            name: baker.name,
          },
          metadata: {
            bakerId: bakerId
          }
        });
        
        connectAccountId = account.id;
        
        // Update baker with Connect account ID
        await storage.updateBaker(bakerId, {
          stripeConnectAccountId: connectAccountId,
          stripeAccountStatus: 'pending'
        });
      }

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: connectAccountId,
        refresh_url: `${req.protocol}://${req.get('host')}/baker-dashboard?tab=payments&refresh=true`,
        return_url: `${req.protocol}://${req.get('host')}/baker-dashboard?tab=payments&success=true`,
        type: 'account_onboarding',
      });

      res.json({ 
        onboardingUrl: accountLink.url,
        accountId: connectAccountId 
      });
    } catch (error: any) {
      console.error('Error creating Stripe Connect account:', error);
      
      // Handle specific Stripe verification errors
      if (error.code === 'invalid_request_error' && error.message?.includes('verify your identity')) {
        return res.status(400).json({ 
          error: 'Stripe Account Verification Required',
          message: 'Your Stripe account needs identity verification to enable payments. Please verify your account in your Stripe Dashboard before setting up payment processing.',
          verificationUrl: 'https://dashboard.stripe.com/connect/accounts/overview'
        });
      }
      
      // Handle other Stripe errors
      if (error.type === 'StripeInvalidRequestError') {
        return res.status(400).json({ 
          error: 'Stripe Setup Error',
          message: error.message || 'There was an issue with your Stripe account setup. Please check your Stripe account settings.'
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to create Stripe Connect account',
        message: 'An unexpected error occurred. Please try again or contact support.'
      });
    }
  });

  app.get('/api/bakers/:bakerId/stripe-connect/status', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const baker = await storage.getBaker(bakerId);
      
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      if (!baker.stripeConnectAccountId) {
        return res.json({ 
          status: 'not_started',
          onboardingCompleted: false 
        });
      }

      // Check account status with Stripe
      const account = await stripe.accounts.retrieve(baker.stripeConnectAccountId);
      
      const onboardingCompleted = account.details_submitted && 
                                   account.charges_enabled && 
                                   account.payouts_enabled;

      // Update baker status if changed
      const newStatus = onboardingCompleted ? 'complete' : 
                        account.details_submitted ? 'pending' : 'not_started';
      
      if (baker.stripeAccountStatus !== newStatus || 
          baker.stripeOnboardingCompleted !== onboardingCompleted) {
        await storage.updateBaker(bakerId, {
          stripeAccountStatus: newStatus,
          stripeOnboardingCompleted: onboardingCompleted
        });
      }

      res.json({
        status: newStatus,
        onboardingCompleted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements
      });
    } catch (error: any) {
      console.error('Error checking Stripe Connect status:', error);
      res.status(500).json({ error: 'Failed to check account status' });
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
        url: available ? `${subdomain}.bakewise.com` : null,
        message: available ? 
          `${subdomain}.bakewise.com is available!` : 
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
      const allBakers = await storage.getAllBakers();
      const activeBakers = allBakers.filter(baker => baker.isActive);
      
      // Remove sensitive information for public view
      const publicBakers = activeBakers.map(baker => ({
        id: baker.id,
        name: baker.name,
        businessName: baker.businessName,
        description: baker.description,
        address: baker.address,
        city: baker.city,
        state: baker.state,
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

  // Create new baker (signup)
  app.post("/api/bakers", async (req, res) => {
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
      if (bakerData.subscriptionPlan && bakerData.subscriptionPlan !== 'starter') {
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
          // Continue with account creation for free plans
          if (bakerData.subscriptionPlan !== 'starter') {
            throw new Error('Unable to set up paid subscription. Please try again later.');
          }
        }
      }

      // Create Stripe subscription for paid plans with 14-day trial
      if (bakerData.subscriptionPlan && bakerData.subscriptionPlan !== 'starter') {
        const priceIds = {
          professional: process.env.STRIPE_PRICE_ID_PROFESSIONAL,
          enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE
        };

        const priceId = priceIds[bakerData.subscriptionPlan as keyof typeof priceIds];
        if (priceId) {
          try {
            const subscription = await stripe.subscriptions.create({
              customer: customer.id,
              items: [{ price: priceId }],
              trial_period_days: 14,
              metadata: {
                bakerId: bakerData.email, // Use email as temporary ID since we don't have baker.id yet
                plan: bakerData.subscriptionPlan
              }
            });

            bakerWithStripe.stripeSubscriptionId = subscription.id;
            bakerWithStripe.subscriptionStatus = 'trialing';
            if (subscription.current_period_end) {
              bakerWithStripe.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
            }
          } catch (stripeError) {
            console.error('Error creating Stripe subscription:', stripeError);
            // Continue with account creation even if subscription fails
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
      
      // Don't return the password in the response
      const { password, ...bakerResponse } = baker;
      res.status(201).json(bakerResponse);
    } catch (error: any) {
      console.error("Error creating baker:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/bakers/:id", async (req, res) => {
    try {
      const baker = await storage.getBaker(req.params.id);
      if (!baker) {
        return res.status(404).json({ message: "Baker not found" });
      }
      res.json(baker);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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

  app.get("/api/bakers/:bakerId/leads", async (req, res) => {
    try {
      const leads = await storage.getLeadsByBaker(req.params.bakerId);
      res.json(leads);
    } catch (error: any) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/leads/:id", async (req, res) => {
    try {
      const updates = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(req.params.id, updates);
      res.json(lead);
    } catch (error: any) {
      console.error("Error updating lead:", error);
      res.status(400).json({ message: error.message });
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

      const customer = await storage.getCustomer(quote.customerId);
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
        
        await storage.updateCustomer(quote.customerId, { 
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
        bakerId: quote.bakerId,
        customerId: quote.customerId,
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

      const customer = await storage.getCustomer(quote.customerId);
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
        bakerId: quote.bakerId,
        customerId: quote.customerId,
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

  app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        // Update transaction status
        const transactions = await storage.getTransactionsByBakerId(paymentIntent.metadata.bakerId);
        const transaction = transactions.find(t => t.stripePaymentIntentId === paymentIntent.id);
        
        if (transaction) {
          await storage.updateTransactionStatus(transaction.id, 'completed');
          
          // If this was a deposit payment, update quote status
          if (paymentIntent.metadata.type === 'deposit' && paymentIntent.metadata.quoteId) {
            await storage.updateQuote(paymentIntent.metadata.quoteId, {
              status: 'deposit_paid'
            });
          }
          
          // If this was a final payment, mark quote as fully paid
          if (paymentIntent.metadata.type === 'final_payment' && paymentIntent.metadata.quoteId) {
            await storage.updateQuote(paymentIntent.metadata.quoteId, {
              status: 'paid'
            });
          }

          // Send confirmation email (if email service is configured)
          try {
            const customer = await storage.getCustomer(paymentIntent.metadata.customerId);
            if (customer) {
              await sendEmail({
                to: customer.email,
                subject: 'Payment Confirmation',
                text: `Dear ${customer.name},\n\nYour payment of $${(paymentIntent.amount / 100).toFixed(2)} has been successfully processed.\n\nDescription: ${paymentIntent.description}\n\nThank you for your business!`
              });
            }
          } catch (emailError) {
            console.error('Failed to send payment confirmation email:', emailError);
            // Don't fail the webhook for email issues
          }
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

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

  app.get("/api/bakers/:bakerId/availability", async (req, res) => {
    try {
      const availability = await storage.getAvailabilityByBakerId(req.params.bakerId);
      res.json(availability);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/availability/:id", async (req, res) => {
    try {
      const updates = insertAvailabilitySchema.partial().parse(req.body);
      const availability = await storage.updateAvailability(req.params.id, updates);
      if (!availability) {
        return res.status(404).json({ message: "Availability not found" });
      }
      res.json(availability);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Consultation booking routes - PUBLIC ACCESS
  app.post("/api/consultations", async (req, res) => {
    try {
      const consultationData = insertConsultationSchema.parse(req.body);
      const consultation = await storage.createConsultation(consultationData);
      
      // Track analytics for consultation booking
      await storage.trackAnalytics({
        bakerId: consultation.bakerId,
        metric: 'consultation_booked',
        date: new Date().toISOString().split('T')[0]
      });
      
      res.status(201).json(consultation);
    } catch (error: any) {
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
      const updates = insertConsultationSchema.partial().parse(req.body);
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
      const profile = await storage.getBakerProfileByBakerId(req.params.bakerId);
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

  // Track baker profile views
  app.get("/api/bakers/:id", async (req, res) => {
    try {
      const baker = await storage.getBaker(req.params.id);
      if (!baker) {
        return res.status(404).json({ message: "Baker not found" });
      }
      
      // Track profile view
      await storage.trackAnalytics({
        bakerId: req.params.id,
        metric: 'profile_view',
        date: new Date().toISOString().split('T')[0]
      });
      
      res.json(baker);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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

      // Create session token (in production, use proper JWT or session management)
      const sessionToken = Buffer.from(`baker:${baker.id}:${Date.now()}`).toString('base64');
      
      // Don't return the password in the response
      const { password: _, ...bakerResponse } = baker;
      
      res.json({
        success: true,
        token: sessionToken,
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
        portalLastLogin: new Date().toISOString()
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
  app.get('/api/bakers/:bakerId/pricing', async (req, res) => {
    try {
      const { bakerId } = req.params;
      
      // Mock pricing configuration - in real app, fetch from database
      const pricingConfig = {
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
          { id: "strawberry", name: "Fresh Strawberry", upcharge: 0, isPremium: false },
          { id: "lemon", name: "Lemon Zest", upcharge: 0, isPremium: false },
          { id: "red-velvet", name: "Red Velvet", upcharge: 18, isPremium: true },
          { id: "funfetti", name: "Funfetti", upcharge: 8, isPremium: false },
          { id: "carrot", name: "Carrot Spice", upcharge: 20, isPremium: true },
          { id: "champagne", name: "Champagne", upcharge: 28, isPremium: true },
          { id: "salted-caramel", name: "Salted Caramel", upcharge: 25, isPremium: true },
          { id: "cookies-cream", name: "Cookies & Cream", upcharge: 15, isPremium: true }
        ],
        decorations: [
          { id: "fresh-roses", name: "Fresh Roses", description: "Beautiful fresh roses", price: 50, costToMake: 22, category: "flowers", isActive: true },
          { id: "fresh-peonies", name: "Fresh Peonies", description: "Elegant peonies", price: 70, costToMake: 32, category: "flowers", isActive: true },
          { id: "buttercream-rosettes", name: "Buttercream Rosettes", description: "Hand-piped roses", price: 40, costToMake: 18, category: "design", isActive: true },
          { id: "fondant-draping", name: "Fondant Draping", description: "Elegant draping", price: 60, costToMake: 28, category: "design", isActive: true },
          { id: "gold-leaf", name: "Gold Leaf Accent", description: "Edible gold leaf", price: 95, costToMake: 50, category: "design", isActive: true },
          { id: "custom-monogram", name: "Custom Monogram", description: "Personalized monogram", price: 50, costToMake: 18, category: "topper", isActive: true }
        ],
        taxRate: 9.25,
        deliverySettings: {
          baseDeliveryFee: 60,
          freeDeliveryMinimum: 250,
          deliveryRadius: 30,
          perMileRate: 3.0
        },
        profitSettings: {
          defaultMargin: 58,
          minimumMargin: 40,
          laborRate: 30
        },
        lastUpdated: new Date().toISOString()
      };

      res.json(pricingConfig);
    } catch (error) {
      console.error('Error fetching baker pricing:', error);
      res.status(500).json({ error: 'Failed to fetch pricing configuration' });
    }
  });

  app.put('/api/bakers/:bakerId/pricing', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const pricingConfig = {
        ...req.body,
        id: `pricing-${bakerId}`,
        bakerId,
        lastUpdated: new Date().toISOString()
      };

      // In real app, save to database
      console.log('Baker pricing configuration updated:', pricingConfig);

      res.json({
        success: true,
        message: 'Pricing configuration updated successfully',
        config: pricingConfig
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

  // Cake Calculator Quote Request API
  app.post('/api/bakers/:bakerId/quote-requests', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const quoteRequest = {
        id: `quote-request-${Date.now()}`,
        bakerId,
        tenantId: 'tenant-1', // This would come from baker lookup
        ...req.body,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // In a real app, this would save to database and trigger notifications
      // For demo, we'll just simulate success
      console.log('New cake calculator quote request:', quoteRequest);
      
      // Simulate email notification to baker
      setTimeout(() => {
        console.log(`Email notification sent to baker ${bakerId} about new quote request`);
      }, 1000);

      res.status(201).json({
        success: true,
        message: 'Quote request submitted successfully',
        quoteRequestId: quoteRequest.id
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
      const quote = await storage.createQuote(req.body);
      res.status(201).json(quote);
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
      const contract = await storage.createContract(req.body);
      res.status(201).json(contract);
    } catch (error) {
      console.error('Error creating contract:', error);
      res.status(500).json({ error: 'Failed to create contract' });
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

  app.post('/api/super-admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username and password are required' 
        });
      }

      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user || user.role !== 'super_admin') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_development');
      
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
      // Get real platform statistics from database
      const allTenants = await storage.getTenants();
      const activeTenants = allTenants.filter(t => t.status === 'active');
      const allUsers = await storage.getUsersWithRole(''); // Get all users regardless of role by passing empty string
      
      // Calculate basic statistics
      const stats = {
        totalTenants: allTenants.length,
        activeTenants: activeTenants.length,
        totalUsers: allUsers.length,
        monthlyRevenue: 0, // Calculate from actual transactions if needed
        totalRevenue: 0,   // Calculate from actual transactions if needed
        revenueGrowth: 0,  // Calculate from historical data if needed
        activeUsers24h: 0, // Calculate from actual user activity if needed
        systemHealth: 100  // Calculate from actual system metrics if needed
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching super admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch platform statistics' });
    }
  });

  app.get('/api/super-admin/tenants', verifySuperAdminToken, async (req, res) => {
    try {
      // Get real tenant data from database
      const tenants = await storage.getTenants();
      
      res.json(tenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({ error: 'Failed to fetch tenants' });
    }
  });

  // Update tenant status
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

      const tenant = await storage.getTenant(tenantId);
      if (!tenant) {
        return res.status(404).json({ 
          success: false, 
          message: 'Tenant not found' 
        });
      }

      const updatedTenant = await storage.updateTenant(tenantId, { 
        status, 
        updatedAt: new Date() 
      });

      res.json({
        success: true,
        tenant: updatedTenant
      });

    } catch (error) {
      console.error('Update tenant status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  // Update tenant details
  app.patch('/api/super-admin/tenants/:tenantId', verifySuperAdminToken, async (req, res) => {
    try {
      const { tenantId } = req.params;
      const updates = req.body;

      // Remove non-updateable fields
      delete updates.id;
      delete updates.createdAt;

      const tenant = await storage.getTenant(tenantId);
      if (!tenant) {
        return res.status(404).json({ 
          success: false, 
          message: 'Tenant not found' 
        });
      }

      const updatedTenant = await storage.updateTenant(tenantId, { 
        ...updates, 
        updatedAt: new Date() 
      });

      res.json({
        success: true,
        tenant: updatedTenant
      });

    } catch (error) {
      console.error('Update tenant error:', error);
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
      // Get all users regardless of role
      const allUsers = await storage.getUsersWithRole('');
      
      // Format user data for super admin view
      const users = allUsers.map(user => ({
        id: user.id,
        name: user.username || user.email || 'Unknown',
        email: user.email,
        role: user.role || 'user',
        status: user.isActive ? 'active' : 'suspended',
        lastLogin: user.lastLoginAt?.toISOString() || null,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        tenantId: 'default', // For multi-tenant support later
        tenantName: 'Default'
      }));
      
      res.json(users);
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
        return res.status(400).json({ message: 'Tenant ID is required' });
      }

      const tenant = await storage.updateTenant(tenantId, { status: 'suspended' });
      
      // Log the action
      await storage.createAuditLog({
        userId: req.user.userId,
        action: 'tenant_suspended',
        resourceType: 'tenant',
        resourceId: tenantId,
        metadata: { tenantName: tenant.name },
        ipAddress: req.ip
      });

      res.json({ success: true, tenant });
    } catch (error) {
      console.error('Error suspending tenant:', error);
      res.status(500).json({ message: 'Failed to suspend tenant' });
    }
  });

  app.post('/api/super-admin/quick-actions/tenant/activate', verifySuperAdminToken, async (req: any, res) => {
    try {
      const { tenantId } = req.body;
      const tenant = await storage.updateTenant(tenantId, { status: 'active' });
      
      await storage.createAuditLog({
        userId: req.user.userId,
        action: 'tenant_activated',
        resourceType: 'tenant',
        resourceId: tenantId,
        metadata: { tenantName: tenant.name },
        ipAddress: req.ip
      });

      res.json({ success: true, tenant });
    } catch (error) {
      console.error('Error activating tenant:', error);
      res.status(500).json({ message: 'Failed to activate tenant' });
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
        resourceType: 'user',
        resourceId: userId,
        metadata: { username: user.username },
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
        resourceType: 'user',
        resourceId: userId,
        metadata: { resetBy: 'super_admin' },
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
        value: parseFloat(value),
        unit: unit || '',
        status: value > 90 ? 'critical' : value > 70 ? 'warning' : 'healthy',
        metadata: metadata || {}
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
        exportType,
        format: format || 'csv',
        status: 'pending',
        parameters: {
          dateRange: dateRange || {},
          filters: filters || {}
        },
        progress: 0
      });
      
      // Simulate export processing
      setTimeout(async () => {
        try {
          await storage.updateDataExportJob(job.id, {
            status: 'processing',
            progress: 50
          });
          
          setTimeout(async () => {
            await storage.updateDataExportJob(job.id, {
              status: 'completed',
              progress: 100,
              downloadUrl: `/exports/${job.id}.${format}`,
              fileSize: Math.floor(Math.random() * 1000000)
            });
          }, 3000);
        } catch (error) {
          await storage.updateDataExportJob(job.id, {
            status: 'failed',
            error: 'Processing failed'
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
        priority: priority || 'normal',
        targetAudience: targetAudience || 'all',
        isActive: true,
        createdById: req.user.userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      });
      
      await storage.createAuditLog({
        userId: req.user.userId,
        action: 'announcement_created',
        resourceType: 'announcement',
        resourceId: announcement.id,
        metadata: { title, type },
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
        resourceType: 'announcement',
        resourceId: id,
        metadata: updates,
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
        resourceType: 'announcement',
        resourceId: id,
        metadata: {},
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
        type,
        status: 'scheduled',
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        affectedServices: affectedServices || [],
        notifyUsers: notifyUsers ?? true,
        createdById: req.user.userId
      });
      
      await storage.createAuditLog({
        userId: req.user.userId,
        action: 'maintenance_scheduled',
        resourceType: 'maintenance',
        resourceId: schedule.id,
        metadata: { title, type, scheduledStart },
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
              result.tempPassword = tempPassword;
              break;
            default:
              throw new Error(`Unknown action: ${action}`);
          }
          
          await storage.createAuditLog({
            userId: req.user.userId,
            action: `bulk_${action}`,
            resourceType: 'user',
            resourceId: userId,
            metadata: { action, ...data },
            ipAddress: req.ip
          });
          
          results.push({ userId, success: true, result });
        } catch (error) {
          results.push({ userId, success: false, error: error.message });
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
      const user = await storage.getUser(req.user.userId);
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
          id: 'starter',
          name: 'Starter (Free)',
          price: 0,
          interval: 'month',
          features: [
            'Basic CRM (up to 50 customers)',
            '10 quotes per month',
            'Basic templates',
            'Email support',
            'Standard branding'
          ]
        },
        {
          id: 'professional',
          name: 'Professional',
          price: 79,
          interval: 'month',
          recommended: true,
          stripePriceId: process.env.STRIPE_PRICE_ID_PROFESSIONAL,
          features: [
            'Unlimited customers & quotes',
            'Advanced CRM & pipeline tracking',
            'Contract management & e-signatures',
            'Payment processing & deposits',
            'Custom branding & subdomain',
            'Priority support',
            'Analytics dashboard'
          ]
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 149,
          interval: 'month',
          stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE,
          features: [
            'Everything in Professional',
            'Multi-location support',
            'Team collaboration tools',
            'Advanced analytics & reporting',
            'White-label customization',
            'Custom domain support',
            'Dedicated account manager',
            'Phone support'
          ]
        }
      ];

      res.json(plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ error: 'Failed to fetch available plans' });
    }
  });

  app.post('/api/bakers/:bakerId/billing/change-plan', async (req, res) => {
    try {
      const { bakerId } = req.params;
      const { planId } = req.body;
      
      const baker = await storage.getBaker(bakerId);
      if (!baker) {
        return res.status(404).json({ error: 'Baker not found' });
      }

      // Handle downgrade to free plan
      if (planId === 'starter') {
        await storage.updateBaker(bakerId, {
          subscriptionPlan: 'free',
          subscriptionStatus: 'active',
          cancelAtPeriodEnd: false
        });
        
        return res.json({ success: true, message: 'Plan downgraded to Free' });
      }

      // Handle upgrade/change to paid plan
      const plans = {
        professional: { priceId: process.env.STRIPE_PRICE_ID_PROFESSIONAL, price: 79 },
        enterprise: { priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE, price: 149 }
      };

      const selectedPlan = plans[planId as keyof typeof plans];
      if (!selectedPlan?.priceId) {
        return res.status(400).json({ error: 'Invalid plan selected' });
      }

      // Create or retrieve Stripe customer
      let stripeCustomerId = baker.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: baker.email,
          name: baker.name,
          metadata: { bakerId }
        });
        stripeCustomerId = customer.id;
        
        await storage.updateBaker(bakerId, {
          stripeCustomerId
        });
      }

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: selectedPlan.priceId,
            quantity: 1,
          },
        ],
        success_url: `${req.protocol}://${req.get('host')}/baker-dashboard?tab=billing&success=true`,
        cancel_url: `${req.protocol}://${req.get('host')}/baker-dashboard?tab=billing&cancelled=true`,
        metadata: {
          bakerId,
          planId
        }
      });

      res.json({ checkoutUrl: session.url });
    } catch (error) {
      console.error('Error changing plan:', error);
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

  const httpServer = createServer(app);
  return httpServer;
}
