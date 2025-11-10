import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import crypto from "crypto";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import { registerRoutes } from "./routes";
import { setupAuthRoutes } from "./authRoutes";
import { registerAiRoutes } from "./routes/ai";
import { registerBillingRoutes } from "./routes/billing";
import { setupVite, serveStatic, log } from "./vite";
import { startEmailAutomationScheduler } from "./emailAutomation";
import { databaseStorage } from "./databaseStorage.js";
import { sendResetEmail } from "./mailer";
import { sql } from "drizzle-orm";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { z } from "zod";
import cron from "node-cron";
import { getSendyService } from "./sendy";
import { registerSecurityRoutes } from "./securityRoutes.js";
import { globalErrorHandler, notFoundHandler } from "./lib/errorHandler.js";
import { cleanupExpiredTokens } from "./lib/refreshTokens.js";
import { logger } from "./lib/logger.js";
import { apiRateLimiter, authRateLimiter } from "./lib/rateLimiting.js";

const app = express();

// Trust proxy for HTTPS enforcement behind Replit proxy
app.set('trust proxy', 1);

// Security headers - must come early
// In development, disable CSP to allow Vite HMR inline scripts
// In production, use strict CSP for security
const isDev = process.env.NODE_ENV !== 'production';
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: isDev ? false : undefined
}));

app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] === 'http') {
    const url = `https://${req.headers.host}${req.url}`;
    return res.redirect(301, url);
  }
  next();
});
// CORS if you need cross-origin requests
// import cors from 'cors';
// app.use(cors({ origin: [/\.bakeriq\.app$/], credentials: true }));

// In-memory store for webhook idempotency (prevent duplicate processing)
// In production, consider using Redis or database for persistence across restarts
const processedWebhookEvents = new Set<string>();

// Import stripe for webhook handler (optional for manual payment system)
import Stripe from "stripe";
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
  console.log('Stripe initialized for platform subscriptions');
} else {
  console.log('Stripe not configured - manual payment system only');
}

// Stripe webhook endpoint MUST come BEFORE body parsing middleware
// This ensures we get the raw body that Stripe requires for signature verification
app.post(["/webhooks/stripe", "/api/webhooks/stripe"], express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(400).send('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  let event;

  try {
    // Verify webhook signature using raw body
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('✅ Webhook verified:', event.type);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency check using event ID
  const eventId = event.id;
  if (processedWebhookEvents.has(eventId)) {
    console.log('🔄 Event already processed, skipping:', eventId);
    return res.json({ received: true, status: 'already_processed' });
  }

  // Mark event as processed (add to idempotency set)
  processedWebhookEvents.add(eventId);
  console.log('📝 Event marked as processed:', eventId);

  // Process the webhook event
  try {
    console.log('Processing webhook event:', event.type);
    
    // Import dependencies here to avoid circular dependencies
    const { storage } = await import('./storage');
    const { sendEmail } = await import('./emailService');
    const { subscriptionManager } = await import('./subscriptionConfig');

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('🎉 Checkout session completed:', session.id);

        // Check if this is an invoice payment (has invoiceId metadata)
        if (session.metadata?.invoiceId) {
          console.log('💰 Processing invoice payment:', session.metadata.invoiceId);
          
          const { invoiceId, tenantId, bakerId } = session.metadata;
          const paymentIntentId = session.payment_intent as string;
          
          try {
            // Fetch invoice to get details
            const invoiceResult = await db.execute<{
              id: string;
              total: string;
              invoice_number: string;
              customer_id: string;
            }>(sql`
              SELECT id, total, invoice_number, customer_id
              FROM invoices
              WHERE id = ${invoiceId} AND tenant_id = ${tenantId}
              LIMIT 1
            `);

            const invoice = invoiceResult.rows?.[0];
            if (!invoice) {
              console.error('❌ Invoice not found:', invoiceId);
              processedWebhookEvents.delete(eventId); // Allow retry
              break;
            }

            const paidAmount = parseFloat(invoice.total);
            const transactionId = uuid();

            // Use atomic transaction to update invoice and create transaction record
            await db.transaction(async (tx) => {
              // Update invoice to mark as paid
              await tx.execute(sql`
                UPDATE invoices
                SET paid_at = NOW(),
                    remaining_balance = 0,
                    paid_amount = ${paidAmount},
                    status = 'paid',
                    updated_at = NOW()
                WHERE id = ${invoiceId}
              `);

              // Create transaction record
              await tx.execute(sql`
                INSERT INTO transactions (
                  id, tenant_id, baker_id, customer_id, type, amount, 
                  currency, status, stripe_payment_intent_id, description, created_at
                )
                VALUES (
                  ${transactionId}, ${tenantId}, ${bakerId}, ${invoice.customer_id || null}, 
                  'payment', ${paidAmount}, 'USD', 'succeeded', ${paymentIntentId}, 
                  ${`Payment for Invoice #${invoice.invoice_number}`}, NOW()
                )
              `);
            });

            console.log('✅ Invoice marked as paid:', {
              invoiceId,
              transactionId,
              amount: paidAmount,
              paymentIntentId,
            });
          } catch (error) {
            console.error('❌ Error processing invoice payment:', error);
            processedWebhookEvents.delete(eventId); // Allow Stripe retry
            throw error; // Re-throw to signal failure to Stripe
          }
          
          break;
        }

        // Otherwise, handle as subscription payment
        // Validate required metadata
        if (!session.metadata?.bakerId || !session.metadata?.planId) {
          console.error('❌ Missing required metadata in checkout session:', session.metadata);
          break;
        }

        const { bakerId, planId } = session.metadata;
        const plan = subscriptionManager.getPlan(planId);

        if (!plan) {
          console.error('❌ Invalid plan ID in checkout session:', planId);
          break;
        }

        // Get subscription details from Stripe
        let subscription: any = null;
        if (session.subscription) {
          subscription = await stripe!.subscriptions.retrieve(session.subscription as string);
        }

        // Update baker with subscription details
        const updateData: any = {
          subscriptionPlan: planId,
          stripeSubscriptionId: subscription?.id || null,
          subscriptionStatus: subscription?.status || 'active',
          currentPeriodStart: subscription?.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
          currentPeriodEnd: subscription?.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
        };

        // Handle trial status
        if (subscription?.trial_end && subscription.trial_end > Math.floor(Date.now() / 1000)) {
          updateData.subscriptionStatus = 'trialing';
        }

        await storage.updateBaker(bakerId, updateData);

        // Track conversion if user upgraded from starter to paid plan
        try {
          const { EmailAutomationService } = await import('./emailAutomation');
          await EmailAutomationService.trackUserConversion(bakerId, planId);
        } catch (conversionError) {
          console.error('Failed to track conversion:', conversionError);
        }

        // Send welcome email
        try {
          const baker = await storage.getBaker(bakerId);
          if (baker?.email) {
            await sendEmail({
              to: baker.email,
              subject: `Welcome to ${plan.name} Plan!`,
              text: `Welcome to BakerIQ! Your ${plan.name} subscription is now active. You can access all premium features from your dashboard.`,
              htmlPart: `
                <h2>Welcome to BakerIQ!</h2>
                <p>Your <strong>${plan.name}</strong> subscription is now active.</p>
                <p>You can now access all premium features including:</p>
                <ul>
                  ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <p><a href="${process.env.FRONTEND_URL}/baker/${baker.slug}/dashboard">Access your dashboard</a></p>
              `
            });
          }
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }

        console.log('✅ Baker subscription activated:', { bakerId, planId, subscriptionId: subscription?.id });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('🔄 Subscription updated:', subscription.id);

        // Find baker by subscription ID
        const bakers = await storage.getBakers();
        const baker = bakers.find((b: any) => b.stripeSubscriptionId === subscription.id);

        if (!baker) {
          console.error('❌ No baker found for subscription:', subscription.id);
          break;
        }

        // Map Stripe subscription status to our status
        let subscriptionStatus = subscription.status;
        
        // Handle trial status specifically
        if (subscription.trial_end && subscription.trial_end > Math.floor(Date.now() / 1000)) {
          subscriptionStatus = 'trialing';
        }

        // Update baker subscription info
        const updateData: any = {
          subscriptionStatus,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        };

        await storage.updateBaker(baker.id, updateData);

        // Track conversion if subscription was updated to active from trialing and it's a paid plan
        try {
          if (subscription.status === 'active' && baker.subscriptionPlan && 
              baker.subscriptionPlan !== 'starter') {
            const { EmailAutomationService } = await import('./emailAutomation');
            await EmailAutomationService.trackUserConversion(baker.id, baker.subscriptionPlan);
          }
        } catch (conversionError) {
          console.error('Failed to track conversion on subscription update:', conversionError);
        }

        // Handle status changes
        if (subscription.status === 'canceled') {
          console.log('📧 Subscription canceled, sending confirmation email');
          try {
            if (baker.email) {
              await sendEmail({
                to: baker.email,
                subject: 'Subscription Canceled',
                text: 'Your BakerIQ subscription has been canceled. You can continue using your account until your current period ends.',
              });
            }
          } catch (emailError) {
            console.error('Failed to send cancellation email:', emailError);
          }
        }

        console.log('✅ Baker subscription status updated:', { 
          bakerId: baker.id, 
          status: subscriptionStatus,
          periodEnd: updateData.currentPeriodEnd 
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('🗑️ Subscription deleted:', subscription.id);

        // Find baker and downgrade to starter plan
        const bakers = await storage.getBakers();
        const baker = bakers.find((b: any) => b.stripeSubscriptionId === subscription.id);

        if (baker) {
          await storage.updateBaker(baker.id, {
            subscriptionPlan: 'starter',
            subscriptionStatus: 'canceled',
            stripeSubscriptionId: null,
            currentPeriodStart: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
          });

          console.log('✅ Baker downgraded to starter plan:', baker.id);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('💳 Payment succeeded for payment intent:', paymentIntent.id);
        
        // Handle one-time payments (quotes, transactions)
        if (paymentIntent.metadata?.bakerId) {
          const transactions = await storage.getTransactionsByBakerId(paymentIntent.metadata.bakerId);
          const transaction = transactions.find(t => t.stripePaymentIntentId === paymentIntent.id);
          
          if (transaction) {
            await storage.updateTransactionStatus(transaction.id, 'completed');
            
            // Handle quote status updates
            if (paymentIntent.metadata.type === 'deposit' && paymentIntent.metadata.quoteId) {
              await storage.updateQuote(paymentIntent.metadata.quoteId, { status: 'deposit_paid' });
            } else if (paymentIntent.metadata.type === 'final_payment' && paymentIntent.metadata.quoteId) {
              await storage.updateQuote(paymentIntent.metadata.quoteId, { status: 'paid' });
            }

            console.log('✅ Transaction marked as completed:', transaction.id);
          }
        }
        break;
      }

      case 'account.updated': {
        console.log('🔧 Stripe Connect account updated:', event.data.object.id);
        break;
      }

      default: {
        console.log('ℹ️ Unhandled webhook event type:', event.type);
      }
    }
    
    res.json({ received: true });
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).send('Webhook processing failed');
  }
});

// Session configuration - MUST come before other middleware that depends on sessions
const PgSession = ConnectPgSimple(session);
const crossSite = process.env.CROSS_SITE_COOKIES === "true";

console.log(`🍪 Session cookie config: sameSite=${crossSite ? 'none' : 'lax'}, secure=${crossSite || process.env.NODE_ENV === 'production'}`);

app.use(session({
  name: "sid", // Custom session cookie name
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: 'sessions',
    ttl: 7 * 24 * 60 * 60 // 1 week in seconds
  }),
  secret: process.env.SESSION_SECRET || 'fallback_session_secret_for_development_only',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
    sameSite: crossSite ? 'none' : 'lax',
    secure: crossSite || process.env.NODE_ENV === 'production'
  }
}));

// NOW set up body parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Health (FIRST)
const health = (endpoint: string) => (_req: any, res: any) => res.json({ 
  ok: true, 
  version: '1.0.0',
  now: new Date().toISOString()
});
app.get('/health',     health('/health'));
app.get('/api/health', health('/api/health'));
app.get('/healthz',    health('/healthz')); // alias for non-custom domains

// serve a simple calc page
const PUB = path.join(process.cwd(), "public");
app.use("/calc", express.static(PUB));
app.get("/calc/cake", (_req, res) => {
  res.sendFile(path.join(PUB, "calc-cake.html"));
});

// Legacy logging removed - using structured JSON logger from loggerMiddleware instead

// ========================================
// INTERNAL PROVISIONING ENDPOINT
// ========================================

// Import provisioning service
import { provisionBakerFromClaim } from "./services/provisioning";
import { sendWelcomeEmail } from "./services/welcomeEmail";
import { db } from "./db";

// Middleware to verify internal shared secret
function verifyInternalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['x-internal-auth'];
  const expectedSecret = process.env.INTERNAL_SHARED_SECRET || 'dev-shared-secret-change-in-production';
  
  if (authHeader !== expectedSecret) {
    console.error('[Internal Auth] Invalid shared secret');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
}

// Internal endpoint for baker provisioning from marketplace
app.post("/internal/provision/baker", verifyInternalAuth, async (req, res) => {
  try {
    const { claimId, email, name, marketplaceVendorId } = req.body;
    
    if (!claimId || !email || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields: claimId, email, name' 
      });
    }

    console.log('[Provisioning] Received claim approval:', {
      claimId,
      email,
      name,
      marketplaceVendorId,
    });

    // Provision the baker
    const result = await provisionBakerFromClaim({
      claimId,
      email,
      name,
      marketplaceVendorId,
    });

    // Audit log
    console.log('[Provisioning] SUCCESS:', {
      claimId,
      tenantId: result.tenantId,
      userId: result.userId,
      bakerId: result.bakerId,
      email,
    });

    // Send welcome email with temp password (stub for now)
    try {
      const tenant = await db.query.tenants.findFirst({
        where: (tenants, { eq }) => eq(tenants.id, result.tenantId),
      });
      
      await sendWelcomeEmail({
        email,
        name,
        tempPassword: result.tempPassword,
        subdomain: tenant?.subdomain || 'app',
      });
    } catch (emailError) {
      console.error('[Provisioning] Failed to send welcome email:', emailError);
    }

    return res.json({
      success: true,
      tenantId: result.tenantId,
      userId: result.userId,
      bakerId: result.bakerId,
      message: 'Baker provisioned successfully',
    });
  } catch (error: any) {
    console.error('[Provisioning] ERROR:', error);
    
    // Return 409 Conflict if user already exists
    if (error.message && error.message.includes('already exists')) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Provisioning failed',
      message: error.message 
    });
  }
});

// ========================================
// SESSION-BASED AUTHENTICATION
// ========================================

// Helper to compute dashboard redirect path based on role
function getDashboardPath(role?: string) {
  // Allow env override; default legacy baker path
  const envPath = process.env.DASHBOARD_PATH_BAKER;
  if ((role ?? "baker") === "baker") return envPath || "/baker/dashboard";
  if (role === "admin") return process.env.DASHBOARD_PATH_ADMIN || "/admin";
  if (role === "customer") return process.env.DASHBOARD_PATH_CUSTOMER || "/portal";
  return "/dashboard"; // fallback
}

// Password reset helpers
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "";
function hashToken(t: string) { 
  return crypto.createHash("sha256").update(t).digest("hex"); 
}

// Role-based access control middleware
function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    const r = req.session?.role || "viewer";
    if (roles.includes(r)) return next();
    return res.status(403).json({ ok: false, error: "Forbidden" });
  };
}

// Audit helper for logging important events
async function audit(eventType: string, payload: Record<string, any> = {}, req?: any) {
  try {
    const { activityLogs } = await import("@shared/schema");
    await db.insert(activityLogs).values({
      tenantId: payload.tenantId || null,
      userId: payload.actorUserId || null,
      actor: payload.actorEmail || payload.actorUserId || 'system',
      entityType: payload.entityType || 'user',
      action: eventType,
      metadata: payload,
    });
    console.log("[AUDIT]", { eventType, payload, ip: req?.ip, ua: req?.headers?.["user-agent"] });
  } catch (e) {
    console.error("Audit error", e);
  }
}

// SES client for calculator estimate emails
const ses = new SESv2Client({ region: process.env.AWS_REGION || "us-east-1" });

async function sendEstimateEmail(to: string, data: { low: number; high: number; leadId: string }) {
  const from = process.env.SES_FROM!;
  const subject = `Your BakerIQ estimate: $${data.low}–$${data.high}`;
  const html = `
    <div style="font-family:system-ui,Segoe UI,Arial">
      <h2>Your instant estimate</h2>
      <p>Estimated range: <strong>$${data.low} – $${data.high}</strong></p>
      <p>Save or request availability here:</p>
      <p><a href="${process.env.FRONTEND_URL || ""}/lead/${data.leadId}">View your estimate</a></p>
      <p>Thanks for using BakerIQ!</p>
    </div>`;

  await ses.send(new SendEmailCommand({
    FromEmailAddress: from,
    Destination: { ToAddresses: [to] },
    Content: { Simple: { Subject: { Data: subject }, Body: { Html: { Data: html } } } }
  }));
}

// Session probe endpoint - check if user is authenticated (unified auth state)
app.get("/api/session", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const authed = Boolean((req.session as any)?.userId);
  
  let advertiserId = null;
  
  // If authenticated, check if user is associated with an advertiser
  if (authed) {
    const userId = (req.session as any).userId;
    try {
      const result = await db.execute<{ advertiser_id: string }>(sql`
        SELECT advertiser_id 
        FROM advertiser_users 
        WHERE user_id = ${userId} 
        LIMIT 1
      `);
      if (result.rows && result.rows.length > 0) {
        advertiserId = result.rows[0].advertiser_id;
      }
    } catch (error) {
      console.error('Error fetching advertiser association:', error);
    }
  }
  
  res.json({
    authenticated: authed,
    userId: authed ? (req.session as any).userId : null,
    role: (req.session as any)?.role || null,
    tenantId: (req.session as any)?.tenantId || (req.session as any)?.tenant_id || null,
    advertiserId,
    isImpersonating: Boolean((req.session as any)?.isImpersonating) || false,
    impersonatorId: (req.session as any)?.impersonatorId || null
  });
});

// Validation schema for calculator input
const CalcInput = z.object({
  cityOrZip: z.string().min(2, "city/zip required"),
  eventDate: z.string().min(3, "event date required"),
  guestCount: z.coerce.number().int().min(5, "min 5 guests").max(500, "max 500"),
  icing: z.enum(["buttercream", "fondant"]),
  complexity: z.enum(["basic", "standard", "premium", "couture"]),
  formFactor: z.enum(["tiered", "sheet", "cupcakes"]),
  addOns: z.object({
    metallicLeaf: z.coerce.boolean().optional().default(false),
    sugarFlorals: z.coerce.boolean().optional().default(false),
    ediblePrint: z.coerce.boolean().optional().default(false),
    topperCustom: z.coerce.boolean().optional().default(false),
  }).default({}),
  delivery: z.object({
    method: z.enum(["pickup", "delivery"]),
    miles: z.coerce.number().min(0).max(200).default(0),
  }),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

// Rate limiter for calculator endpoint - prevent abuse
const calcLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: Number(process.env.CALC_RATE_LIMIT_MAX || 100), // default 100/10min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

// Public calculator quote endpoint - no auth required
app.post("/api/bakers/public/calculator/quote-draft", calcLimiter, async (req, res) => {
  try {
    // Validate input
    const result = CalcInput.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid input",
        issues: result.error.issues.map(i => ({ path: i.path, message: i.message }))
      });
    }
    const parsed = result.data;
    
    const { db } = await import("./db");
    const { leads } = await import("@shared/schema");

    // Calculate pricing based on complexity and add-ons
    const basePrice = parsed.guestCount * 3; // $3 per serving base
    const complexityMultipliers: Record<string, number> = {
      basic: 1.0,
      standard: 1.3,
      premium: 1.6,
      couture: 2.2
    };
    const complexityMultiplier = complexityMultipliers[parsed.complexity] || 1.0;
    
    // Calculate add-ons cost
    const addOnsCost =
      (parsed.addOns.metallicLeaf ? 45 : 0) +
      (parsed.addOns.sugarFlorals ? 85 : 0) +
      (parsed.addOns.ediblePrint ? 25 : 0) +
      (parsed.addOns.topperCustom ? 30 : 0);

    // Fondant vs buttercream
    const icingMultiplier = parsed.icing === 'fondant' ? 1.2 : 1.0;
    
    // Delivery fee
    const deliveryFee = parsed.delivery.method === 'delivery' 
      ? 50 + (parsed.delivery.miles * 2) 
      : 0;

    // Calculate totals
    const base = basePrice * complexityMultiplier * icingMultiplier;
    const subtotal = base + addOnsCost;
    const total = subtotal + deliveryFee;
    const low = Math.floor(total * 0.85);
    const high = Math.ceil(total * 1.15);

    // Insert lead into database
    const [row] = await db.insert(leads).values({
      customerName: parsed.name || 'Anonymous',
      customerEmail: parsed.email || 'no-email@example.com',
      customerPhone: parsed.phone || null,
      weddingDate: parsed.eventDate || null,
      guestCount: parsed.guestCount,
      cityOrZip: parsed.cityOrZip,
      notes: parsed.notes || null,
      source: 'calculator',
      calculatorPayload: parsed,
      estimatedTotalLow: low,
      estimatedTotalHigh: high,
      budget: `$${low}-$${high}`,
      status: 'new'
    }).returning();

    // Send confirmation email if email provided
    if (parsed.email) {
      sendEstimateEmail(parsed.email, { low, high, leadId: row.id }).catch(() => {});
    }

    // Return response
    res.json({
      leadId: row.id,
      servings: parsed.guestCount,
      deliveryFee,
      total,
      range: { low, high },
      breakdown: { 
        base, 
        complexityMultiplier, 
        addOnsCost,
        selectedAddOns: parsed.addOns
      }
    });
  } catch (error) {
    console.error('Calculator quote error:', error);
    res.status(500).json({ error: 'Failed to process quote request' });
  }
});

// Rate limiter for login endpoint - prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { ok: false, error: "Too many login attempts, please try again later" }
});

// Login endpoint using session authentication
app.post("/api/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email and password required" });
    }

    // Look up user by email (checking users table)
    const user = await databaseStorage.getUserByEmailOrUsername(email);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    // Verify password using bcrypt
    const isValid = await databaseStorage.verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    // Set session
    (req.session as any).userId = user.id;
    (req.session as any).email = user.email;
    (req.session as any).role = user.role || 'baker';
    
    return res.json({ 
      ok: true, 
      redirect: getDashboardPath(user.role ?? undefined),
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ ok: false, error: "Logout failed" });
    }
    res.clearCookie("sid");
    res.json({ ok: true });
  });
});

// ========================================
// SENDY SYNC SERVICE
// ========================================

// Sendy sync service function - syncs calculator leads to tenant-specific lists
const syncCalculatorLeadsToSendy = async () => {
  const sendyService = getSendyService();

  if (!sendyService) {
    console.log('⚠️  Sendy not configured, skipping sync');
    return { synced: 0, failed: 0, skipped: 0 };
  }

  try {
    // Query unsynced leads with tenant config (limit 100)
    const unsyncedLeads = await db.execute<{
      id: string;
      tenant_id: string | null;
      customer_name: string;
      customer_email: string;
      city: string | null;
      state: string | null;
      source: string | null;
      stage: string | null;
      event_date: string | null;
      consented_at: Date | null;
      sendy_list_id: string | null;
      sendy_leads_list_id: string | null;
    }>(sql`
      SELECT 
        cl.id, cl.tenant_id, cl.customer_name, cl.customer_email,
        cl.city, cl.state, cl.source, cl.stage, cl.event_date, cl.consented_at,
        cl.sendy_list_id,
        tc.sendy_leads_list_id
      FROM calculator_leads cl
      LEFT JOIN tenant_configurations tc ON tc.tenant_id = cl.tenant_id
      WHERE cl.synced_to_sendy = false
      ORDER BY cl.created_at ASC
      LIMIT 100
    `);

    let syncedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const lead of unsyncedLeads.rows || []) {
      // Use lead-specific list ID, then tenant list ID, then skip
      const listId = lead.sendy_list_id || lead.sendy_leads_list_id;
      
      if (!listId) {
        console.log(`⚠️  No Sendy list ID configured for lead ${lead.id} (tenant: ${lead.tenant_id}), skipping`);
        skippedCount++;
        continue;
      }

      try {
        // Subscribe with custom fields
        const result = await sendyService.subscribe({
          email: lead.customer_email,
          name: lead.customer_name || undefined,
          list: listId,
          fields: {
            TENANT_ID: lead.tenant_id || '',
            STAGE: lead.stage || 'lead',
            SOURCE: lead.source || 'calculator',
            CITY: lead.city || '',
            STATE: lead.state || '',
            EVENT_DATE: lead.event_date || '',
            CONSENTED_AT: lead.consented_at ? lead.consented_at.toISOString() : '',
          },
        });

        if (result.success) {
          // Mark as synced and store subscriber ID
          await db.execute(sql`
            UPDATE calculator_leads
            SET synced_to_sendy = true, 
                synced_at = NOW(),
                sendy_subscriber_id = ${result.subscriberId},
                last_sync_error = NULL
            WHERE id = ${lead.id}
          `);
          syncedCount++;
        } else {
          // Store error
          await db.execute(sql`
            UPDATE calculator_leads
            SET last_sync_error = ${result.message}
            WHERE id = ${lead.id}
          `);
          failedCount++;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error syncing lead ${lead.id} to Sendy:`, error);
        
        // Store error
        await db.execute(sql`
          UPDATE calculator_leads
          SET last_sync_error = ${errorMsg}
          WHERE id = ${lead.id}
        `);
        failedCount++;
      }
    }

    console.log(`📧 Sendy sync complete: ${syncedCount} synced, ${failedCount} failed, ${skippedCount} skipped`);
    return { synced: syncedCount, failed: failedCount, skipped: skippedCount };
  } catch (error) {
    console.error('❌ Sendy sync service error:', error);
    return { synced: 0, failed: 0, skipped: 0 };
  }
};

// ========================================
// ADMIN IMPERSONATION
// ========================================

// Start impersonation (admin-only)
app.post("/api/admin/impersonate", ensureAuth, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { targetUserId, targetEmail } = req.body;
    const session = req.session as any;
    
    // Prevent nested impersonation
    if (session.isImpersonating) {
      return res.status(400).json({ ok: false, error: "Already impersonating. Exit current impersonation first." });
    }
    
    // Lookup target user
    let targetUser;
    if (targetUserId) {
      targetUser = await databaseStorage.getUserById(targetUserId);
    } else if (targetEmail) {
      targetUser = await databaseStorage.getUserByEmailOrUsername(targetEmail);
    } else {
      return res.status(400).json({ ok: false, error: "targetUserId or targetEmail required" });
    }
    
    if (!targetUser) {
      return res.status(404).json({ ok: false, error: "Target user not found" });
    }
    
    // Safety: block impersonating super_admin users
    if (targetUser.role === 'super_admin') {
      return res.status(403).json({ ok: false, error: "Cannot impersonate super admin users" });
    }
    
    // Save current session to backup
    session.backup = {
      userId: session.userId,
      email: session.email,
      role: session.role,
      tenantId: session.tenantId || null,
      bakerId: session.bakerId || null
    };
    
    session.impersonatorId = session.userId;
    session.impersonatorRole = session.role;
    
    // Clear tenant/baker context before switching
    session.tenantId = null;
    session.bakerId = null;
    
    // Switch to target user's session
    session.userId = targetUser.id;
    session.email = targetUser.email;
    session.role = targetUser.role || 'baker';
    session.isImpersonating = true;
    
    // Try to find tenantId and bakerId for target user
    try {
      const profiles = await db.query.profiles.findMany({
        where: (profiles, { eq }) => eq(profiles.userId, targetUser.id)
      });
      if (profiles.length > 0) {
        session.tenantId = profiles[0].tenantId;
      }
      
      const bakerResults = await db.execute<{ id: string }>(sql`
        SELECT id FROM bakers WHERE email = ${targetUser.email} LIMIT 1
      `);
      const bakers = bakerResults.rows || [];
      if (bakers.length > 0) {
        session.bakerId = bakers[0].id;
      }
    } catch (lookupError) {
      console.error('Error looking up tenant/baker:', lookupError);
    }
    
    // Audit log
    await audit("impersonation_start", {
      actorUserId: session.impersonatorId,
      actorEmail: session.backup.email,
      targetUserId: targetUser.id,
      targetEmail: targetUser.email,
      tenantId: session.tenantId || null,
      entityType: 'user'
    }, req);
    
    return res.json({
      ok: true,
      target: {
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role
      },
      isImpersonating: true
    });
  } catch (error) {
    console.error('Impersonation start error:', error);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// Manual Sendy sync trigger (admin-only)
app.post("/api/admin/sendy/sync-now", ensureAuth, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    console.log('🔄 Manual Sendy sync triggered by admin');
    const result = await syncCalculatorLeadsToSendy();
    
    return res.json({
      ok: true,
      message: 'Sendy sync completed',
      ...result
    });
  } catch (error) {
    console.error('Manual Sendy sync error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to sync leads to Sendy' 
    });
  }
});

// BakerOps sync - sync all bakers to platform-wide list (admin-only)
app.post("/api/admin/bakerops/sync-now", ensureAuth, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    console.log('🍰 BakerOps sync triggered by admin');
    
    const sendyService = getSendyService();
    const BAKEROPS_LIST_ID = process.env.BAKEROPS_LIST_ID;
    
    if (!sendyService || !BAKEROPS_LIST_ID) {
      return res.status(400).json({ 
        ok: false, 
        error: 'BakerOps not configured (missing BAKEROPS_LIST_ID or Sendy credentials)' 
      });
    }
    
    // Get all active bakers
    const bakersResult = await db.execute<{
      id: string;
      email: string;
      name: string;
      tenant_id: string | null;
      subscription_plan: string | null;
      city: string | null;
      state: string | null;
    }>(sql`
      SELECT id, email, name, tenant_id, subscription_plan, city, state
      FROM bakers
      WHERE email IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1000
    `);
    
    let syncedCount = 0;
    let failedCount = 0;
    
    for (const baker of bakersResult.rows || []) {
      try {
        const result = await sendyService.subscribe({
          email: baker.email,
          name: baker.name,
          list: BAKEROPS_LIST_ID,
          fields: {
            TIER: baker.subscription_plan || 'free',
            TENANT_ID: baker.tenant_id || '',
            BAKER_ID: baker.id,
            REGION: baker.state || '',
            CITY: baker.city || '',
          }
        });
        
        if (result.success) {
          syncedCount++;
        } else {
          failedCount++;
          console.error(`Failed to sync baker ${baker.id}:`, result.message);
        }
      } catch (error) {
        failedCount++;
        console.error(`Error syncing baker ${baker.id}:`, error);
      }
    }
    
    console.log(`🍰 BakerOps sync complete: ${syncedCount} synced, ${failedCount} failed`);
    
    return res.json({
      ok: true,
      message: 'BakerOps sync completed',
      synced: syncedCount,
      failed: failedCount
    });
  } catch (error) {
    console.error('BakerOps sync error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to sync bakers to BakerOps' 
    });
  }
});

// Sendy webhook receiver for unsubscribe/bounce notifications
app.post("/api/sendy/webhook", async (req, res) => {
  try {
    const { email, list_id, type, secret } = req.body;
    
    // Verify shared secret
    const SENDY_WEBHOOK_SECRET = process.env.SENDY_WEBHOOK_SECRET;
    if (SENDY_WEBHOOK_SECRET && secret !== SENDY_WEBHOOK_SECRET) {
      console.error('Invalid Sendy webhook secret');
      return res.status(403).json({ error: 'Invalid secret' });
    }
    
    if (!email || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log(`📨 Sendy webhook received: ${type} for ${email}`);
    
    // Handle different webhook types
    if (type === 'unsubscribe' || type === 'bounce' || type === 'complaint') {
      // Update calculator_leads status if exists
      await db.execute(sql`
        UPDATE calculator_leads
        SET stage = ${type === 'unsubscribe' ? 'unsubscribed' : 'bounced'},
            last_sync_error = ${type}
        WHERE customer_email = ${email}
      `);
      
      // Update customers status if exists
      await db.execute(sql`
        UPDATE customers
        SET status = ${type === 'unsubscribe' ? 'unsubscribed' : 'bounced'}
        WHERE email = ${email}
      `);
      
      console.log(`✅ Updated ${email} status to ${type}`);
    }
    
    res.json({ ok: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Sendy webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Stop impersonation
app.post("/api/admin/impersonate/stop", ensureAuth, async (req, res) => {
  try {
    const session = req.session as any;
    
    if (!session.isImpersonating || !session.backup) {
      return res.status(400).json({ ok: false, error: "Not currently impersonating" });
    }
    
    const restoredFromUserId = session.userId;
    
    // Restore original session
    session.userId = session.backup.userId;
    session.email = session.backup.email;
    session.role = session.backup.role;
    session.tenantId = session.backup.tenantId;
    session.bakerId = session.backup.bakerId;
    
    // Clear impersonation fields
    const impersonatorId = session.impersonatorId;
    delete session.isImpersonating;
    delete session.impersonatorId;
    delete session.impersonatorRole;
    delete session.backup;
    
    // Audit log
    await audit("impersonation_stop", {
      actorUserId: impersonatorId,
      restoredFromUserId,
      entityType: 'user'
    }, req);
    
    return res.json({ ok: true, isImpersonating: false });
  } catch (error) {
    console.error('Impersonation stop error:', error);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// Rate limiter for password reset endpoints - prevent abuse
const passwordResetLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many password reset attempts, please try again later" }
});

// Password reset: request reset link
app.post("/api/password/forgot", passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body ?? {};
    
    if (!email) {
      return res.status(400).json({ ok: false, error: "Email required" });
    }

    // Find user by email (case-insensitive)
    const user = await databaseStorage.getUserByEmailOrUsername(email.toLowerCase());

    // Always return success to avoid revealing if email exists
    if (!user) {
      return res.status(200).json({ ok: true, message: "If that email exists, we sent a reset link." });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    
    // Set 30 minute expiry
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Store hashed token in password_resets table
    await db.execute(sql`
      INSERT INTO password_resets (id, user_id, token_hash, ip, user_agent, expires_at)
      VALUES (${uuid()}, ${user.id}, ${tokenHash}, ${req.ip}, ${req.get('user-agent') || null}, ${expiresAt})
    `);

    // Send reset email
    const resetLink = `${FRONTEND_BASE_URL}/reset/${token}`;
    await sendResetEmail(user.email || email, resetLink);

    return res.status(200).json({ ok: true, message: "If that email exists, we sent a reset link." });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.status(200).json({ ok: true, message: "If that email exists, we sent a reset link." });
  }
});

// Password reset: confirm new password
app.post("/api/password/reset", passwordResetLimiter, async (req, res) => {
  try {
    const { token, password } = req.body ?? {};
    
    if (!token || !password) {
      return res.status(400).json({ ok: false, error: "Token and password required" });
    }

    // Hash the token to look it up
    const tokenHash = hashToken(token);

    // Find valid, unused token
    const resetRecord = await db.execute<{
      id: string;
      user_id: string;
      expires_at: Date;
      used_at: Date | null;
    }>(sql`
      SELECT id, user_id, expires_at, used_at
      FROM password_resets
      WHERE token_hash = ${tokenHash}
        AND used_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `);

    if (!resetRecord.rows || resetRecord.rows.length === 0) {
      return res.status(400).json({ ok: false, error: "Invalid or expired reset link" });
    }

    const reset = resetRecord.rows[0];
    const userId = reset.user_id;

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    await db.execute(sql`
      UPDATE users
      SET password_hash = ${passwordHash}
      WHERE id = ${userId}
    `);

    // Mark token as used
    await db.execute(sql`
      UPDATE password_resets
      SET used_at = NOW()
      WHERE id = ${reset.id}
    `);

    // Invalidate all sessions for this user
    await db.execute(sql`
      DELETE FROM sessions
      WHERE sess::text LIKE '%"userId":"' || ${userId} || '"%'
    `);

    return res.json({ ok: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ ok: false, error: "Reset failed" });
  }
});

// Auth guard middleware
function ensureAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if ((req.session as any)?.userId) {
    return next();
  }
  return res.status(401).json({ ok: false, error: "Unauthenticated" });
}

// Protected route example with session refresh
app.get("/api/app/me", ensureAuth, async (req, res) => {
  const session = req.session as any;
  const userId = session.userId;
  const userEmail = session.email;

  // Session refresh: backfill tenantId if missing
  if (session && userId && !session.tenantId && userEmail) {
    try {
      // Look up baker by email to get tenantId
      const bakerResults = await db.execute<{ id: string; tenant_id: string }>(sql`
        SELECT id, tenant_id FROM bakers WHERE email = ${userEmail} LIMIT 1
      `);
      const bakers = bakerResults.rows || [];
      if (bakers.length > 0 && bakers[0].tenant_id) {
        session.tenantId = bakers[0].tenant_id;
        session.bakerId = bakers[0].id;
        console.log(`✓ Session refreshed with tenantId for user ${userId}`);
      }
    } catch (refreshError) {
      console.error('Error refreshing session:', refreshError);
    }
  }

  res.json({ 
    ok: true, 
    userId,
    email: userEmail,
    role: session.role
  });
});

// Dashboard stats endpoint - tenant-aware
app.get("/api/app/stats", ensureAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const userEmail = (req.session as any).email;
    
    // Get baker and tenant info by email
    const baker = await databaseStorage.getBakerByEmail(userEmail);
    if (!baker || !baker.tenantId) {
      return res.status(404).json({ error: "Baker or tenant not found" });
    }
    
    const tenantId = baker.tenantId;
    const bakerId = baker.id;
    
    // Get stats with tenant filtering
    const stats = await databaseStorage.getDashboardStats(tenantId, bakerId);
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Recent messages endpoint - tenant-aware
app.get("/api/app/recent/messages", ensureAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const userEmail = (req.session as any).email;
    const limit = parseInt(req.query.limit as string) || 5;
    
    const baker = await databaseStorage.getBakerByEmail(userEmail);
    if (!baker || !baker.tenantId) {
      return res.status(404).json({ error: "Baker or tenant not found" });
    }
    
    const messages = await databaseStorage.getRecentMessages(baker.tenantId, baker.id, limit);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching recent messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Invoices due endpoint - tenant-aware
app.get("/api/app/invoices/due", ensureAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const userEmail = (req.session as any).email;
    const limit = parseInt(req.query.limit as string) || 5;
    
    const baker = await databaseStorage.getBakerByEmail(userEmail);
    if (!baker || !baker.tenantId) {
      return res.status(404).json({ error: "Baker or tenant not found" });
    }
    
    const invoices = await databaseStorage.getInvoicesDue(baker.tenantId, baker.id, limit);
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices due:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// Create Stripe payment link for invoice - tenant-aware
app.post("/api/app/invoices/:id/pay", ensureAuth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({ error: "Stripe not configured" });
    }

    const userEmail = (req.session as any).email;
    const invoiceId = req.params.id;
    
    const baker = await databaseStorage.getBakerByEmail(userEmail);
    if (!baker || !baker.tenantId) {
      return res.status(404).json({ error: "Baker or tenant not found" });
    }
    
    // Fetch invoice with tenant verification
    const result = await db.execute<{
      id: string;
      tenant_id: string;
      baker_id: string;
      invoice_number: string;
      title: string;
      total: string;
      remaining_balance: string;
      paid_at: Date | null;
    }>(sql`
      SELECT id, tenant_id, baker_id, invoice_number, title, total, remaining_balance, paid_at
      FROM invoices
      WHERE id = ${invoiceId} AND tenant_id = ${baker.tenantId}
      LIMIT 1
    `);

    const invoice = result.rows?.[0];
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (invoice.paid_at) {
      return res.status(400).json({ error: "Invoice already paid" });
    }

    const amountDue = parseFloat(invoice.remaining_balance || invoice.total);
    if (amountDue <= 0) {
      return res.status(400).json({ error: "No amount due on this invoice" });
    }

    // Create Stripe Checkout Session for invoice payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: invoice.title || `Invoice ${invoice.invoice_number}`,
              description: `Payment for Invoice #${invoice.invoice_number}`,
            },
            unit_amount: Math.round(amountDue * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || req.headers.origin}/invoices?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL || req.headers.origin}/invoices?payment=cancelled`,
      metadata: {
        invoiceId: invoice.id,
        tenantId: invoice.tenant_id,
        bakerId: invoice.baker_id,
      },
    });

    console.log('✅ Created payment session for invoice:', {
      invoiceId: invoice.id,
      sessionId: session.id,
      amount: amountDue,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating invoice payment link:", error);
    res.status(500).json({ error: "Failed to create payment link" });
  }
});

// Pipeline chart - Moved to routes.ts (using Drizzle groupBy)
// This endpoint is now handled by /api/app/charts/pipeline in routes.ts

// Revenue MTD - current vs previous month (tenant-aware)
app.get("/api/app/stats/revenue-mtd", ensureAuth, async (req, res) => {
  try {
    const userEmail = (req.session as any).email;
    
    const baker = await databaseStorage.getBakerByEmail(userEmail);
    if (!baker || !baker.tenantId) {
      return res.status(404).json({ error: "Baker or tenant not found" });
    }
    
    const result = await db.execute<{ current: string; previous: string }>(sql`
      WITH current_month AS (
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE tenant_id = ${baker.tenantId}
          AND status = 'succeeded'
          AND created_at >= date_trunc('month', now())
      ),
      previous_month AS (
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE tenant_id = ${baker.tenantId}
          AND status = 'succeeded'
          AND created_at >= date_trunc('month', now() - interval '1 month')
          AND created_at < date_trunc('month', now())
      )
      SELECT 
        current_month.total as current,
        previous_month.total as previous
      FROM current_month, previous_month
    `);
    
    const current = parseFloat(result.rows?.[0]?.current || '0');
    const previous = parseFloat(result.rows?.[0]?.previous || '0');
    const deltaPct = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    
    const formatUSD = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    };
    
    res.json({ 
      current, 
      previous, 
      deltaPct,
      currentFormatted: formatUSD(current),
      previousFormatted: formatUSD(previous)
    });
  } catch (error) {
    console.error("Error fetching revenue MTD:", error);
    res.status(500).json({ error: "Failed to fetch revenue data" });
  }
});

// Tasks - list tasks by status (tenant-aware)
app.get("/api/app/tasks", ensureAuth, async (req, res) => {
  try {
    const userEmail = (req.session as any).email;
    const userId = (req.session as any).userId;
    const status = (req.query.status as string) || 'pending';
    
    const baker = await databaseStorage.getBakerByEmail(userEmail);
    if (!baker || !baker.tenantId) {
      return res.status(404).json({ error: "Baker or tenant not found" });
    }
    
    const result = await db.execute<{
      id: string;
      title: string;
      due_date: string | null;
      status: string;
      created_at: Date;
    }>(sql`
      SELECT id, title, due_date, status, created_at
      FROM tasks
      WHERE tenant_id = ${baker.tenantId}
        AND status = ${status}
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Tasks - create new task (tenant-aware)
app.post("/api/app/tasks", ensureAuth, async (req, res) => {
  try {
    const userEmail = (req.session as any).email;
    const userId = (req.session as any).userId;
    const { title, dueDate } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    
    const baker = await databaseStorage.getBakerByEmail(userEmail);
    if (!baker || !baker.tenantId) {
      return res.status(404).json({ error: "Baker or tenant not found" });
    }
    
    const taskId = uuid();
    await db.execute(sql`
      INSERT INTO tasks (id, tenant_id, user_id, title, due_date, status)
      VALUES (${taskId}, ${baker.tenantId}, ${userId}, ${title}, ${dueDate || null}, 'pending')
    `);
    
    res.json({ ok: true, id: taskId });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Tasks - mark task as complete (tenant-aware)
app.post("/api/app/tasks/:id/complete", ensureAuth, async (req, res) => {
  try {
    const userEmail = (req.session as any).email;
    const taskId = req.params.id;
    
    const baker = await databaseStorage.getBakerByEmail(userEmail);
    if (!baker || !baker.tenantId) {
      return res.status(404).json({ error: "Baker or tenant not found" });
    }
    
    await db.execute(sql`
      UPDATE tasks
      SET status = 'completed', completed_at = NOW()
      WHERE id = ${taskId} AND tenant_id = ${baker.tenantId}
    `);
    
    res.json({ ok: true });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ error: "Failed to complete task" });
  }
});

// OAuth routes for Accounts integration - DISABLED
// These routes conflict with the React SPA login page
// Commenting out to allow React Router to handle /login
/*
const ACCOUNTS = process.env.ACCOUNTS_BASE_URL || 'https://accounts.bakeriq.app';
const SELF = process.env.APP_BASE_URL || process.env.MARKET_BASE_URL || '';

app.get('/login', (req, res) => {
  const state = Math.random().toString(36).slice(2);
  const redirectUri = `${SELF}/auth/callback`;
  const url = new URL('/oauth/authorize', ACCOUNTS);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  res.redirect(url.toString());
});

app.get('/auth/callback', async (req, res) => {
  const code = String(req.query.code || '');
  if (!code) return res.status(400).send('Missing code');
  const resp = await fetch(`${ACCOUNTS}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'authorization_code', code })
  });
  const data = await resp.json();
  if (!resp.ok) return res.status(500).json(data);
  // store access token in httpOnly cookie
  res.cookie('access_token', data.access_token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 3600 * 1000 });
  res.redirect('/'); // or dashboard
});

// helper to read current user
app.get('/me', async (req, res) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: 'unauthenticated' });
  const resp = await fetch(`${ACCOUNTS}/userinfo`, { headers: { Authorization: `Bearer ${token}` } });
  const me = await resp.json();
  if (!resp.ok) return res.status(401).json({ error: 'invalid_token', detail: me });
  res.json(me);
});
*/

(async () => {
  const server = await registerRoutes(app);
  
  // Setup clean authentication routes
  setupAuthRoutes(app);

  // Mount AI routes
  registerAiRoutes(app);

  // Mount billing routes
  registerBillingRoutes(app);

  // Security routes (refresh tokens, webhooks, health checks)
  registerSecurityRoutes(app);
  logger.info('All routes registered');

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 404 handler - must come AFTER Vite/static setup
  app.use(notFoundHandler);

  // Global error handler - must be last middleware
  app.use(globalErrorHandler);

  // ====== CAMPAIGN SENDER LOGIC ======
  
  async function processCampaignSends() {
    try {
      console.log('[Campaign Sender] Starting campaign send processing...');
      
      // Find approved campaigns that are ready to send
      const campaigns = await db.execute<{
        id: string;
        advertiser_id: string;
        name: string;
        unit_price_cents: number;
        max_sends: number;
        targeting: any;
      }>(sql`
        SELECT id, advertiser_id, name, unit_price_cents, max_sends, targeting
        FROM ad_campaigns
        WHERE status = 'approved'
          AND (scheduled_at IS NULL OR scheduled_at <= NOW())
        LIMIT 10
      `);

      if (!campaigns.rows || campaigns.rows.length === 0) {
        console.log('[Campaign Sender] No approved campaigns found');
        return;
      }

      for (const campaign of campaigns.rows) {
        try {
          await processSingleCampaign(campaign);
        } catch (error) {
          console.error(`[Campaign Sender] Error processing campaign ${campaign.id}:`, error);
        }
      }
    } catch (error) {
      console.error('[Campaign Sender] Error in campaign sender:', error);
    }
  }

  async function processSingleCampaign(campaign: any) {
    const { id: campaignId, advertiser_id: advertiserId, unit_price_cents: unitPriceCents, max_sends: maxSends, targeting } = campaign;

    // Get advertiser credits
    const creditsResult = await db.execute<{ balance_cents: number }>(sql`
      SELECT balance_cents FROM advertiser_credits WHERE advertiser_id = ${advertiserId}
    `);
    const balanceCents = creditsResult.rows?.[0]?.balance_cents || 0;

    // Count already sent deliveries for this campaign
    const sentCount = await db.execute<{ count: number }>(sql`
      SELECT COUNT(*) as count FROM ad_deliveries WHERE campaign_id = ${campaignId} AND status != 'queued'
    `);
    const alreadySent = parseInt(sentCount.rows?.[0]?.count?.toString() || '0');

    // Calculate how many we can send
    const maxAffordable = Math.floor(balanceCents / unitPriceCents);
    const maxAllowed = Math.min(maxSends - alreadySent, maxAffordable);

    if (maxAllowed <= 0) {
      console.log(`[Campaign ${campaignId}] No sends available (sent: ${alreadySent}, max: ${maxSends}, credits: ${balanceCents})`);
      return;
    }

    // Build WHERE clause for eligible leads (same as preflight but with additional checks)
    let whereConditions = [
      sql`network_opt_in = true`,
      sql`unsubscribed_network = false`,
      sql`(last_network_contact_at IS NULL OR (NOW() - last_network_contact_at) > INTERVAL '7 days')`
    ];

    // Geographic targeting
    if (targeting?.geo) {
      if (targeting.geo.states && targeting.geo.states.length > 0) {
        whereConditions.push(sql`state = ANY(${targeting.geo.states}::text[])`);
      }
      if (targeting.geo.cities && targeting.geo.cities.length > 0) {
        whereConditions.push(sql`city = ANY(${targeting.geo.cities}::text[])`);
      }
      if (targeting.geo.zips && targeting.geo.zips.length > 0) {
        whereConditions.push(sql`postal_code = ANY(${targeting.geo.zips}::text[])`);
      }
    }

    // Date window targeting
    if (targeting?.dateWindow) {
      if (targeting.dateWindow.from) {
        whereConditions.push(sql`event_date >= ${targeting.dateWindow.from}`);
      }
      if (targeting.dateWindow.to) {
        whereConditions.push(sql`event_date <= ${targeting.dateWindow.to}`);
      }
    }

    // Budget targeting
    if (targeting?.budget) {
      if (targeting.budget.min !== undefined) {
        whereConditions.push(sql`budget_min >= ${targeting.budget.min}`);
      }
      if (targeting.budget.max !== undefined) {
        whereConditions.push(sql`budget_max <= ${targeting.budget.max}`);
      }
    }

    // Interests targeting
    if (targeting?.interests && targeting.interests.length > 0) {
      whereConditions.push(sql`interests && ${targeting.interests}::text[]`);
    }

    // Exclude recently quoted/contracted leads
    whereConditions.push(sql`
      NOT EXISTS (
        SELECT 1 FROM quotes 
        WHERE quotes.lead_id = calculator_leads.id 
        AND quotes.created_at > NOW() - INTERVAL '30 days'
      )
    `);
    whereConditions.push(sql`
      NOT EXISTS (
        SELECT 1 FROM contracts 
        WHERE contracts.lead_id = calculator_leads.id 
        AND contracts.created_at > NOW() - INTERVAL '30 days'
      )
    `);

    // Exclude leads already contacted by THIS advertiser in last 30 days
    whereConditions.push(sql`
      NOT EXISTS (
        SELECT 1 FROM ad_deliveries 
        JOIN ad_campaigns ON ad_deliveries.campaign_id = ad_campaigns.id
        WHERE ad_deliveries.lead_id = calculator_leads.id 
        AND ad_campaigns.advertiser_id = ${advertiserId}
        AND ad_deliveries.sent_at > NOW() - INTERVAL '30 days'
      )
    `);

    const whereClause = sql.join(whereConditions, sql` AND `);

    // Select eligible leads
    const leads = await db.execute<{
      id: string;
      customer_name: string;
      customer_email: string;
    }>(sql`
      SELECT id, customer_name, customer_email
      FROM calculator_leads
      WHERE ${whereClause}
      LIMIT ${maxAllowed}
    `);

    if (!leads.rows || leads.rows.length === 0) {
      console.log(`[Campaign ${campaignId}] No eligible leads found`);
      return;
    }

    console.log(`[Campaign ${campaignId}] Sending to ${leads.rows.length} leads (max allowed: ${maxAllowed})`);

    // Send emails
    let successCount = 0;
    for (const lead of leads.rows) {
      try {
        await sendCampaignEmail(campaignId, lead, campaign);
        successCount++;
      } catch (error) {
        console.error(`[Campaign ${campaignId}] Error sending to ${lead.customer_email}:`, error);
      }
    }

    console.log(`[Campaign ${campaignId}] Successfully sent ${successCount}/${leads.rows.length} emails`);
  }

  async function sendCampaignEmail(campaignId: string, lead: any, campaign: any) {
    const { id: leadId, customer_email: email, customer_name: name } = lead;
    const { advertiser_id: advertiserId, unit_price_cents: unitPriceCents } = campaign;

    // Create or get unsubscribe token
    const tokenPlain = crypto.randomUUID();
    const tokenHash = crypto.createHash('sha256').update(tokenPlain).digest('hex');

    // Check if token already exists for this lead
    const existingToken = await db.execute<{ id: string }>(sql`
      SELECT id FROM unsubscribe_tokens WHERE lead_id = ${leadId} LIMIT 1
    `);

    if (!existingToken.rows || existingToken.rows.length === 0) {
      await db.execute(sql`
        INSERT INTO unsubscribe_tokens (id, lead_id, token_hash, created_at)
        VALUES (${crypto.randomUUID()}, ${leadId}, ${tokenHash}, NOW())
      `);
    }

    // Create delivery record
    const deliveryId = crypto.randomUUID();
    await db.execute(sql`
      INSERT INTO ad_deliveries (id, campaign_id, lead_id, status, created_at)
      VALUES (${deliveryId}, ${campaignId}, ${leadId}, 'queued', NOW())
    `);

    // Build email
    const subject = `Special Offer for ${name} - via BakerIQ`;
    const openPixel = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/trk/o?d=${deliveryId}`;
    const unsubLink = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/unsub?t=${tokenPlain}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>We have an exclusive offer for you from our partner advertiser.</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/trk/c?d=${deliveryId}&u=${encodeURIComponent('https://example.com/offer')}">View Offer</a></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This message brought to you via <strong>BakerIQ</strong>
          <br>
          <a href="${unsubLink}" style="color: #666;">Unsubscribe from partner offers</a>
        </p>
        <img src="${openPixel}" width="1" height="1" style="display:none;" />
      </div>
    `;

    // Send via SES
    await ses.send(new SendEmailCommand({
      FromEmailAddress: 'partners@bakeriq.app',
      Destination: { ToAddresses: [email] },
      Content: {
        Simple: {
          Subject: { Data: subject },
          Body: { Html: { Data: html } }
        }
      }
    }));

    // Update delivery status
    await db.execute(sql`
      UPDATE ad_deliveries
      SET status = 'sent', sent_at = NOW()
      WHERE id = ${deliveryId}
    `);

    // Update lead last contact
    await db.execute(sql`
      UPDATE calculator_leads
      SET last_network_contact_at = NOW()
      WHERE id = ${leadId}
    `);

    // Deduct credits
    await db.execute(sql`
      UPDATE advertiser_credits
      SET balance_cents = balance_cents - ${unitPriceCents}, updated_at = NOW()
      WHERE advertiser_id = ${advertiserId}
    `);

    // Write ledger entry
    await db.execute(sql`
      INSERT INTO advertiser_credits_ledger (id, advertiser_id, delta_cents, reason, campaign_id, created_at)
      VALUES (${crypto.randomUUID()}, ${advertiserId}, ${-unitPriceCents}, 'Campaign send', ${campaignId}, NOW())
    `);
  }

  // Start email automation scheduler for subscription lifecycle management
  startEmailAutomationScheduler();

  // Run Sendy sync every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    await syncCalculatorLeadsToSendy();
  });
  console.log('Sendy sync job scheduled (runs every 10 minutes)');

  // Start daily cleanup job for expired/used password reset tokens
  // Runs every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('Running password reset token cleanup...');
      const result = await db.execute(sql`
        DELETE FROM password_resets
        WHERE (expires_at < NOW() OR used_at IS NOT NULL)
          AND created_at < NOW() - INTERVAL '7 days'
      `);
      console.log(`Cleaned up password reset tokens: ${result.rowCount || 0} rows deleted`);
    } catch (error) {
      console.error('Password reset token cleanup error:', error);
    }
  });
  console.log('Password reset token cleanup job scheduled (daily at 2 AM)');

  // Clean up expired refresh tokens daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('Running refresh token cleanup...');
      const count = await cleanupExpiredTokens();
      logger.info(`Cleaned up ${count} expired refresh tokens`);
    } catch (error) {
      logger.error('Refresh token cleanup failed', error);
    }
  });
  logger.info('Refresh token cleanup job scheduled (daily at 3 AM)');

  // Campaign sender cron job - runs every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    await processCampaignSends();
  });
  console.log('Campaign sender job scheduled (runs every 5 minutes)');

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
