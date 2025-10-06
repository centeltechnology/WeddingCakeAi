import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { generateUniqueSlug } from "./utils";

// Simple types for our clean implementation
export interface User {
  id: string;
  username: string;
  email: string | null;
  password: string;
  role: 'super_admin' | 'baker';
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface Baker {
  id: string;
  name: string;
  slug: string;
  email: string;
  password: string;
  address: string;
  phone: string | null;
  isActive: boolean;
  subscriptionPlan: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertUser {
  username: string;
  email?: string | null;
  password: string;
  role: 'super_admin' | 'baker';
  isActive?: boolean;
}

export interface InsertBaker {
  name: string;
  email: string;
  password: string;
  address: string;
  phone?: string | null;
  isActive?: boolean;
  subscriptionPlan?: string;
}

// Clean, simple storage implementation
export class CleanStorage {
  private users = new Map<string, User>();
  private bakers = new Map<string, Baker>();

  // User methods
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      email: insertUser.email || null,
      password: insertUser.password,
      role: insertUser.role,
      isActive: insertUser.isActive !== undefined ? insertUser.isActive : true,
      createdAt: new Date(),
      lastLoginAt: null,
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUsersWithRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.lastLoginAt = new Date();
      this.users.set(userId, user);
    }
  }

  // Baker methods
  async createBaker(insertBaker: InsertBaker): Promise<Baker> {
    const id = randomUUID();
    
    // Generate unique slug from baker name
    const slug = await generateUniqueSlug(insertBaker.name, (s: string) => this.checkSlugExists(s));
    
    const baker: Baker = {
      id,
      name: insertBaker.name,
      slug,
      email: insertBaker.email,
      password: insertBaker.password,
      address: insertBaker.address,
      phone: insertBaker.phone || null,
      isActive: insertBaker.isActive !== undefined ? insertBaker.isActive : true,
      subscriptionPlan: insertBaker.subscriptionPlan || 'starter',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bakers.set(id, baker);
    return baker;
  }

  async getBakerByEmail(email: string): Promise<Baker | undefined> {
    return Array.from(this.bakers.values()).find(baker => baker.email === email);
  }

  async getBakerBySlug(slug: string): Promise<Baker | undefined> {
    return Array.from(this.bakers.values()).find(baker => baker.slug === slug);
  }

  async getBakerById(id: string): Promise<Baker | undefined> {
    return this.bakers.get(id);
  }

  private async checkSlugExists(slug: string): Promise<boolean> {
    return Array.from(this.bakers.values()).some(baker => baker.slug === slug);
  }

  // Helper method for authentication
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

export const cleanStorage = new CleanStorage();