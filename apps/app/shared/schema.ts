import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, json, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Multi-tenancy tables
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subdomain: varchar("subdomain").notNull().unique(),
  customDomain: varchar("custom_domain"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  address: text("address"),
  subscriptionPlan: text("subscription_plan").default('basic'), // basic, premium, enterprise
  subscriptionStatus: text("subscription_status").default('active'), // active, suspended, cancelled
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tenantConfigurations = pgTable("tenant_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color").default('#B8860B'),
  secondaryColor: varchar("secondary_color").default('#F5E6B3'),
  accentColor: varchar("accent_color").default('#8B7355'),
  customMessages: json("custom_messages").$type<{
    heroTitle?: string;
    heroSubtitle?: string;
    footerMessage?: string;
    emailSignature?: string;
  }>().default({}),
  customCss: text("custom_css"),
  emailTemplates: json("email_templates").$type<{
    leadNotification?: string;
    customerWelcome?: string;
    estimateReady?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tenantBakerNetworks = pgTable("tenant_baker_networks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  bakerId: varchar("baker_id").notNull().references(() => bakers.id),
  isApproved: boolean("is_approved").default(false),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).default('0.0500'), // 5% default
  priority: integer("priority").default(0), // Higher number = shown first
  isExclusive: boolean("is_exclusive").default(false), // Only this tenant can show this baker
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tenantRevenueSharing = pgTable("tenant_revenue_sharing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  bakerId: varchar("baker_id").notNull().references(() => bakers.id),
  orderAmount: decimal("order_amount", { precision: 10, scale: 2 }),
  tenantCommission: decimal("tenant_commission", { precision: 10, scale: 2 }),
  bakerPayout: decimal("baker_payout", { precision: 10, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }),
  status: text("status").default('pending'), // pending, processed, paid
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email"),
  passwordHash: text("password_hash"),
  role: text("role").default('admin'), // 'super_admin', 'admin', 'baker'
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  resetTokenHash: text("reset_token_hash"), // Hashed password reset token
  resetTokenExpiresAt: timestamp("reset_token_expires_at"), // Token expiry time
  resetTokenUsedAt: timestamp("reset_token_used_at"), // When token was used
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id), // Added for multi-tenancy
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  partnerName: text("partner_name"),
  weddingDate: text("wedding_date"),
  venue: text("venue"),
  venueAddress: text("venue_address"),
  budget: text("budget"),
  restrictions: json("restrictions").$type<{
    glutenFree?: boolean;
    vegan?: boolean;
    nutFree?: boolean;
  }>().default({}),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const estimates = pgTable("estimates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id), // Added for multi-tenancy
  profileId: varchar("profile_id").references(() => profiles.id),
  name: text("name").notNull(),
  eventDate: text("event_date"),
  guestCount: integer("guest_count"),
  tiers: integer("tiers"),
  baseSize: integer("base_size"),
  shape: text("shape"),
  cakeFlavor: text("cake_flavor"),
  filling: text("filling"),
  decorations: json("decorations").$type<{
    fondant?: boolean;
    flowers?: boolean;
    goldAccents?: boolean;
    customTopper?: boolean;
  }>().default({}),
  delivery: text("delivery"),
  distance: text("distance"),
  specialRequests: text("special_requests"),
  subtotal: decimal("subtotal"),
  tax: decimal("tax"),
  total: decimal("total"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bakers = pgTable("bakers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: varchar("slug"),
  email: text("email").notNull(),
  passwordHash: text("password_hash"),
  phone: text("phone"),
  address: text("address").notNull(),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  rating: decimal("rating"),
  priceRange: text("price_range"),
  specialties: text("specialties").array(),
  cakeTypes: text("cake_types").array(),
  services: text("services").array(),
  description: text("description"),
  pricing: json("pricing").$type<{
    cakeSizes?: Array<{
      id: string;
      name: string;
      diameter: number;
      servings: number;
      basePrice: number;
      costToMake: number;
      profitMargin: number;
    }>;
    shapes?: Array<{
      id: string;
      name: string;
      baseUpcharge: number;
      costToMake: number;
      profitMargin: number;
    }>;
    flavors?: Array<{
      id: string;
      name: string;
      upcharge: number;
      isPremium: boolean;
    }>;
    decorations?: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      costToMake: number;
      category: string;
      isActive: boolean;
    }>;
    taxRate?: number;
    deliverySettings?: {
      baseDeliveryFee: number;
      freeDeliveryMinimum: number;
      deliveryRadius: number;
      perMileRate: number;
    };
    profitSettings?: {
      defaultMargin: number;
      minimumMargin: number;
      laborRate: number;
    };
    seasonalPricing?: any;
    volumeDiscounts?: any;
    lastUpdated?: string;
  }>(),
  portfolio: text("portfolio").array(),
  subscriptionPlan: text("subscription_plan").default('starter'), // starter, professional, enterprise
  isActive: boolean("is_active").default(true),
  // Domain configuration fields
  subdomain: varchar("subdomain"),
  customDomain: varchar("custom_domain"),
  // Payment Links (replacing Stripe Connect)
  paymentLinks: json("payment_links").$type<{
    zelle?: string;
    paypal?: string;
    cashapp?: string;
    venmo?: string;
    other?: { label: string; url: string }[];
  }>().default({}),
  // Simplified Availability System
  availability: json("availability").$type<{
    mode: 'template' | 'custom';
    templateKey?: 'mon-fri-9-5' | 'tue-sat-10-6' | 'weekends-10-4' | 'custom';
    rules?: { dayOfWeek: number; ranges: { start: string; end: string }[] }[];
    exceptions?: { date: string; ranges?: { start: string; end: string }[] }[];
    timeZone: string;
    slotMinutes: number;
    minNoticeMinutes: number;
    maxAdvanceDays: number;
  }>().default({
    mode: 'template',
    templateKey: 'mon-fri-9-5',
    timeZone: 'America/New_York',
    slotMinutes: 60,
    minNoticeMinutes: 1440, // 24 hours
    maxAdvanceDays: 60
  }),
  // Deprecated Stripe Connect fields (kept for migration safety)
  stripeConnectAccountId: varchar("stripe_connect_account_id"),
  stripeAccountStatus: varchar("stripe_account_status").default('not_started'),
  stripeOnboardingCompleted: boolean("stripe_onboarding_completed").default(false),
  stripeAccountType: varchar("stripe_account_type").default('express'),
  // Billing-related fields for self-service billing
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default('active'), // active, trialing, past_due, cancelled
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  businessName: text("business_name"), // For Stripe customer creation
  tenantId: varchar("tenant_id"), // For multi-tenant support
  // Email verification
  emailVerified: boolean("email_verified").default(false),
  verificationToken: varchar("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  // Password reset
  resetTokenHash: varchar("reset_token_hash"),
  resetTokenExpiresAt: timestamp("reset_token_expires_at"),
  resetTokenUsedAt: timestamp("reset_token_used_at"),
  // Social media handles
  socialMedia: json("social_media").$type<{
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    pinterest?: string;
    website?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id), // Added for multi-tenancy
  bakerId: varchar("baker_id").references(() => bakers.id),
  profileId: varchar("profile_id").references(() => profiles.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  weddingDate: text("wedding_date"),
  guestCount: integer("guest_count"),
  budget: text("budget"),
  message: text("message"),
  status: text("status").default('new'), // new, contacted, quoted, booked, declined
  estimateId: varchar("estimate_id").references(() => estimates.id),
  signature: text("signature"), // Project signature for idempotent upserts
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  signatureIdx: sql`CREATE INDEX IF NOT EXISTS leads_signature_idx ON ${table} (signature)`,
}));

// Old messages table (kept for backward compatibility)
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id),
  senderId: varchar("sender_id"), // baker or customer ID
  senderType: text("sender_type").notNull(), // 'baker' or 'customer'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Simple bookings system (replacing complex availability/consultations)
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bakerId: varchar("baker_id").notNull().references(() => bakers.id),
  tenantId: text("tenant_id"), // Added by Phase 0 migration
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  startISO: timestamp("start_iso").notNull(),
  endISO: timestamp("end_iso").notNull(),
  status: varchar("status").default('pending'), // pending, confirmed, cancelled
  notes: text("notes"),
  eventType: varchar("event_type"), // consultation, tasting, planning, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const calculatorLeads = pgTable("calculator_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  eventDate: text("event_date"),
  cakeConfiguration: json("cake_configuration").$type<{
    guestCount?: number;
    tiers?: number;
    baseSize?: number;
    shape?: string;
    cakeFlavor?: string;
    filling?: string;
    decorations?: any;
    delivery?: string;
    distance?: string;
    specialRequests?: string;
  }>(),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  syncedToSendy: boolean("synced_to_sendy").default(false),
  sendyListId: text("sendy_list_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true });
export const insertEstimateSchema = createInsertSchema(estimates).omit({ id: true, createdAt: true });
export const insertBakerSchema = createInsertSchema(bakers).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  name: z.string().min(1, "Bakery name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
});
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCalculatorLeadSchema = createInsertSchema(calculatorLeads).omit({ id: true, createdAt: true });

// Multi-tenancy schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTenantConfigurationSchema = createInsertSchema(tenantConfigurations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTenantBakerNetworkSchema = createInsertSchema(tenantBakerNetworks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTenantRevenueSharingSchema = createInsertSchema(tenantRevenueSharing).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertEstimate = z.infer<typeof insertEstimateSchema>;
export type InsertBaker = z.infer<typeof insertBakerSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertCalculatorLead = z.infer<typeof insertCalculatorLeadSchema>;

// Multi-tenancy types
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertTenantConfiguration = z.infer<typeof insertTenantConfigurationSchema>;
export type InsertTenantBakerNetwork = z.infer<typeof insertTenantBakerNetworkSchema>;
export type InsertTenantRevenueSharing = z.infer<typeof insertTenantRevenueSharingSchema>;

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Estimate = typeof estimates.$inferSelect;
export type Baker = typeof bakers.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type CalculatorLead = typeof calculatorLeads.$inferSelect;

// Multi-tenancy types
export type Tenant = typeof tenants.$inferSelect;
export type TenantConfiguration = typeof tenantConfigurations.$inferSelect;
export type TenantBakerNetwork = typeof tenantBakerNetworks.$inferSelect;
export type TenantRevenueSharing = typeof tenantRevenueSharing.$inferSelect;

// Reviews and ratings system
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bakerId: varchar("baker_id").notNull(),
  tenantId: text("tenant_id"), // Added by Phase 0 migration
  contractId: text("contract_id"), // FK to contracts - added in Phase 3
  customerId: varchar("customer_id"),
  customerName: varchar("customer_name").notNull(),
  customerEmail: varchar("customer_email").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  reviewText: text("review_text"),
  weddingDate: date("wedding_date"),
  cakeStyle: varchar("cake_style"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bakerId: varchar("baker_id").notNull(),
  customerId: varchar("customer_id"),
  leadId: varchar("lead_id"),
  type: varchar("type").notNull(), // 'consultation', 'deposit', 'final_payment', 'subscription'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("usd"),
  status: varchar("status").notNull(), // 'pending', 'completed', 'failed', 'refunded'
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Baker availability calendar
export const availability = pgTable("availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bakerId: varchar("baker_id").notNull(),
  date: date("date").notNull(),
  timeSlots: json("time_slots").notNull(), // [{ start: '09:00', end: '17:00', available: true }]
  isBlocked: boolean("is_blocked").default(false),
  blockReason: varchar("block_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Consultation bookings
export const consultations = pgTable("consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bakerId: varchar("baker_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  date: date("date").notNull(),
  timeSlot: varchar("time_slot").notNull(), // "09:00-10:00"
  duration: integer("duration").default(60), // minutes
  type: varchar("type").default("consultation"), // consultation, tasting, planning
  status: varchar("status").default("pending"), // pending, confirmed, completed, cancelled, rescheduled
  notes: text("notes"),
  eventType: varchar("event_type"), // wedding, birthday, corporate, etc
  eventDate: date("event_date"),
  guestCount: integer("guest_count"),
  budget: varchar("budget"),
  dietaryRestrictions: text("dietary_restrictions"),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, refunded
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  rescheduleReason: text("reschedule_reason"),
  cancelReason: text("cancel_reason"),
  reminderSent: boolean("reminder_sent").default(false),
  confirmationSent: boolean("confirmation_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Baker analytics tracking
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bakerId: varchar("baker_id").notNull(),
  metric: varchar("metric").notNull(), // 'profile_view', 'portfolio_view', 'contact_attempt', 'lead_converted'
  value: integer("value").default(1),
  metadata: json("metadata"), // Additional context data
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced CRM System
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  bakerId: varchar("baker_id").references(() => bakers.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  partnerName: text("partner_name"),
  eventDate: date("event_date"),
  eventType: text("event_type").default('wedding'), // wedding, birthday, anniversary, other
  venue: text("venue"),
  venueAddress: text("venue_address"),
  guestCount: integer("guest_count"),
  budget: text("budget"),
  source: text("source"), // referral, website, social, etc
  status: text("status").default('inquiry'), // inquiry, quoted, contracted, completed, cancelled
  dietaryRestrictions: json("dietary_restrictions").$type<{
    glutenFree?: boolean;
    vegan?: boolean;
    nutFree?: boolean;
    dairyFree?: boolean;
    keto?: boolean;
    other?: string;
  }>().default({}),
  preferences: json("preferences").$type<{
    flavors?: string[];
    styles?: string[];
    colors?: string[];
    themes?: string[];
  }>().default({}),
  priority: text("priority").default('medium'), // high, medium, low
  tags: text("tags").array(),
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUpDate: date("next_follow_up_date"),
  stripeCustomerId: varchar("stripe_customer_id"), // Added for Stripe integration
  // Customer Portal Authentication
  hasPortalAccess: boolean("has_portal_access").default(false),
  portalPasswordHash: text("portal_password_hash"), // Hashed password for portal access
  portalLastLogin: timestamp("portal_last_login"),
  portalActivationToken: varchar("portal_activation_token"),
  portalActivatedAt: timestamp("portal_activated_at"),
  addressJson: jsonb("address_json"), // JSONB address structure
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Portal Sessions
export const customerSessions = pgTable("customer_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  sessionToken: varchar("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversations to group messages between bakers and customers
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bakerId: varchar("baker_id").notNull().references(() => bakers.id),
  customerId: varchar("customer_id").references(() => customers.id),
  customerEmail: text("customer_email").notNull(), // For non-registered customers
  leadId: varchar("lead_id").references(() => leads.id),
  quoteId: varchar("quote_id"),
  bookingId: varchar("booking_id").references(() => bookings.id),
  subject: text("subject"),
  status: varchar("status").default('active'), // active, archived, closed
  lastMessageAt: timestamp("last_message_at"),
  unreadCountBaker: integer("unread_count_baker").default(0),
  unreadCountCustomer: integer("unread_count_customer").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages within conversations
export const conversationMessages = pgTable("conversation_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id"), // baker or customer ID
  senderType: text("sender_type").notNull(), // 'baker' or 'customer'
  senderName: text("sender_name"),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team Management Tables
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  bakerId: varchar("baker_id").notNull().references(() => bakers.id),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  role: varchar("role").notNull().$type<'owner' | 'admin' | 'editor' | 'viewer'>().default('viewer'),
  status: varchar("status").notNull().$type<'active' | 'pending' | 'suspended'>().default('active'),
  invitedBy: varchar("invited_by").references((): any => teamMembers.id),
  invitedAt: timestamp("invited_at").defaultNow(),
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamInvitations = pgTable("team_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  bakerId: varchar("baker_id").notNull().references(() => bakers.id),
  email: varchar("email").notNull(),
  role: varchar("role").notNull().$type<'admin' | 'editor' | 'viewer'>().default('viewer'),
  invitedBy: varchar("invited_by").notNull().references(() => teamMembers.id),
  invitationToken: varchar("invitation_token").notNull().unique(),
  status: varchar("status").notNull().$type<'pending' | 'accepted' | 'expired'>().default('pending'),
  invitedAt: timestamp("invited_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
});

export const customerNotes = pgTable("customer_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  bakerId: varchar("baker_id").notNull().references(() => bakers.id),
  note: text("note").notNull(),
  type: text("type").default('general'), // general, follow_up, quote, contract, payment
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advanced Quote Builder System
export const quoteTemplates = pgTable("quote_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  bakerId: varchar("baker_id").references(() => bakers.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // wedding, birthday, corporate, etc
  subcategory: text("subcategory"), // rustic-wedding, modern-corporate, kids-birthday
  
  // Enhanced Pricing Structure
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  pricePerServing: decimal("price_per_serving", { precision: 8, scale: 2 }),
  minimumOrder: decimal("minimum_order", { precision: 10, scale: 2 }),
  
  // Advanced Pricing Logic
  pricingModel: text("pricing_model").default('fixed'), // fixed, per_serving, tiered, custom
  seasonalPricing: json("seasonal_pricing").$type<{
    season: string; // spring, summer, fall, winter
    multiplier: number;
    startDate: string; // MM-DD format
    endDate: string; // MM-DD format
  }[]>().default([]),
  
  volumeDiscounts: json("volume_discounts").$type<{
    minQuantity: number;
    maxQuantity: number | null;
    discountPercentage: number;
    discountType: 'percentage' | 'fixed_amount';
  }[]>().default([]),
  
  // Enhanced Tier Configuration
  tiers: json("tiers").$type<{
    tierNumber: number;
    name: string; // "6\" Top", "8\" Middle", "10\" Base"
    diameter: number;
    height: number;
    servings: number;
    basePrice: number;
    priceMultiplier: number;
    isOptional: boolean;
  }[]>().default([]),
  
  // Advanced Add-ons System
  addOns: json("add_ons").$type<{
    id: string;
    name: string;
    description: string;
    category: string; // decorations, flavors, fillings, extras
    price: number;
    pricingType: 'fixed' | 'per_serving' | 'per_tier';
    isRequired: boolean;
    maxQuantity?: number;
    dependsOn?: string[]; // other add-on IDs this depends on
    conflictsWith?: string[]; // add-on IDs this conflicts with
    imageUrl?: string;
  }[]>().default([]),
  
  // Flavor and Filling Options
  flavorOptions: json("flavor_options").$type<{
    id: string;
    name: string;
    description: string;
    priceModifier: number; // additional cost or discount
    isDefault: boolean;
    isAvailable: boolean;
    allergens?: string[];
  }[]>().default([]),
  
  fillingOptions: json("filling_options").$type<{
    id: string;
    name: string;
    description: string;
    priceModifier: number;
    isDefault: boolean;
    isAvailable: boolean;
    allergens?: string[];
  }[]>().default([]),
  
  // Delivery and Setup Options
  deliveryOptions: json("delivery_options").$type<{
    type: string; // pickup, standard_delivery, white_glove, setup_only
    name: string;
    description: string;
    basePrice: number;
    pricePerMile?: number;
    maxDistance?: number; // miles
    setupIncluded: boolean;
    leadTime: number; // hours needed
  }[]>().default([]),
  
  // Business Rules
  leadTime: integer("lead_time").default(168), // hours (default 1 week)
  maxAdvanceBooking: integer("max_advance_booking").default(8760), // hours (default 1 year)
  cancellationPolicy: text("cancellation_policy"),
  
  // Template Metadata
  tags: text("tags").array().default([]),
  difficulty: text("difficulty").default('medium'), // easy, medium, hard, expert
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }), // percentage
  
  // Template Settings
  isActive: boolean("is_active").default(true),
  isPublic: boolean("is_public").default(false), // can other bakers see this template?
  isFeatured: boolean("is_featured").default(false),
  
  // Terms and Conditions
  terms: text("terms"),
  notes: text("notes"), // internal baker notes
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  bakerId: varchar("baker_id").references(() => bakers.id),
  customerId: varchar("customer_id").references(() => customers.id),
  leadId: varchar("lead_id").references(() => leads.id), // Link to originating lead
  templateId: varchar("template_id").references(() => quoteTemplates.id),
  quoteNumber: text("quote_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: date("event_date"),
  eventType: text("event_type"),
  guestCount: integer("guest_count"),
  deliveryAddress: text("delivery_address"),
  setupTime: text("setup_time"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default('0.0875'),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  depositPercentage: decimal("deposit_percentage", { precision: 5, scale: 2 }).default('50.00'),
  status: text("status").default('draft'), // draft, sent, viewed, approved, rejected, expired
  validUntil: date("valid_until"),
  customerNotes: text("customer_notes"),
  internalNotes: text("internal_notes"),
  terms: text("terms"),
  approvalToken: text("approval_token").unique(),
  approvalTokenExpiresAt: timestamp("approval_token_expires_at"),
  declinedAt: timestamp("declined_at"),
  declineReason: text("decline_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  approvedAt: timestamp("approved_at"),
});

export const quoteItems = pgTable("quote_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: varchar("quote_id").notNull().references(() => quotes.id),
  name: text("name").notNull(),
  description: text("description"),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).default('1'),
  unitPrice: decimal("unit_price", { precision: 8, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  category: text("category"), // cake, decoration, delivery, setup
  sortOrder: integer("sort_order").default(0),
});

// Contract Management System
export const contractTemplates = pgTable("contract_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  bakerId: varchar("baker_id").references(() => bakers.id),
  name: text("name").notNull(),
  description: text("description"),
  template: text("template").notNull(), // HTML template with placeholders
  category: text("category"), // wedding, corporate, standard
  terms: text("terms"),
  cancellationPolicy: text("cancellation_policy"),
  paymentTerms: text("payment_terms"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  bakerId: varchar("baker_id").references(() => bakers.id),
  customerId: varchar("customer_id").references(() => customers.id),
  quoteId: varchar("quote_id").references(() => quotes.id),
  templateId: varchar("template_id").references(() => contractTemplates.id),
  contractNumber: text("contract_number").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Final contract HTML
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }),
  eventDate: date("event_date"),
  deliveryDate: date("delivery_date"),
  setupTime: text("setup_time"),
  deliveryAddress: text("delivery_address"),
  specialInstructions: text("special_instructions"),
  status: text("status").default('draft'), // draft, sent, signed, active, completed, cancelled
  signedAt: timestamp("signed_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contractSignatures = pgTable("contract_signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  signerName: text("signer_name").notNull(),
  signerEmail: text("signer_email").notNull(),
  signerType: text("signer_type").notNull(), // customer, baker, witness
  signatureData: text("signature_data"), // Base64 signature image or e-signature token
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  signedAt: timestamp("signed_at").defaultNow(),
});

// Enhanced Payment System
export const paymentPlans = pgTable("payment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  bakerId: varchar("baker_id").notNull().references(() => bakers.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default('0'),
  remainingAmount: decimal("remaining_amount", { precision: 10, scale: 2 }),
  status: text("status").default('active'), // active, completed, cancelled, overdue
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentSchedule = pgTable("payment_schedule", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").notNull().references(() => paymentPlans.id),
  dueDate: date("due_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  description: text("description"),
  status: text("status").default('pending'), // pending, paid, overdue, cancelled
  paidAt: timestamp("paid_at"),
  transactionId: varchar("transaction_id").references(() => transactions.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  bakerId: varchar("baker_id").references(() => bakers.id),
  customerId: varchar("customer_id").references(() => customers.id),
  contractId: varchar("contract_id").references(() => contracts.id),
  quoteId: varchar("quote_id").references(() => quotes.id),
  invoiceNumber: text("invoice_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default('0'),
  remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }),
  dueDate: date("due_date"),
  status: text("status").default('draft'), // draft, sent, paid, overdue, cancelled
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced baker profiles with additional fields
export const bakerProfiles = pgTable("baker_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bakerId: varchar("baker_id").notNull(),
  businessHours: json("business_hours"), // { mon: { start: '09:00', end: '17:00' } }
  socialMedia: json("social_media"), // { instagram: '@bakery', facebook: 'BakeryPage' }
  certifications: text("certifications").array(),
  yearsExperience: integer("years_experience"),
  teamSize: integer("team_size"),
  leadTime: varchar("lead_time"), // '2-4 weeks', '1-2 months'
  consultationFee: decimal("consultation_fee", { precision: 8, scale: 2 }),
  minimumOrder: decimal("minimum_order", { precision: 10, scale: 2 }),
  deliveryRadius: integer("delivery_radius"), // miles
  dietaryOptions: text("dietary_options").array(), // ['gluten-free', 'vegan', 'keto']
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAvailabilitySchema = createInsertSchema(availability).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConsultationSchema = createInsertSchema(consultations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ id: true, createdAt: true });
export const insertBakerProfileSchema = createInsertSchema(bakerProfiles).omit({ id: true, createdAt: true, updatedAt: true });

// CRM schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerNoteSchema = createInsertSchema(customerNotes).omit({ id: true, createdAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConversationMessageSchema = createInsertSchema(conversationMessages).omit({ id: true, createdAt: true });

// Quote schemas
export const insertQuoteTemplateSchema = createInsertSchema(quoteTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuoteItemSchema = createInsertSchema(quoteItems).omit({ id: true });

// Contract schemas
export const insertContractTemplateSchema = createInsertSchema(contractTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContractSignatureSchema = createInsertSchema(contractSignatures).omit({ id: true, signedAt: true });

// Payment schemas
export const insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentScheduleSchema = createInsertSchema(paymentSchedule).omit({ id: true, createdAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, updatedAt: true });

// Payment Links validation schema
export const paymentLinksSchema = z.object({
  zelle: z.string().optional().refine(
    (val) => !val || val.includes('@') || /^\+?[\d\s\-\(\)]+$/.test(val),
    { message: 'Zelle must be a valid email or phone number' }
  ),
  paypal: z.string().url().optional().or(z.literal('')),
  cashapp: z.string().url().optional().or(z.literal('')),
  venmo: z.string().url().optional().or(z.literal('')),
  other: z.array(z.object({
    label: z.string().min(1, 'Label is required').max(50, 'Label must be 50 characters or less'),
    url: z.string().url('Must be a valid URL')
  })).optional().default([])
}).strict();

export type PaymentLinks = z.infer<typeof paymentLinksSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type BakerProfile = typeof bakerProfiles.$inferSelect;
export type InsertBakerProfile = z.infer<typeof insertBakerProfileSchema>;

// CRM types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type CustomerNote = typeof customerNotes.$inferSelect;
export type InsertCustomerNote = z.infer<typeof insertCustomerNoteSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type InsertConversationMessage = z.infer<typeof insertConversationMessageSchema>;

// Quote types
export type QuoteTemplate = typeof quoteTemplates.$inferSelect;
export type InsertQuoteTemplate = z.infer<typeof insertQuoteTemplateSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = z.infer<typeof insertQuoteItemSchema>;

// Contract types
export type ContractTemplate = typeof contractTemplates.$inferSelect;
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type ContractSignature = typeof contractSignatures.$inferSelect;
export type InsertContractSignature = z.infer<typeof insertContractSignatureSchema>;

// Payment types
export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type InsertPaymentPlan = z.infer<typeof insertPaymentPlanSchema>;
export type PaymentSchedule = typeof paymentSchedule.$inferSelect;
export type InsertPaymentSchedule = z.infer<typeof insertPaymentScheduleSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

// Super Admin feature tables

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  username: text("username"),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE, LOGIN, etc.
  resource: text("resource").notNull(), // user, tenant, baker, etc.
  resourceId: varchar("resource_id"),
  details: json("details").$type<Record<string, any>>().default({}),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemAnnouncements = pgTable("system_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default('info'), // info, warning, critical, maintenance
  targetAudience: text("target_audience").default('all'), // all, tenants, bakers, admins
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const systemHealthMetrics = pgTable("system_health_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricName: text("metric_name").notNull(),
  metricValue: decimal("metric_value", { precision: 10, scale: 2 }),
  unit: text("unit"), // percentage, ms, count, etc.
  status: text("status").default('healthy'), // healthy, warning, critical
  threshold: decimal("threshold", { precision: 10, scale: 2 }),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const dataExportJobs = pgTable("data_export_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobType: text("job_type").notNull(), // users, tenants, analytics, full_platform
  parameters: json("parameters").$type<Record<string, any>>().default({}),
  status: text("status").default('pending'), // pending, processing, completed, failed
  fileUrl: text("file_url"),
  totalRecords: integer("total_records"),
  processedRecords: integer("processed_records").default(0),
  errorMessage: text("error_message"),
  requestedById: varchar("requested_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const maintenanceSchedule = pgTable("maintenance_schedule", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  scheduledStart: timestamp("scheduled_start").notNull(),
  scheduledEnd: timestamp("scheduled_end").notNull(),
  status: text("status").default('scheduled'), // scheduled, in_progress, completed, cancelled
  impactLevel: text("impact_level").default('low'), // low, medium, high, critical
  affectedSystems: json("affected_systems").$type<string[]>().default([]),
  scheduledById: varchar("scheduled_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Super Admin Dashboard tables
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default('info'), // info, warning, urgent
  priority: text("priority").default('normal'), // low, normal, high
  isActive: boolean("is_active").default(true),
  targetAudience: text("target_audience"), // all, bakers, admins
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const emailJobs = pgTable("email_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  filters: json("filters").$type<Record<string, any>>(), // For filtering recipients
  templateKey: text("template_key"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  totalRecipients: integer("total_recipients").default(0),
  sentCount: integer("sent_count").default(0),
  failedCount: integer("failed_count").default(0),
  status: text("status").default('queued'), // queued, sending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => bakers.id),
  userId: varchar("user_id").references(() => users.id),
  actor: text("actor").notNull(), // Who performed the action
  entityType: text("entity_type").notNull(), // tenant, user, announcement, etc.
  action: text("action").notNull(), // created, updated, deleted, suspended, etc.
  metadata: json("metadata").$type<Record<string, any>>(), // Additional data
  createdAt: timestamp("created_at").defaultNow(),
});

// Super Admin schemas
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export const insertSystemAnnouncementSchema = createInsertSchema(systemAnnouncements).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSystemHealthMetricSchema = createInsertSchema(systemHealthMetrics).omit({ id: true, recordedAt: true });
export const insertDataExportJobSchema = createInsertSchema(dataExportJobs).omit({ id: true, createdAt: true, completedAt: true });
export const insertMaintenanceScheduleSchema = createInsertSchema(maintenanceSchedule).omit({ id: true, createdAt: true, updatedAt: true });

// New Super Admin Dashboard schemas
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmailJobSchema = createInsertSchema(emailJobs).omit({ id: true, createdAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });

// Super Admin types
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SystemAnnouncement = typeof systemAnnouncements.$inferSelect;
export type InsertSystemAnnouncement = z.infer<typeof insertSystemAnnouncementSchema>;
export type SystemHealthMetric = typeof systemHealthMetrics.$inferSelect;
export type InsertSystemHealthMetric = z.infer<typeof insertSystemHealthMetricSchema>;
export type DataExportJob = typeof dataExportJobs.$inferSelect;
export type InsertDataExportJob = z.infer<typeof insertDataExportJobSchema>;
export type MaintenanceSchedule = typeof maintenanceSchedule.$inferSelect;
export type InsertMaintenanceSchedule = z.infer<typeof insertMaintenanceScheduleSchema>;

// New Super Admin Dashboard types
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type EmailJob = typeof emailJobs.$inferSelect;
export type InsertEmailJob = z.infer<typeof insertEmailJobSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Email Campaign Tables for conversion campaigns
export const emailCampaignEnrollments = pgTable("email_campaign_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  bakerId: varchar("baker_id").references(() => bakers.id),
  campaignKey: text("campaign_key").notNull(), // e.g., 'free_to_paid_7day'
  status: text("status").notNull().default('active'), // active, completed, unsubscribed, converted, bounced
  lastStepSent: integer("last_step_sent").default(0), // 0-7, tracks progress
  lastSentAt: timestamp("last_sent_at"),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  convertedAt: timestamp("converted_at"),
  convertedPlan: text("converted_plan"), // professional, enterprise
  sendHour: integer("send_hour").default(16), // UTC hour to send emails (default 4pm)
  metadata: json("metadata").$type<{
    enrollmentSource?: string;
    originalPlan?: string;
    unsubscribeToken?: string;
    bounceReason?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailCampaignEvents = pgTable("email_campaign_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id").notNull().references(() => emailCampaignEnrollments.id),
  userId: varchar("user_id").references(() => users.id),
  bakerId: varchar("baker_id").references(() => bakers.id),
  campaignKey: text("campaign_key").notNull(),
  step: integer("step").notNull(), // 1-7
  eventType: text("event_type").notNull(), // sent, opened, clicked, bounced, unsubscribed, converted
  metadata: json("metadata").$type<{
    emailSubject?: string;
    clickUrl?: string;
    bounceReason?: string;
    userAgent?: string;
    ipAddress?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email Campaign Schemas
export const insertEmailCampaignEnrollmentSchema = createInsertSchema(emailCampaignEnrollments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmailCampaignEventSchema = createInsertSchema(emailCampaignEvents).omit({ id: true, createdAt: true });

export type InsertEmailCampaignEnrollment = z.infer<typeof insertEmailCampaignEnrollmentSchema>;
export type EmailCampaignEnrollment = typeof emailCampaignEnrollments.$inferSelect;

export type InsertEmailCampaignEvent = z.infer<typeof insertEmailCampaignEventSchema>;
export type EmailCampaignEvent = typeof emailCampaignEvents.$inferSelect;

// Super Admin Broadcast Email Campaigns
export const superAdminCampaigns = pgTable("super_admin_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(), // HTML content
  segmentFilter: json("segment_filter").$type<{
    plans?: string[]; // ['starter', 'professional', 'enterprise']
    statuses?: string[]; // ['active', 'suspended']
    hasBusinessName?: boolean;
    dateRange?: { start: string; end: string };
  }>().default({}),
  status: text("status").notNull().default('draft'), // draft, scheduled, sending, sent, failed
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  stats: json("stats").$type<{
    totalRecipients?: number;
    sent?: number;
    delivered?: number;
    opened?: number;
    clicked?: number;
    bounced?: number;
    unsubscribed?: number;
  }>().default({}),
  createdBy: varchar("created_by").notNull(), // super admin user ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const superAdminCampaignSends = pgTable("super_admin_campaign_sends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => superAdminCampaigns.id),
  bakerId: varchar("baker_id").notNull().references(() => bakers.id),
  status: text("status").notNull().default('pending'), // pending, sent, delivered, opened, clicked, bounced, failed
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  bouncedAt: timestamp("bounced_at"),
  failedAt: timestamp("failed_at"),
  errorMessage: text("error_message"),
  metadata: json("metadata").$type<{
    userAgent?: string;
    clickUrl?: string;
    bounceReason?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSuperAdminCampaignSchema = createInsertSchema(superAdminCampaigns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSuperAdminCampaignSendSchema = createInsertSchema(superAdminCampaignSends).omit({ id: true, createdAt: true });

export type SuperAdminCampaign = typeof superAdminCampaigns.$inferSelect;
export type InsertSuperAdminCampaign = z.infer<typeof insertSuperAdminCampaignSchema>;
export type SuperAdminCampaignSend = typeof superAdminCampaignSends.$inferSelect;
export type InsertSuperAdminCampaignSend = z.infer<typeof insertSuperAdminCampaignSendSchema>;

// Sendy Integration Settings
export const sendySettings = pgTable("sendy_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planMappings: json("plan_mappings").$type<{
    starter?: string; // Sendy list ID for starter plan
    professional?: string; // Sendy list ID for professional plan
    enterprise?: string; // Sendy list ID for enterprise plan
  }>().default({}),
  calculatorLeadsListId: text("calculator_leads_list_id"), // Sendy list ID for calculator leads
  syncEnabled: boolean("sync_enabled").default(false),
  lastSyncAt: timestamp("last_sync_at"),
  lastSyncStatus: text("last_sync_status"), // success, failed, running
  lastSyncMessage: text("last_sync_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSendySettingsSchema = createInsertSchema(sendySettings).omit({ id: true, createdAt: true, updatedAt: true });
export type SendySettings = typeof sendySettings.$inferSelect;
export type InsertSendySettings = z.infer<typeof insertSendySettingsSchema>;

// Baker Pricing Configuration Schema (for validation)
export const bakerPricingSchema = z.object({
  cakeSizes: z.array(z.object({
    id: z.string(),
    size: z.string(),
    servings: z.number(),
    basePrice: z.number(),
    costToMake: z.number(),
    profitMargin: z.number()
  })).optional(),
  shapes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    baseUpcharge: z.number(),
    costToMake: z.number(),
    profitMargin: z.number()
  })).optional(),
  flavors: z.array(z.object({
    id: z.string(),
    name: z.string(),
    upcharge: z.number(),
    isPremium: z.boolean()
  })).optional(),
  decorations: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.string(),
    isActive: z.boolean()
  })).optional(),
  taxRate: z.number().optional(),
  deliverySettings: z.object({
    baseDeliveryFee: z.number(),
    freeDeliveryMinimum: z.number().optional(),
    deliveryRadius: z.number().optional(),
    perMileRate: z.number().optional()
  }).optional(),
  profitSettings: z.object({
    defaultMargin: z.number(),
    minimumMargin: z.number(),
    laborRate: z.number()
  }).optional(),
  lastUpdated: z.string().optional()
});

export type BakerPricing = z.infer<typeof bakerPricingSchema>;
