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
import { setupVite, serveStatic, log } from "./vite";
import { startEmailAutomationScheduler } from "./emailAutomation";
import { databaseStorage } from "./databaseStorage.js";
import { sendResetEmail } from "./mailer";
import { sql } from "drizzle-orm";

const app = express();

// Trust proxy for HTTPS enforcement behind Replit proxy
app.set('trust proxy', 1);

// Security headers - must come early
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
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
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
    sameSite: 'lax'
  }
}));

// NOW set up body parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Health (FIRST)
const health = (endpoint: string) => (_req: any, res: any) => res.json({ ok: true, app: 'app', endpoint });
app.get('/health',     health('/health'));
app.get('/api/health', health('/api/health'));
app.get('/healthz',    health('/healthz')); // alias for non-custom domains

// serve a simple calc page
const PUB = path.join(process.cwd(), "public");
app.use("/calc", express.static(PUB));
app.get("/calc/cake", (_req, res) => {
  res.sendFile(path.join(PUB, "calc-cake.html"));
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

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

// Session probe endpoint - check if user is authenticated
app.get("/api/session", (req, res) => {
  const authed = Boolean((req.session as any)?.userId);
  res.json({
    authenticated: authed,
    userId: authed ? (req.session as any).userId : null,
  });
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

// Password reset: request reset link
app.post("/api/password/forgot", async (req, res) => {
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
app.post("/api/password/reset", async (req, res) => {
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

// Protected route example
app.get("/api/app/me", ensureAuth, (req, res) => {
  res.json({ 
    ok: true, 
    userId: (req.session as any).userId,
    email: (req.session as any).email,
    role: (req.session as any).role
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

// OAuth routes for Accounts integration
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

(async () => {
  const server = await registerRoutes(app);
  
  // Setup clean authentication routes
  setupAuthRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start email automation scheduler for subscription lifecycle management
  startEmailAutomationScheduler();

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
