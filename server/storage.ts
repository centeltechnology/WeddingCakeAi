import { type User, type InsertUser, type Profile, type InsertProfile, type Estimate, type InsertEstimate, type Baker, type InsertBaker } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createProfile(profile: InsertProfile): Promise<Profile>;
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile>;
  
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  getEstimate(id: string): Promise<Estimate | undefined>;
  getEstimatesByProfile(profileId: string): Promise<Estimate[]>;
  updateEstimate(id: string, updates: Partial<InsertEstimate>): Promise<Estimate>;
  deleteEstimate(id: string): Promise<boolean>;
  
  getBakers(): Promise<Baker[]>;
  getBaker(id: string): Promise<Baker | undefined>;
  createBaker(baker: InsertBaker): Promise<Baker>;
  searchBakers(location?: string, radius?: number, specialty?: string): Promise<Baker[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private profiles: Map<string, Profile>;
  private estimates: Map<string, Estimate>;
  private bakers: Map<string, Baker>;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.estimates = new Map();
    this.bakers = new Map();
    
    // Initialize with sample baker data
    this.initializeBakers();
  }

  private initializeBakers() {
    const sampleBakers: InsertBaker[] = [
      {
        name: "Sweet Dreams Bakery",
        email: "contact@sweetdreamsbakery.com",
        phone: "(555) 123-4567",
        address: "123 Main St, Downtown",
        latitude: "40.7128",
        longitude: "-74.0060",
        rating: "4.9",
        priceRange: "$8-15/serving",
        specialties: ["Wedding Specialist", "Custom Designs", "Gluten-Free"],
        description: "Specializing in elegant wedding cakes with custom designs. Over 15 years of experience creating memorable centerpieces for your special day.",
        portfolio: [],
        isActive: true,
      },
      {
        name: "Artisan Cake Studio",
        email: "info@artisancakestudio.com",
        phone: "(555) 234-5678",
        address: "456 Oak Ave, Midtown",
        latitude: "40.7589",
        longitude: "-73.9851",
        rating: "4.6",
        priceRange: "$12-20/serving",
        specialties: ["Artistic Designs", "Fondant Expert", "Vegan Options"],
        description: "Award-winning cake designer known for intricate sugar work and artistic fondant creations. Perfect for couples seeking unique, show-stopping designs.",
        portfolio: [],
        isActive: true,
      },
      {
        name: "Bella's Bespoke Cakes",
        email: "bella@bellasbespokecakes.com",
        phone: "(555) 345-6789",
        address: "789 River Rd, Riverside",
        latitude: "40.6782",
        longitude: "-74.0442",
        rating: "4.8",
        priceRange: "$6-12/serving",
        specialties: ["Rustic Designs", "Organic Ingredients"],
        description: "Family-owned bakery specializing in rustic, romantic designs using organic, locally-sourced ingredients. Perfect for outdoor and vintage-themed weddings.",
        portfolio: [],
        isActive: true,
      },
    ];

    sampleBakers.forEach(baker => {
      this.createBaker(baker);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const profile: Profile = { 
      ...insertProfile, 
      id, 
      createdAt: new Date(),
      userId: insertProfile.userId || null,
      address: insertProfile.address || null,
      phone: insertProfile.phone || null,
      partnerName: insertProfile.partnerName || null,
      weddingDate: insertProfile.weddingDate || null,
      venue: insertProfile.venue || null,
      venueAddress: insertProfile.venueAddress || null,
      budget: insertProfile.budget || null,
      notes: insertProfile.notes || null,
      restrictions: insertProfile.restrictions as { glutenFree?: boolean; vegan?: boolean; nutFree?: boolean; } || {}
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(p => p.userId === userId);
  }

  async updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile> {
    const existing = this.profiles.get(id);
    if (!existing) {
      throw new Error("Profile not found");
    }
    const updated = { 
      ...existing, 
      ...updates,
      restrictions: updates.restrictions as { glutenFree?: boolean; vegan?: boolean; nutFree?: boolean; } || existing.restrictions
    };
    this.profiles.set(id, updated);
    return updated;
  }

  async createEstimate(insertEstimate: InsertEstimate): Promise<Estimate> {
    const id = randomUUID();
    const estimate: Estimate = { 
      ...insertEstimate, 
      id, 
      createdAt: new Date(),
      profileId: insertEstimate.profileId || null,
      eventDate: insertEstimate.eventDate || null,
      guestCount: insertEstimate.guestCount || null,
      tiers: insertEstimate.tiers || null,
      baseSize: insertEstimate.baseSize || null,
      shape: insertEstimate.shape || null,
      cakeFlavor: insertEstimate.cakeFlavor || null,
      filling: insertEstimate.filling || null,
      delivery: insertEstimate.delivery || null,
      distance: insertEstimate.distance || null,
      specialRequests: insertEstimate.specialRequests || null,
      subtotal: insertEstimate.subtotal || null,
      tax: insertEstimate.tax || null,
      total: insertEstimate.total || null,
      decorations: insertEstimate.decorations as { fondant?: boolean; flowers?: boolean; goldAccents?: boolean; customTopper?: boolean; } || {}
    };
    this.estimates.set(id, estimate);
    return estimate;
  }

  async getEstimate(id: string): Promise<Estimate | undefined> {
    return this.estimates.get(id);
  }

  async getEstimatesByProfile(profileId: string): Promise<Estimate[]> {
    return Array.from(this.estimates.values()).filter(e => e.profileId === profileId);
  }

  async updateEstimate(id: string, updates: Partial<InsertEstimate>): Promise<Estimate> {
    const existing = this.estimates.get(id);
    if (!existing) {
      throw new Error("Estimate not found");
    }
    const updated = { 
      ...existing, 
      ...updates,
      decorations: updates.decorations as { fondant?: boolean; flowers?: boolean; goldAccents?: boolean; customTopper?: boolean; } || existing.decorations
    };
    this.estimates.set(id, updated);
    return updated;
  }

  async deleteEstimate(id: string): Promise<boolean> {
    return this.estimates.delete(id);
  }

  async getBakers(): Promise<Baker[]> {
    return Array.from(this.bakers.values()).filter(b => b.isActive);
  }

  async getBaker(id: string): Promise<Baker | undefined> {
    return this.bakers.get(id);
  }

  async createBaker(insertBaker: InsertBaker): Promise<Baker> {
    const id = randomUUID();
    const baker: Baker = { 
      ...insertBaker, 
      id, 
      createdAt: new Date(),
      phone: insertBaker.phone || null,
      address: insertBaker.address || null,
      latitude: insertBaker.latitude || null,
      longitude: insertBaker.longitude || null,
      rating: insertBaker.rating || null,
      priceRange: insertBaker.priceRange || null,
      description: insertBaker.description || null,
      isActive: insertBaker.isActive !== undefined ? insertBaker.isActive : true,
      specialties: insertBaker.specialties || [],
      portfolio: insertBaker.portfolio || []
    };
    this.bakers.set(id, baker);
    return baker;
  }

  async searchBakers(location?: string, radius?: number, specialty?: string): Promise<Baker[]> {
    let bakers = Array.from(this.bakers.values()).filter(b => b.isActive);
    
    if (specialty && specialty !== 'all') {
      bakers = bakers.filter(b => 
        b.specialties?.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
      );
    }
    
    // For simplicity, return all bakers for location/radius searches
    // In a real implementation, this would calculate distance based on coordinates
    return bakers;
  }
}

export const storage = new MemStorage();
