import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
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

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Create new baker (signup)
  app.post("/api/bakers", async (req, res) => {
    try {
      const bakerData = insertBakerSchema.parse(req.body);
      const baker = await storage.createBaker(bakerData);
      
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
      
      res.status(201).json(baker);
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
  app.post("/api/bakers/:id/portfolio", async (req, res) => {
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
  app.post("/api/leads", async (req, res) => {
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
      
      const paymentIntent = await stripe.paymentIntents.create({
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
      });

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

  // Analytics routes
  app.get("/api/bakers/:bakerId/analytics", async (req, res) => {
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

  // Super Admin API Routes
  app.get('/api/super-admin/stats', async (req, res) => {
    try {
      const stats = {
        totalTenants: 15,
        activeTenants: 12,
        totalUsers: 847,
        monthlyRevenue: 18750.00,
        totalRevenue: 156230.00,
        revenueGrowth: 12.5,
        activeUsers24h: 342,
        systemHealth: 99.8
      };
      res.json(stats);
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      res.status(500).json({ error: 'Failed to fetch platform statistics' });
    }
  });

  app.get('/api/super-admin/tenants', async (req, res) => {
    try {
      const tenants = [
        {
          id: 'tenant-1',
          name: 'Sweet Dreams Bakery',
          status: 'active',
          planType: 'Professional',
          monthlyRevenue: 2850.00,
          userCount: 8,
          lastActivity: '2024-01-15T10:30:00Z',
          createdAt: '2023-11-20T08:15:00Z'
        },
        {
          id: 'tenant-2',
          name: 'Artisan Cakes Co',
          status: 'active',
          planType: 'Premium',
          monthlyRevenue: 4200.00,
          userCount: 12,
          lastActivity: '2024-01-16T14:22:00Z',
          createdAt: '2023-10-15T12:45:00Z'
        },
        {
          id: 'tenant-3',
          name: 'Wedding Wonders',
          status: 'trial',
          planType: 'Trial',
          monthlyRevenue: 0.00,
          userCount: 3,
          lastActivity: '2024-01-14T16:45:00Z',
          createdAt: '2024-01-10T09:30:00Z'
        },
        {
          id: 'tenant-4',
          name: 'Custom Cake Studio',
          status: 'suspended',
          planType: 'Basic',
          monthlyRevenue: 950.00,
          userCount: 5,
          lastActivity: '2024-01-05T11:20:00Z',
          createdAt: '2023-12-01T14:10:00Z'
        },
        {
          id: 'tenant-5',
          name: 'Deluxe Desserts',
          status: 'active',
          planType: 'Premium',
          monthlyRevenue: 3650.00,
          userCount: 15,
          lastActivity: '2024-01-16T09:15:00Z',
          createdAt: '2023-09-30T16:22:00Z'
        }
      ];
      res.json(tenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({ error: 'Failed to fetch tenants' });
    }
  });

  app.get('/api/super-admin/users', async (req, res) => {
    try {
      const users = [
        {
          id: 'user-1',
          name: 'Sarah Johnson',
          email: 'sarah@sweetdreams.com',
          tenantId: 'tenant-1',
          tenantName: 'Sweet Dreams Bakery',
          role: 'owner',
          status: 'active',
          lastLogin: '2024-01-16T08:30:00Z',
          createdAt: '2023-11-20T08:15:00Z'
        },
        {
          id: 'user-2',
          name: 'Mike Chen',
          email: 'mike@artisancakes.com',
          tenantId: 'tenant-2',
          tenantName: 'Artisan Cakes Co',
          role: 'owner',
          status: 'active',
          lastLogin: '2024-01-15T19:45:00Z',
          createdAt: '2023-10-15T12:45:00Z'
        },
        {
          id: 'user-3',
          name: 'Emma Wilson',
          email: 'emma@sweetdreams.com',
          tenantId: 'tenant-1',
          tenantName: 'Sweet Dreams Bakery',
          role: 'admin',
          status: 'active',
          lastLogin: '2024-01-16T10:15:00Z',
          createdAt: '2023-12-05T14:30:00Z'
        },
        {
          id: 'user-4',
          name: 'David Martinez',
          email: 'david@weddingwonders.com',
          tenantId: 'tenant-3',
          tenantName: 'Wedding Wonders',
          role: 'owner',
          status: 'pending',
          lastLogin: '2024-01-14T16:45:00Z',
          createdAt: '2024-01-10T09:30:00Z'
        },
        {
          id: 'user-5',
          name: 'Lisa Brown',
          email: 'lisa@customcake.com',
          tenantId: 'tenant-4',
          tenantName: 'Custom Cake Studio',
          role: 'owner',
          status: 'suspended',
          lastLogin: '2024-01-05T11:20:00Z',
          createdAt: '2023-12-01T14:10:00Z'
        },
        {
          id: 'user-6',
          name: 'Tom Anderson',
          email: 'tom@deluxedesserts.com',
          tenantId: 'tenant-5',
          tenantName: 'Deluxe Desserts',
          role: 'owner',
          status: 'active',
          lastLogin: '2024-01-16T07:30:00Z',
          createdAt: '2023-09-30T16:22:00Z'
        },
        {
          id: 'user-7',
          name: 'Rachel Green',
          email: 'rachel@deluxedesserts.com',
          tenantId: 'tenant-5',
          tenantName: 'Deluxe Desserts',
          role: 'admin',
          status: 'active',
          lastLogin: '2024-01-15T16:20:00Z',
          createdAt: '2023-11-15T11:45:00Z'
        },
        {
          id: 'user-8',
          name: 'James Wilson',
          email: 'james@artisancakes.com',
          tenantId: 'tenant-2',
          tenantName: 'Artisan Cakes Co',
          role: 'editor',
          status: 'active',
          lastLogin: '2024-01-16T12:10:00Z',
          createdAt: '2023-12-20T09:15:00Z'
        }
      ];
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get('/api/super-admin/system-metrics', async (req, res) => {
    try {
      const metrics = [
        {
          name: 'CPU Usage',
          value: 12.5,
          unit: '%',
          status: 'healthy',
          trend: 'stable'
        },
        {
          name: 'Memory Usage',
          value: 68.2,
          unit: '%',
          status: 'healthy',
          trend: 'up'
        },
        {
          name: 'Disk Usage',
          value: 42.8,
          unit: '%',
          status: 'healthy',
          trend: 'up'
        },
        {
          name: 'Response Time',
          value: 145,
          unit: 'ms',
          status: 'healthy',
          trend: 'down'
        },
        {
          name: 'API Requests/min',
          value: 2847,
          unit: '',
          status: 'healthy',
          trend: 'up'
        },
        {
          name: 'Error Rate',
          value: 0.12,
          unit: '%',
          status: 'healthy',
          trend: 'down'
        },
        {
          name: 'Database Connections',
          value: 23,
          unit: '',
          status: 'healthy',
          trend: 'stable'
        },
        {
          name: 'Queue Length',
          value: 4,
          unit: '',
          status: 'healthy',
          trend: 'stable'
        },
        {
          name: 'Cache Hit Rate',
          value: 94.7,
          unit: '%',
          status: 'healthy',
          trend: 'up'
        }
      ];
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      res.status(500).json({ error: 'Failed to fetch system metrics' });
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
      
      // Mock account data - in real app, fetch from database
      const account = {
        id: bakerId,
        businessName: 'Sweet Dreams Bakery',
        ownerName: 'Sarah Johnson',
        email: 'sarah@sweetdreamsbakery.com',
        phone: '(555) 123-4567',
        address: {
          street: '123 Main Street',
          city: 'San Francisco',
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
      
      // Mock team data - in real app, fetch from database
      const team = [
        {
          id: 'member-1',
          name: 'Sarah Johnson',
          email: 'sarah@sweetdreamsbakery.com',
          role: 'owner',
          status: 'active',
          joinedAt: '2024-01-15T10:00:00Z',
          lastActive: new Date().toISOString()
        },
        {
          id: 'member-2',
          name: 'Mike Chen',
          email: 'mike@sweetdreamsbakery.com',
          role: 'admin',
          status: 'active',
          joinedAt: '2024-02-01T14:30:00Z',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
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
      // Mock team members for demo
      const members = [
        {
          id: 'member-1',
          name: 'Sarah Johnson',
          email: 'sarah@sweetdreams.com',
          role: 'owner',
          status: 'active',
          invitedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          permissions: ['*']
        },
        {
          id: 'member-2',
          name: 'Mike Chen',
          email: 'mike@sweetdreams.com',
          role: 'admin',
          status: 'active',
          invitedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          permissions: ['team.manage', 'quotes.manage', 'customers.manage', 'analytics.view', 'settings.manage']
        },
        {
          id: 'member-3',
          name: 'Emma Wilson',
          email: 'emma@sweetdreams.com',
          role: 'editor',
          status: 'active',
          invitedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          permissions: ['quotes.create', 'quotes.edit', 'customers.manage', 'analytics.view']
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

  const httpServer = createServer(app);
  return httpServer;
}
