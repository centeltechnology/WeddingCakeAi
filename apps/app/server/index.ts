import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupAuthRoutes } from "./authRoutes";
import { setupVite, serveStatic, log } from "./vite";
import { startEmailAutomationScheduler } from "./emailAutomation";

const app = express();

// Trust proxy for HTTPS enforcement behind Replit proxy
app.set('trust proxy', 1);
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
