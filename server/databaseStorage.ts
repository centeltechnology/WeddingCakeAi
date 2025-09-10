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

  async updateUserLastLogin(userId: string) {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
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
  }) {
    const validUpdates: any = {};
    
    // Only include whitelisted fields to prevent overwriting sensitive data
    if (updates.emailVerified !== undefined) validUpdates.emailVerified = updates.emailVerified;
    if (updates.verificationToken !== undefined) validUpdates.verificationToken = updates.verificationToken;
    if (updates.verificationTokenExpiry !== undefined) validUpdates.verificationTokenExpiry = updates.verificationTokenExpiry;
    if (updates.paymentLinks !== undefined) validUpdates.paymentLinks = updates.paymentLinks;
    if (updates.availability !== undefined) validUpdates.availability = updates.availability;

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