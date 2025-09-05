import { 
  type User, type InsertUser, type Profile, type InsertProfile, type Estimate, type InsertEstimate, 
  type Baker, type InsertBaker, type Lead, type InsertLead, type Message, type InsertMessage,
  type Review, type InsertReview, type Transaction, type InsertTransaction, 
  type Availability, type InsertAvailability, type Analytics, type InsertAnalytics, 
  type BakerProfile, type InsertBakerProfile 
} from "@shared/schema";
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
  updateBaker(id: string, updates: Partial<InsertBaker>): Promise<Baker>;
  searchBakers(location?: string, radius?: number, specialty?: string): Promise<Baker[]>;
  
  createLead(lead: InsertLead): Promise<Lead>;
  getLead(id: string): Promise<Lead | undefined>;
  getLeadsByBaker(bakerId: string): Promise<Lead[]>;
  updateLead(id: string, updates: Partial<InsertLead>): Promise<Lead>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByLead(leadId: string): Promise<Message[]>;
  updateMessage(id: string, content: string): Promise<Message | undefined>;
  deleteMessage(id: string): Promise<boolean>;

  // Review methods
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByBakerId(bakerId: string): Promise<Review[]>;
  getReviewById(id: string): Promise<Review | undefined>;
  updateReviewVerification(id: string, isVerified: boolean): Promise<Review | undefined>;

  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByBakerId(bakerId: string): Promise<Transaction[]>;
  updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined>;
  getTransactionById(id: string): Promise<Transaction | undefined>;

  // Availability methods
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  getAvailabilityByBakerId(bakerId: string): Promise<Availability[]>;
  updateAvailability(id: string, updates: Partial<InsertAvailability>): Promise<Availability | undefined>;
  deleteAvailability(id: string): Promise<boolean>;

  // Analytics methods
  trackAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalyticsByBakerId(bakerId: string, metric?: string): Promise<Analytics[]>;
  getAnalyticsSummary(bakerId: string, startDate: string, endDate: string): Promise<{ [key: string]: number }>;

  // Baker profile methods
  createBakerProfile(profile: InsertBakerProfile): Promise<BakerProfile>;
  getBakerProfileByBakerId(bakerId: string): Promise<BakerProfile | undefined>;
  updateBakerProfile(id: string, updates: Partial<InsertBakerProfile>): Promise<BakerProfile | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private profiles: Map<string, Profile>;
  private estimates: Map<string, Estimate>;
  private bakers: Map<string, Baker>;
  private leads: Map<string, Lead>;
  private messages: Map<string, Message>;
  private reviews: Map<string, Review>;
  private transactions: Map<string, Transaction>;
  private availability: Map<string, Availability>;
  private analytics: Map<string, Analytics>;
  private bakerProfiles: Map<string, BakerProfile>;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.estimates = new Map();
    this.bakers = new Map();
    this.leads = new Map();
    this.messages = new Map();
    this.reviews = new Map();
    this.transactions = new Map();
    this.availability = new Map();
    this.analytics = new Map();
    this.bakerProfiles = new Map();
    
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
      portfolio: insertBaker.portfolio || [],
      subscriptionPlan: insertBaker.subscriptionPlan || null
    };
    this.bakers.set(id, baker);
    return baker;
  }

  async updateBaker(id: string, updates: Partial<InsertBaker>): Promise<Baker> {
    const baker = this.bakers.get(id);
    if (!baker) {
      throw new Error(`Baker with id ${id} not found`);
    }
    
    const updatedBaker: Baker = { ...baker, ...updates };
    this.bakers.set(id, updatedBaker);
    return updatedBaker;
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

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const lead: Lead = { 
      ...insertLead, 
      id, 
      createdAt: new Date(),
      bakerId: insertLead.bakerId || null,
      profileId: insertLead.profileId || null,
      customerPhone: insertLead.customerPhone || null,
      weddingDate: insertLead.weddingDate || null,
      guestCount: insertLead.guestCount || null,
      budget: insertLead.budget || null,
      message: insertLead.message || null,
      estimateId: insertLead.estimateId || null,
      status: insertLead.status || null,
    };
    this.leads.set(id, lead);
    return lead;
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async getLeadsByBaker(bakerId: string): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(lead => lead.bakerId === bakerId);
  }

  async updateLead(id: string, updates: Partial<InsertLead>): Promise<Lead> {
    const lead = this.leads.get(id);
    if (!lead) {
      throw new Error(`Lead with id ${id} not found`);
    }
    
    const updatedLead: Lead = { ...lead, ...updates };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      leadId: insertMessage.leadId || null,
      senderId: insertMessage.senderId || null,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByLead(leadId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.leadId === leadId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async updateMessage(id: string, content: string): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updated = { ...message, content };
    this.messages.set(id, updated);
    return updated;
  }

  async deleteMessage(id: string): Promise<boolean> {
    return this.messages.delete(id);
  }

  // Review methods
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      customerId: insertReview.customerId || null,
      reviewText: insertReview.reviewText || null,
      weddingDate: insertReview.weddingDate || null,
      cakeStyle: insertReview.cakeStyle || null,
      isVerified: insertReview.isVerified || false,
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReviewsByBakerId(bakerId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.bakerId === bakerId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getReviewById(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async updateReviewVerification(id: string, isVerified: boolean): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updated = { ...review, isVerified, updatedAt: new Date() };
    this.reviews.set(id, updated);
    return updated;
  }

  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      customerId: insertTransaction.customerId || null,
      leadId: insertTransaction.leadId || null,
      currency: insertTransaction.currency || "usd",
      stripePaymentIntentId: insertTransaction.stripePaymentIntentId || null,
      description: insertTransaction.description || null,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransactionsByBakerId(bakerId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.bakerId === bakerId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updated = { ...transaction, status, updatedAt: new Date() };
    this.transactions.set(id, updated);
    return updated;
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  // Availability methods
  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const id = randomUUID();
    const availability: Availability = {
      ...insertAvailability,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isBlocked: insertAvailability.isBlocked || false,
      blockReason: insertAvailability.blockReason || null,
    };
    this.availability.set(id, availability);
    return availability;
  }

  async getAvailabilityByBakerId(bakerId: string): Promise<Availability[]> {
    return Array.from(this.availability.values())
      .filter(avail => avail.bakerId === bakerId)
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
      });
  }

  async updateAvailability(id: string, updates: Partial<InsertAvailability>): Promise<Availability | undefined> {
    const availability = this.availability.get(id);
    if (!availability) return undefined;
    
    const updated = { ...availability, ...updates, updatedAt: new Date() };
    this.availability.set(id, updated);
    return updated;
  }

  async deleteAvailability(id: string): Promise<boolean> {
    return this.availability.delete(id);
  }

  // Analytics methods
  async trackAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = {
      ...insertAnalytics,
      id,
      createdAt: new Date(),
      value: insertAnalytics.value || 1,
      metadata: insertAnalytics.metadata || null,
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async getAnalyticsByBakerId(bakerId: string, metric?: string): Promise<Analytics[]> {
    let results = Array.from(this.analytics.values())
      .filter(analytic => analytic.bakerId === bakerId);
    
    if (metric) {
      results = results.filter(analytic => analytic.metric === metric);
    }
    
    return results.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getAnalyticsSummary(bakerId: string, startDate: string, endDate: string): Promise<{ [key: string]: number }> {
    const analytics = Array.from(this.analytics.values())
      .filter(analytic => {
        if (analytic.bakerId !== bakerId || !analytic.date) return false;
        const analyticsDate = new Date(analytic.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return analyticsDate >= start && analyticsDate <= end;
      });

    const summary: { [key: string]: number } = {};
    
    analytics.forEach(analytic => {
      if (!summary[analytic.metric]) {
        summary[analytic.metric] = 0;
      }
      summary[analytic.metric] += analytic.value || 1;
    });
    
    return summary;
  }

  // Baker profile methods
  async createBakerProfile(insertProfile: InsertBakerProfile): Promise<BakerProfile> {
    const id = randomUUID();
    const profile: BakerProfile = {
      ...insertProfile,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      businessHours: insertProfile.businessHours || null,
      socialMedia: insertProfile.socialMedia || null,
      certifications: insertProfile.certifications || null,
      yearsExperience: insertProfile.yearsExperience || null,
      teamSize: insertProfile.teamSize || null,
      leadTime: insertProfile.leadTime || null,
      consultationFee: insertProfile.consultationFee || null,
      minimumOrder: insertProfile.minimumOrder || null,
      deliveryRadius: insertProfile.deliveryRadius || null,
      dietaryOptions: insertProfile.dietaryOptions || null,
    };
    this.bakerProfiles.set(id, profile);
    return profile;
  }

  async getBakerProfileByBakerId(bakerId: string): Promise<BakerProfile | undefined> {
    return Array.from(this.bakerProfiles.values()).find(profile => profile.bakerId === bakerId);
  }

  async updateBakerProfile(id: string, updates: Partial<InsertBakerProfile>): Promise<BakerProfile | undefined> {
    const profile = this.bakerProfiles.get(id);
    if (!profile) return undefined;
    
    const updated = { ...profile, ...updates, updatedAt: new Date() };
    this.bakerProfiles.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
