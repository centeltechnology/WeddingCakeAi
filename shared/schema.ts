import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  rating: decimal("rating"),
  priceRange: text("price_range"),
  specialties: text("specialties").array(),
  description: text("description"),
  portfolio: text("portfolio").array(),
  subscriptionPlan: text("subscription_plan").default('free'), // free, pro, plus
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id),
  senderId: varchar("sender_id"), // baker or customer ID
  senderType: text("sender_type").notNull(), // 'baker' or 'customer'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true });
export const insertEstimateSchema = createInsertSchema(estimates).omit({ id: true, createdAt: true });
export const insertBakerSchema = createInsertSchema(bakers).omit({ id: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertEstimate = z.infer<typeof insertEstimateSchema>;
export type InsertBaker = z.infer<typeof insertBakerSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Estimate = typeof estimates.$inferSelect;
export type Baker = typeof bakers.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Message = typeof messages.$inferSelect;

// Reviews and ratings system
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bakerId: varchar("baker_id").notNull(),
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
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ id: true, createdAt: true });
export const insertBakerProfileSchema = createInsertSchema(bakerProfiles).omit({ id: true, createdAt: true, updatedAt: true });

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type BakerProfile = typeof bakerProfiles.$inferSelect;
export type InsertBakerProfile = z.infer<typeof insertBakerProfileSchema>;
