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
  async createBaker(insertBaker: {
    name: string;
    email: string;
    password: string;
    address: string;
    phone?: string | null;
    isActive?: boolean;
    subscriptionPlan?: string;
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
      })
      .returning();
    return baker;
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

  async updateBaker(id: string, updates: Partial<any>) {
    // Define whitelisted fields that can be safely updated
    const whitelistedFields = [
      'name', 'phone', 'address', 'latitude', 'longitude', 'description', 
      'specialties', 'portfolio', 'subdomain', 'customDomain', 'paymentLinks',
      'availability', 'socialMedia', 'priceRange', 'businessName'
    ];
    
    // Filter updates to only include whitelisted fields
    const safeUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (whitelistedFields.includes(key)) {
        safeUpdates[key] = value;
      } else {
        console.warn(`Attempted to update restricted field: ${key}`);
      }
    }
    
    // Only proceed if there are safe updates
    if (Object.keys(safeUpdates).length === 0) {
      throw new Error('No valid fields provided for update');
    }
    
    const [updatedBaker] = await db
      .update(bakers)
      .set(safeUpdates)
      .where(eq(bakers.id, id))
      .returning();
    return updatedBaker;
  }

  async updateUserLastLogin(id: string) {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
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