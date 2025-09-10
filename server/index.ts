import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupAuthRoutes } from "./authRoutes";
import { setupVite, serveStatic, log } from "./vite";
import { startEmailAutomationScheduler } from "./emailAutomation";

const app = express();

// Import stripe for webhook handler
import Stripe from "stripe";
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe webhook endpoint MUST come BEFORE body parsing middleware
// This ensures we get the raw body that Stripe requires for signature verification
app.post(["/webhooks/stripe", "/api/webhooks/stripe"], express.raw({ type: 'application/json' }), async (req, res) => {
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

  // Process the webhook event
  try {
    console.log('Processing webhook event:', event.type);
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log('Payment succeeded for payment intent:', paymentIntent.id);
      
      // Import storage here to avoid circular dependencies
      const { storage } = await import('./storage');
      const { sendEmail } = await import('./emailService');
      
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
        
        console.log('Transaction marked as completed:', transaction.id);
      }
    } else if (event.type === 'account.updated') {
      console.log('Stripe Connect account updated:', event.data.object.id);
    }
    
    res.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
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
