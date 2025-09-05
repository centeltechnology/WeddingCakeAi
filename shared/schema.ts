import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, json } from "drizzle-orm/pg-core";
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
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true });
export const insertEstimateSchema = createInsertSchema(estimates).omit({ id: true, createdAt: true });
export const insertBakerSchema = createInsertSchema(bakers).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertEstimate = z.infer<typeof insertEstimateSchema>;
export type InsertBaker = z.infer<typeof insertBakerSchema>;

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Estimate = typeof estimates.$inferSelect;
export type Baker = typeof bakers.$inferSelect;
