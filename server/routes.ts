import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProfileSchema, insertEstimateSchema, insertLeadSchema, insertReviewSchema, 
  insertTransactionSchema, insertAvailabilitySchema, insertAnalyticsSchema, insertBakerProfileSchema,
  insertTenantSchema, insertTenantConfigurationSchema 
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

  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      // Handle Stripe webhooks for payment status updates
      const event = req.body;
      
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
      console.error('Webhook error:', error);
      res.status(400).json({ error: error.message });
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
      
      // Use SDXL model for high-quality image generation
      const output = await replicate.run(
        "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
        {
          input: {
            prompt: prompt,
            width: 768,
            height: 768,
            num_inference_steps: 25,
            guidance_scale: 7.5,
            scheduler: "DPMSolverMultistep",
            negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature"
          }
        }
      );

      console.log('Replicate API response:', output);
      
      // The output is an array of image URLs
      const imageUrl = Array.isArray(output) ? output[0] : output;
      
      if (!imageUrl) {
        console.log('No image URL in response');
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
      const quotes = await storage.getQuotesByCustomerId(req.params.customerId);
      res.json(quotes);
    } catch (error) {
      console.error('Error fetching customer quotes:', error);
      res.status(500).json({ error: 'Failed to fetch quotes' });
    }
  });

  app.get('/api/customers/:customerId/transactions', async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByCustomerId(req.params.customerId);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching customer transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
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

  const httpServer = createServer(app);
  return httpServer;
}
