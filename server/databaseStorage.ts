import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, bakers, bookings, type Booking, type InsertBooking } from "@shared/schema";
import bcrypt from "bcryptjs";
import { generateUniqueSlug } from "./utils";

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
}

export const databaseStorage = new DatabaseStorage();