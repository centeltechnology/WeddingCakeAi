import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, bakers, bookings, quoteTemplates, type Booking, type InsertBooking, type QuoteTemplate, type InsertQuoteTemplate } from "@shared/schema";
import bcrypt from "bcryptjs";
import { generateUniqueSlug } from "./utils";
import { randomUUID } from "crypto";

// Database-backed storage implementation
export class DatabaseStorage {
  // User methods
  async createUser(insertUser: {
    username: string;
    email?: string | null;
    password: string;
    role: 'super_admin' | 'baker';
    isActive?: boolean;
  }) {
    const [user] = await db
      .insert(users)
      .values({
        username: insertUser.username,
        email: insertUser.email || null,
        password: insertUser.password,
        role: insertUser.role,
        isActive: insertUser.isActive !== undefined ? insertUser.isActive : true,
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return user;
  }

  async getUsersWithRole(role: string) {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role));
  }

  async getAllUsers() {
    return await db
      .select()
      .from(users);
  }

  async updateUserLastLogin(userId: string) {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getUserById(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user;
  }

  async updateUserPassword(userId: string, hashedPassword: string) {
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
  }

  // Baker methods
  async getBakerByVerificationToken(token: string) {
    const [baker] = await db
      .select()
      .from(bakers)
      .where(eq(bakers.verificationToken, token))
      .limit(1);
    return baker;
  }

  async createBaker(insertBaker: {
    name: string;
    email: string;
    password: string;
    address: string;
    phone?: string | null;
    isActive?: boolean;
    subscriptionPlan?: string;
    emailVerified?: boolean;
    verificationToken?: string;
    verificationTokenExpiry?: Date;
  }) {
    // Generate unique slug from baker name
    const slug = await generateUniqueSlug(insertBaker.name, (s: string) => this.checkSlugExists(s));
    
    const [baker] = await db
      .insert(bakers)
      .values({
        name: insertBaker.name,
        slug,
        email: insertBaker.email,
        password: insertBaker.password,
        address: insertBaker.address,
        phone: insertBaker.phone || null,
        isActive: insertBaker.isActive !== undefined ? insertBaker.isActive : true,
        subscriptionPlan: insertBaker.subscriptionPlan || 'starter',
        emailVerified: insertBaker.emailVerified || false,
        verificationToken: insertBaker.verificationToken || null,
        verificationTokenExpiry: insertBaker.verificationTokenExpiry || null,
      })
      .returning();
    return baker;
  }

  async updateBaker(bakerId: string, updates: {
    emailVerified?: boolean;
    verificationToken?: string | null;
    verificationTokenExpiry?: Date | null;
    paymentLinks?: any;
    availability?: any;
    stripeCustomerId?: string;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    description?: string;
    specialties?: string[];
    cakeTypes?: string[];
    services?: string[];
    pricing?: any;
    name?: string;
    phone?: string;
    address?: string;
    socialMedia?: any;
  }) {
    const validUpdates: any = {};
    
    // Only include whitelisted fields to prevent overwriting sensitive data
    if (updates.emailVerified !== undefined) validUpdates.emailVerified = updates.emailVerified;
    if (updates.verificationToken !== undefined) validUpdates.verificationToken = updates.verificationToken;
    if (updates.verificationTokenExpiry !== undefined) validUpdates.verificationTokenExpiry = updates.verificationTokenExpiry;
    if (updates.paymentLinks !== undefined) validUpdates.paymentLinks = updates.paymentLinks;
    if (updates.availability !== undefined) validUpdates.availability = updates.availability;
    if (updates.stripeCustomerId !== undefined) validUpdates.stripeCustomerId = updates.stripeCustomerId;
    if (updates.subscriptionPlan !== undefined) validUpdates.subscriptionPlan = updates.subscriptionPlan;
    if (updates.subscriptionStatus !== undefined) validUpdates.subscriptionStatus = updates.subscriptionStatus;
    if (updates.description !== undefined) validUpdates.description = updates.description;
    if (updates.specialties !== undefined) validUpdates.specialties = updates.specialties;
    if (updates.cakeTypes !== undefined) validUpdates.cakeTypes = updates.cakeTypes;
    if (updates.services !== undefined) validUpdates.services = updates.services;
    if (updates.pricing !== undefined) validUpdates.pricing = updates.pricing;
    if (updates.name !== undefined) validUpdates.name = updates.name;
    if (updates.phone !== undefined) validUpdates.phone = updates.phone;
    if (updates.address !== undefined) validUpdates.address = updates.address;
    if (updates.socialMedia !== undefined) {
      validUpdates.socialMedia = updates.socialMedia;
    }
    await db
      .update(bakers)
      .set(validUpdates)
      .where(eq(bakers.id, bakerId));
  }

  async getBakerByEmail(email: string) {
    const [baker] = await db
      .select()
      .from(bakers)
      .where(eq(bakers.email, email))
      .limit(1);
    return baker;
  }

  async getBakerBySlug(slug: string) {
    const [baker] = await db
      .select()
      .from(bakers)
      .where(eq(bakers.slug, slug))
      .limit(1);
    return baker;
  }

  async getBakerById(id: string) {
    const [baker] = await db
      .select()
      .from(bakers)
      .where(eq(bakers.id, id))
      .limit(1);
    return baker;
  }

  private async checkSlugExists(slug: string): Promise<boolean> {
    const [existing] = await db
      .select({ id: bakers.id })
      .from(bakers)
      .where(eq(bakers.slug, slug))
      .limit(1);
    return !!existing;
  }

  // Helper methods for authentication
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // Email verification helper methods
  isVerificationTokenExpired(baker: any): boolean {
    if (!baker.verificationTokenExpiry) {
      return false; // No expiry set, consider valid for backward compatibility
    }
    return new Date() > new Date(baker.verificationTokenExpiry);
  }

  createVerificationTokenExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24); // 24 hours from now
    return expiry;
  }

  // Password reset methods for users (super admin)
  async createResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    // Invalidate any existing reset tokens by updating this user's reset fields
    await db
      .update(users)
      .set({
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: expiresAt,
        resetTokenUsedAt: null, // Clear any previous usage
      })
      .where(eq(users.id, userId));
  }

  async findUserByResetTokenHash(tokenHash: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetTokenHash, tokenHash))
      .limit(1);
    return user;
  }

  async consumeResetToken(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        resetTokenUsedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  isResetTokenValid(user: any): boolean {
    // Check if token exists
    if (!user.resetTokenHash) {
      return false;
    }

    // Check if token is expired
    if (!user.resetTokenExpiresAt || new Date() > new Date(user.resetTokenExpiresAt)) {
      return false;
    }

    // Check if token was already used
    if (user.resetTokenUsedAt) {
      return false;
    }

    return true;
  }

  createResetTokenExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15); // 15 minutes from now for security
    return expiry;
  }

  async getUserByEmailOrUsername(identifier: string) {
    // Try by email first, then by username
    const [userByEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, identifier))
      .limit(1);

    if (userByEmail) {
      return userByEmail;
    }

    const [userByUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, identifier))
      .limit(1);

    return userByUsername;
  }

  // Baker password reset methods (similar to user methods but for bakers)
  async createBakerResetToken(bakerId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await db
      .update(bakers)
      .set({
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: expiresAt,
        resetTokenUsedAt: null,
      })
      .where(eq(bakers.id, bakerId));
  }

  async findBakerByResetTokenHash(tokenHash: string) {
    const [baker] = await db
      .select()
      .from(bakers)
      .where(eq(bakers.resetTokenHash, tokenHash))
      .limit(1);
    return baker;
  }

  async consumeBakerResetToken(bakerId: string): Promise<void> {
    await db
      .update(bakers)
      .set({
        resetTokenUsedAt: new Date(),
      })
      .where(eq(bakers.id, bakerId));
  }

  async updateBakerPassword(bakerId: string, hashedPassword: string): Promise<void> {
    await db
      .update(bakers)
      .set({ password: hashedPassword })
      .where(eq(bakers.id, bakerId));
  }


  // Booking methods for simplified booking system
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async getBookingsByBakerId(bakerId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.bakerId, bakerId));
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Quote template methods
  async createQuoteTemplate(template: InsertQuoteTemplate): Promise<QuoteTemplate> {
    const [result] = await db
      .insert(quoteTemplates)
      .values({ ...template, id: template.id || randomUUID() })
      .returning();
    return result;
  }

  async getQuoteTemplate(id: string): Promise<QuoteTemplate | undefined> {
    const [template] = await db
      .select()
      .from(quoteTemplates)
      .where(eq(quoteTemplates.id, id));
    return template || undefined;
  }

  async getQuoteTemplates(bakerId: string): Promise<QuoteTemplate[]> {
    return await db
      .select()
      .from(quoteTemplates)
      .where(eq(quoteTemplates.bakerId, bakerId));
  }

  async getQuoteTemplatesByBaker(bakerId: string): Promise<QuoteTemplate[]> {
    return await db
      .select()
      .from(quoteTemplates)
      .where(eq(quoteTemplates.bakerId, bakerId));
  }

  async updateQuoteTemplate(id: string, updates: Partial<InsertQuoteTemplate>): Promise<QuoteTemplate> {
    const [template] = await db
      .update(quoteTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(quoteTemplates.id, id))
      .returning();
    if (!template) throw new Error('Quote template not found');
    return template;
  }

  async deleteQuoteTemplate(id: string): Promise<boolean> {
    try {
      console.log(`Attempting to delete quote template with id: ${id}`);
      const result = await db
        .delete(quoteTemplates)
        .where(eq(quoteTemplates.id, id));
      console.log(`Delete result:`, result);
      const success = result.rowCount ? result.rowCount > 0 : false;
      console.log(`Delete success: ${success}, rowCount: ${result.rowCount}`);
      return success;
    } catch (error) {
      console.error(`Error deleting quote template ${id}:`, error);
      return false;
    }
  }
}

export const databaseStorage = new DatabaseStorage();