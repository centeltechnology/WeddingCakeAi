import { 
  type User, type InsertUser, type Profile, type InsertProfile, type Estimate, type InsertEstimate, 
  type Baker, type InsertBaker, type Lead, type InsertLead, type Message, type InsertMessage,
  type Review, type InsertReview, type Transaction, type InsertTransaction, 
  type Availability, type InsertAvailability, type Analytics, type InsertAnalytics, 
  type BakerProfile, type InsertBakerProfile,
  type Tenant, type InsertTenant, type TenantConfiguration, type InsertTenantConfiguration,
  type TenantBakerNetwork, type InsertTenantBakerNetwork, type TenantRevenueSharing, type InsertTenantRevenueSharing,
  type Customer, type InsertCustomer, type CustomerNote, type InsertCustomerNote,
  type QuoteTemplate, type InsertQuoteTemplate, type Quote, type InsertQuote, type QuoteItem, type InsertQuoteItem,
  type ContractTemplate, type InsertContractTemplate, type Contract, type InsertContract, type ContractSignature, type InsertContractSignature,
  type PaymentPlan, type InsertPaymentPlan, type PaymentSchedule, type InsertPaymentSchedule, type Invoice, type InsertInvoice,
  users, profiles, estimates, bakers, leads, messages, reviews, transactions, availability, analytics, bakerProfiles,
  tenants, tenantConfigurations, tenantBakerNetworks, tenantRevenueSharing,
  customers, customerNotes, quoteTemplates, quotes, quoteItems, contractTemplates, contracts, contractSignatures,
  paymentPlans, paymentSchedule, invoices
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, or, like, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  
  createProfile(profile: InsertProfile): Promise<Profile>;
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  getProfilesByTenant(tenantId: string): Promise<Profile[]>;
  updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile>;
  
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  getEstimate(id: string): Promise<Estimate | undefined>;
  getEstimatesByProfile(profileId: string): Promise<Estimate[]>;
  getEstimatesByTenant(tenantId: string): Promise<Estimate[]>;
  updateEstimate(id: string, updates: Partial<InsertEstimate>): Promise<Estimate>;
  deleteEstimate(id: string): Promise<boolean>;
  
  getBakers(): Promise<Baker[]>;
  getBaker(id: string): Promise<Baker | undefined>;
  createBaker(baker: InsertBaker): Promise<Baker>;
  updateBaker(id: string, updates: Partial<InsertBaker>): Promise<Baker>;
  searchBakers(location?: string, radius?: number, specialty?: string, tenantId?: string): Promise<Baker[]>;
  
  createLead(lead: InsertLead): Promise<Lead>;
  getLead(id: string): Promise<Lead | undefined>;
  getLeadsByBaker(bakerId: string): Promise<Lead[]>;
  getLeadsByTenant(tenantId: string): Promise<Lead[]>;
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

  // Multi-tenancy methods
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenants(): Promise<Tenant[]>;
  getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined>;
  getTenantByDomain(domain: string): Promise<Tenant | undefined>;
  updateTenant(id: string, updates: Partial<InsertTenant>): Promise<Tenant>;
  
  createTenantConfiguration(config: InsertTenantConfiguration): Promise<TenantConfiguration>;
  getTenantConfiguration(tenantId: string): Promise<TenantConfiguration | undefined>;
  updateTenantConfiguration(tenantId: string, updates: Partial<InsertTenantConfiguration>): Promise<TenantConfiguration>;
  
  createTenantBakerNetwork(network: InsertTenantBakerNetwork): Promise<TenantBakerNetwork>;
  getTenantBakerNetworks(tenantId: string): Promise<TenantBakerNetwork[]>;
  updateTenantBakerNetwork(id: string, updates: Partial<InsertTenantBakerNetwork>): Promise<TenantBakerNetwork>;
  
  createTenantRevenueSharing(sharing: InsertTenantRevenueSharing): Promise<TenantRevenueSharing>;
  getTenantRevenueSharing(tenantId: string): Promise<TenantRevenueSharing[]>;
  updateTenantRevenueSharing(id: string, updates: Partial<InsertTenantRevenueSharing>): Promise<TenantRevenueSharing>;

  // CRM methods
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomersByBaker(bakerId: string): Promise<Customer[]>;
  getCustomersByTenant(tenantId: string): Promise<Customer[]>;
  updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer>;
  searchCustomers(bakerId: string, query: string): Promise<Customer[]>;
  
  createCustomerNote(note: InsertCustomerNote): Promise<CustomerNote>;
  getCustomerNotes(customerId: string): Promise<CustomerNote[]>;
  
  // Quote methods
  createQuoteTemplate(template: InsertQuoteTemplate): Promise<QuoteTemplate>;
  getQuoteTemplates(bakerId: string): Promise<QuoteTemplate[]>;
  getQuoteTemplate(id: string): Promise<QuoteTemplate | undefined>;
  updateQuoteTemplate(id: string, updates: Partial<InsertQuoteTemplate>): Promise<QuoteTemplate>;
  
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuote(id: string): Promise<Quote | undefined>;
  getQuotesByBaker(bakerId: string): Promise<Quote[]>;
  getQuotesByCustomer(customerId: string): Promise<Quote[]>;
  updateQuote(id: string, updates: Partial<InsertQuote>): Promise<Quote>;
  
  createQuoteItem(item: InsertQuoteItem): Promise<QuoteItem>;
  getQuoteItems(quoteId: string): Promise<QuoteItem[]>;
  updateQuoteItem(id: string, updates: Partial<InsertQuoteItem>): Promise<QuoteItem>;
  deleteQuoteItem(id: string): Promise<boolean>;
  
  // Contract methods
  createContractTemplate(template: InsertContractTemplate): Promise<ContractTemplate>;
  getContractTemplates(bakerId: string): Promise<ContractTemplate[]>;
  getContractTemplate(id: string): Promise<ContractTemplate | undefined>;
  
  createContract(contract: InsertContract): Promise<Contract>;
  getContract(id: string): Promise<Contract | undefined>;
  getContractsByBaker(bakerId: string): Promise<Contract[]>;
  getContractsByCustomer(customerId: string): Promise<Contract[]>;
  updateContract(id: string, updates: Partial<InsertContract>): Promise<Contract>;
  
  createContractSignature(signature: InsertContractSignature): Promise<ContractSignature>;
  getContractSignatures(contractId: string): Promise<ContractSignature[]>;
  
  // Payment methods
  createPaymentPlan(plan: InsertPaymentPlan): Promise<PaymentPlan>;
  getPaymentPlan(id: string): Promise<PaymentPlan | undefined>;
  getPaymentPlansByBaker(bakerId: string): Promise<PaymentPlan[]>;
  updatePaymentPlan(id: string, updates: Partial<InsertPaymentPlan>): Promise<PaymentPlan>;
  
  createPaymentSchedule(schedule: InsertPaymentSchedule): Promise<PaymentSchedule>;
  getPaymentSchedule(planId: string): Promise<PaymentSchedule[]>;
  updatePaymentSchedule(id: string, updates: Partial<InsertPaymentSchedule>): Promise<PaymentSchedule>;
  
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoicesByBaker(bakerId: string): Promise<Invoice[]>;
  getInvoicesByCustomer(customerId: string): Promise<Invoice[]>;
  updateInvoice(id: string, updates: Partial<InsertInvoice>): Promise<Invoice>;
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
  
  // Multi-tenancy storage
  private tenants: Map<string, Tenant>;
  private tenantConfigurations: Map<string, TenantConfiguration>;
  private tenantBakerNetworks: Map<string, TenantBakerNetwork>;
  private tenantRevenueSharing: Map<string, TenantRevenueSharing>;
  
  // CRM storage
  private customers: Map<string, Customer>;
  private customerNotes: Map<string, CustomerNote>;
  
  // Quote storage
  private quoteTemplates: Map<string, QuoteTemplate>;
  private quotes: Map<string, Quote>;
  private quoteItems: Map<string, QuoteItem>;
  
  // Contract storage
  private contractTemplates: Map<string, ContractTemplate>;
  private contracts: Map<string, Contract>;
  private contractSignatures: Map<string, ContractSignature>;
  
  // Payment storage
  private paymentPlans: Map<string, PaymentPlan>;
  private paymentSchedule: Map<string, PaymentSchedule>;
  private invoices: Map<string, Invoice>;

  private initializeSuperAdminUser() {
    // Note: Super admin user is now stored in database
    // This method is kept for potential future MemStorage usage
  }

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
    
    // Multi-tenancy storage
    this.tenants = new Map();
    this.tenantConfigurations = new Map();
    this.tenantBakerNetworks = new Map();
    this.tenantRevenueSharing = new Map();
    
    // CRM storage
    this.customers = new Map();
    this.customerNotes = new Map();
    
    // Quote storage
    this.quoteTemplates = new Map();
    this.quotes = new Map();
    this.quoteItems = new Map();
    
    // Contract storage
    this.contractTemplates = new Map();
    this.contracts = new Map();
    this.contractSignatures = new Map();
    
    // Payment storage
    this.paymentPlans = new Map();
    this.paymentSchedule = new Map();
    this.invoices = new Map();
    
    // Initialize with sample data
    this.initializeSuperAdminUser();
    this.initializeBakers();
    this.initializeTenants();
    this.initializeSampleData();
  }

  private initializeTenants() {
    const sampleTenants: InsertTenant[] = [
      {
        name: "Grand Ballroom Wedding Venue",
        subdomain: "grandballroom",
        contactEmail: "events@grandballroom.com",
        contactPhone: "(555) 987-6543",
        address: "100 Luxury Lane, Uptown",
        subscriptionPlan: "premium"
      },
      {
        name: "Rustic Barn Weddings",
        subdomain: "rusticbarn", 
        contactEmail: "bookings@rusticbarn.com",
        contactPhone: "(555) 456-7890",
        address: "500 Country Road, Countryside",
        subscriptionPlan: "basic"
      }
    ];

    sampleTenants.forEach(tenant => {
      this.createTenant(tenant);
    });
  }

  private initializeBakers() {
    // Create the demo baker with specific ID "baker-1" for the admin dashboard
    const demoBaker: Baker = {
      id: "baker-1",
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
      createdAt: new Date(),
      subscriptionPlan: "premium"
    };
    this.bakers.set("baker-1", demoBaker);

    // Create other sample bakers with random IDs
    const sampleBakers: InsertBaker[] = [
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

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error("User not found");
    }
    const updated = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const profile: Profile = { 
      ...insertProfile, 
      id, 
      createdAt: new Date(),
      tenantId: insertProfile.tenantId || null,
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

  async getProfilesByTenant(tenantId: string): Promise<Profile[]> {
    return Array.from(this.profiles.values()).filter(p => p.tenantId === tenantId);
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
      tenantId: insertEstimate.tenantId || null,
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

  async getEstimatesByTenant(tenantId: string): Promise<Estimate[]> {
    return Array.from(this.estimates.values()).filter(e => e.tenantId === tenantId);
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

  async searchBakers(location?: string, radius?: number, specialty?: string, tenantId?: string): Promise<Baker[]> {
    let bakers = Array.from(this.bakers.values()).filter(b => b.isActive);
    
    // Filter by tenant baker network if tenantId provided
    if (tenantId) {
      const tenantBakerNetworks = Array.from(this.tenantBakerNetworks.values())
        .filter(network => network.tenantId === tenantId && network.isApproved);
      const approvedBakerIds = new Set(tenantBakerNetworks.map(network => network.bakerId));
      bakers = bakers.filter(b => approvedBakerIds.has(b.id));
    }
    
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
      tenantId: insertLead.tenantId || null,
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

  async getLeadsByTenant(tenantId: string): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(lead => lead.tenantId === tenantId);
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

  // Multi-tenancy methods
  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const id = randomUUID();
    const tenant: Tenant = {
      ...insertTenant,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      customDomain: insertTenant.customDomain || null,
      contactPhone: insertTenant.contactPhone || null,
      address: insertTenant.address || null,
      subscriptionPlan: insertTenant.subscriptionPlan || 'basic',
      subscriptionStatus: insertTenant.subscriptionStatus || 'active',
      isActive: insertTenant.isActive !== undefined ? insertTenant.isActive : true,
    };
    this.tenants.set(id, tenant);
    
    // Create default configuration for new tenant
    await this.createTenantConfiguration({
      tenantId: id,
      primaryColor: '#B8860B',
      secondaryColor: '#F5E6B3', 
      accentColor: '#8B7355',
      customMessages: {
        heroTitle: `Welcome to ${tenant.name}`,
        heroSubtitle: 'Plan your perfect wedding cake with our expert partners'
      }
    });
    
    return tenant;
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined> {
    return Array.from(this.tenants.values()).find(t => t.subdomain === subdomain && t.isActive);
  }

  async getTenantByDomain(domain: string): Promise<Tenant | undefined> {
    return Array.from(this.tenants.values()).find(t => t.customDomain === domain && t.isActive);
  }

  async updateTenant(id: string, updates: Partial<InsertTenant>): Promise<Tenant> {
    const tenant = this.tenants.get(id);
    if (!tenant) {
      throw new Error(`Tenant with id ${id} not found`);
    }
    
    const updated: Tenant = { ...tenant, ...updates, updatedAt: new Date() };
    this.tenants.set(id, updated);
    return updated;
  }

  async createTenantConfiguration(insertConfig: InsertTenantConfiguration): Promise<TenantConfiguration> {
    const id = randomUUID();
    const config: TenantConfiguration = {
      ...insertConfig,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      logoUrl: insertConfig.logoUrl || null,
      primaryColor: insertConfig.primaryColor || '#B8860B',
      secondaryColor: insertConfig.secondaryColor || '#F5E6B3',
      accentColor: insertConfig.accentColor || '#8B7355',
      customMessages: insertConfig.customMessages as any || {},
      customCss: insertConfig.customCss || null,
      emailTemplates: insertConfig.emailTemplates as any || {},
    };
    this.tenantConfigurations.set(id, config);
    return config;
  }

  async getTenantConfiguration(tenantId: string): Promise<TenantConfiguration | undefined> {
    return Array.from(this.tenantConfigurations.values()).find(c => c.tenantId === tenantId);
  }

  async updateTenantConfiguration(tenantId: string, updates: Partial<InsertTenantConfiguration>): Promise<TenantConfiguration> {
    const config = Array.from(this.tenantConfigurations.values()).find(c => c.tenantId === tenantId);
    if (!config) {
      throw new Error(`Tenant configuration for tenant ${tenantId} not found`);
    }
    
    const updated: TenantConfiguration = { ...config, ...updates, updatedAt: new Date() };
    this.tenantConfigurations.set(config.id, updated);
    return updated;
  }

  async createTenantBakerNetwork(insertNetwork: InsertTenantBakerNetwork): Promise<TenantBakerNetwork> {
    const id = randomUUID();
    const network: TenantBakerNetwork = {
      ...insertNetwork,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isApproved: insertNetwork.isApproved !== undefined ? insertNetwork.isApproved : false,
      commissionRate: insertNetwork.commissionRate || '0.0500',
      priority: insertNetwork.priority || 0,
      isExclusive: insertNetwork.isExclusive !== undefined ? insertNetwork.isExclusive : false,
    };
    this.tenantBakerNetworks.set(id, network);
    return network;
  }

  async getTenantBakerNetworks(tenantId: string): Promise<TenantBakerNetwork[]> {
    return Array.from(this.tenantBakerNetworks.values())
      .filter(network => network.tenantId === tenantId)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  async updateTenantBakerNetwork(id: string, updates: Partial<InsertTenantBakerNetwork>): Promise<TenantBakerNetwork> {
    const network = this.tenantBakerNetworks.get(id);
    if (!network) {
      throw new Error(`Tenant baker network with id ${id} not found`);
    }
    
    const updated: TenantBakerNetwork = { ...network, ...updates, updatedAt: new Date() };
    this.tenantBakerNetworks.set(id, updated);
    return updated;
  }

  async createTenantRevenueSharing(insertSharing: InsertTenantRevenueSharing): Promise<TenantRevenueSharing> {
    const id = randomUUID();
    const sharing: TenantRevenueSharing = {
      ...insertSharing,
      id,
      createdAt: new Date(),
      orderAmount: insertSharing.orderAmount || null,
      tenantCommission: insertSharing.tenantCommission || null,
      bakerPayout: insertSharing.bakerPayout || null,
      commissionRate: insertSharing.commissionRate || null,
      status: insertSharing.status || 'pending',
      processedAt: insertSharing.processedAt || null,
    };
    this.tenantRevenueSharing.set(id, sharing);
    return sharing;
  }

  async getTenantRevenueSharing(tenantId: string): Promise<TenantRevenueSharing[]> {
    return Array.from(this.tenantRevenueSharing.values())
      .filter(sharing => sharing.tenantId === tenantId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateTenantRevenueSharing(id: string, updates: Partial<InsertTenantRevenueSharing>): Promise<TenantRevenueSharing> {
    const sharing = this.tenantRevenueSharing.get(id);
    if (!sharing) {
      throw new Error(`Tenant revenue sharing with id ${id} not found`);
    }
    
    const updated: TenantRevenueSharing = { ...sharing, ...updates };
    this.tenantRevenueSharing.set(id, updated);
    return updated;
  }

  // CRM methods implementation
  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      id,
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomersByBaker(bakerId: string): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter(c => c.bakerId === bakerId);
  }

  async getCustomersByTenant(tenantId: string): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter(c => c.tenantId === tenantId);
  }

  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer> {
    const customer = this.customers.get(id);
    if (!customer) throw new Error('Customer not found');
    const updated: Customer = { ...customer, ...updates, updatedAt: new Date() };
    this.customers.set(id, updated);
    return updated;
  }

  async searchCustomers(bakerId: string, query: string): Promise<Customer[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.customers.values()).filter(c => 
      c.bakerId === bakerId && (
        c.name.toLowerCase().includes(lowerQuery) ||
        c.email.toLowerCase().includes(lowerQuery) ||
        c.phone?.toLowerCase().includes(lowerQuery)
      )
    );
  }

  async createCustomerNote(noteData: InsertCustomerNote): Promise<CustomerNote> {
    const id = randomUUID();
    const note: CustomerNote = {
      id,
      ...noteData,
      createdAt: new Date(),
    };
    this.customerNotes.set(id, note);
    return note;
  }

  async getCustomerNotes(customerId: string): Promise<CustomerNote[]> {
    return Array.from(this.customerNotes.values())
      .filter(n => n.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Quote methods implementation
  async createQuoteTemplate(templateData: InsertQuoteTemplate): Promise<QuoteTemplate> {
    const id = randomUUID();
    const template: QuoteTemplate = {
      id,
      ...templateData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.quoteTemplates.set(id, template);
    return template;
  }

  async getQuoteTemplates(bakerId: string): Promise<QuoteTemplate[]> {
    return Array.from(this.quoteTemplates.values()).filter(t => t.bakerId === bakerId && t.isActive);
  }

  async getQuoteTemplate(id: string): Promise<QuoteTemplate | undefined> {
    return this.quoteTemplates.get(id);
  }

  async updateQuoteTemplate(id: string, updates: Partial<InsertQuoteTemplate>): Promise<QuoteTemplate> {
    const template = this.quoteTemplates.get(id);
    if (!template) throw new Error('Quote template not found');
    const updated: QuoteTemplate = { ...template, ...updates, updatedAt: new Date() };
    this.quoteTemplates.set(id, updated);
    return updated;
  }

  async createQuote(quoteData: InsertQuote): Promise<Quote> {
    const id = randomUUID();
    const quote: Quote = {
      id,
      ...quoteData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.quotes.set(id, quote);
    return quote;
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async getQuotesByBaker(bakerId: string): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(q => q.bakerId === bakerId);
  }

  async getQuotesByCustomer(customerId: string): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(q => q.customerId === customerId);
  }

  async updateQuote(id: string, updates: Partial<InsertQuote>): Promise<Quote> {
    const quote = this.quotes.get(id);
    if (!quote) throw new Error('Quote not found');
    const updated: Quote = { ...quote, ...updates, updatedAt: new Date() };
    this.quotes.set(id, updated);
    return updated;
  }

  async createQuoteItem(itemData: InsertQuoteItem): Promise<QuoteItem> {
    const id = randomUUID();
    const item: QuoteItem = { id, ...itemData };
    this.quoteItems.set(id, item);
    return item;
  }

  async getQuoteItems(quoteId: string): Promise<QuoteItem[]> {
    return Array.from(this.quoteItems.values())
      .filter(i => i.quoteId === quoteId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async updateQuoteItem(id: string, updates: Partial<InsertQuoteItem>): Promise<QuoteItem> {
    const item = this.quoteItems.get(id);
    if (!item) throw new Error('Quote item not found');
    const updated: QuoteItem = { ...item, ...updates };
    this.quoteItems.set(id, updated);
    return updated;
  }

  async deleteQuoteItem(id: string): Promise<boolean> {
    return this.quoteItems.delete(id);
  }

  // Contract methods implementation
  async createContractTemplate(templateData: InsertContractTemplate): Promise<ContractTemplate> {
    const id = randomUUID();
    const template: ContractTemplate = {
      id,
      ...templateData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contractTemplates.set(id, template);
    return template;
  }

  async getContractTemplates(bakerId: string): Promise<ContractTemplate[]> {
    return Array.from(this.contractTemplates.values()).filter(t => t.bakerId === bakerId && t.isActive);
  }

  async getContractTemplate(id: string): Promise<ContractTemplate | undefined> {
    return this.contractTemplates.get(id);
  }

  async createContract(contractData: InsertContract): Promise<Contract> {
    const id = randomUUID();
    const contract: Contract = {
      id,
      ...contractData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contracts.set(id, contract);
    return contract;
  }

  async getContract(id: string): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async getContractsByBaker(bakerId: string): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(c => c.bakerId === bakerId);
  }

  async getContractsByCustomer(customerId: string): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(c => c.customerId === customerId);
  }

  async updateContract(id: string, updates: Partial<InsertContract>): Promise<Contract> {
    const contract = this.contracts.get(id);
    if (!contract) throw new Error('Contract not found');
    const updated: Contract = { ...contract, ...updates, updatedAt: new Date() };
    this.contracts.set(id, updated);
    return updated;
  }

  async createContractSignature(signatureData: InsertContractSignature): Promise<ContractSignature> {
    const id = randomUUID();
    const signature: ContractSignature = {
      id,
      ...signatureData,
      signedAt: new Date(),
    };
    this.contractSignatures.set(id, signature);
    return signature;
  }

  async getContractSignatures(contractId: string): Promise<ContractSignature[]> {
    return Array.from(this.contractSignatures.values()).filter(s => s.contractId === contractId);
  }

  // Payment methods implementation
  async createPaymentPlan(planData: InsertPaymentPlan): Promise<PaymentPlan> {
    const id = randomUUID();
    const plan: PaymentPlan = {
      id,
      ...planData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.paymentPlans.set(id, plan);
    return plan;
  }

  async getPaymentPlan(id: string): Promise<PaymentPlan | undefined> {
    return this.paymentPlans.get(id);
  }

  async getPaymentPlansByBaker(bakerId: string): Promise<PaymentPlan[]> {
    return Array.from(this.paymentPlans.values()).filter(p => p.bakerId === bakerId);
  }

  async updatePaymentPlan(id: string, updates: Partial<InsertPaymentPlan>): Promise<PaymentPlan> {
    const plan = this.paymentPlans.get(id);
    if (!plan) throw new Error('Payment plan not found');
    const updated: PaymentPlan = { ...plan, ...updates, updatedAt: new Date() };
    this.paymentPlans.set(id, updated);
    return updated;
  }

  async createPaymentSchedule(scheduleData: InsertPaymentSchedule): Promise<PaymentSchedule> {
    const id = randomUUID();
    const schedule: PaymentSchedule = {
      id,
      ...scheduleData,
      createdAt: new Date(),
    };
    this.paymentSchedule.set(id, schedule);
    return schedule;
  }

  async getPaymentSchedule(planId: string): Promise<PaymentSchedule[]> {
    return Array.from(this.paymentSchedule.values())
      .filter(s => s.planId === planId)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  async updatePaymentSchedule(id: string, updates: Partial<InsertPaymentSchedule>): Promise<PaymentSchedule> {
    const schedule = this.paymentSchedule.get(id);
    if (!schedule) throw new Error('Payment schedule not found');
    const updated: PaymentSchedule = { ...schedule, ...updates };
    this.paymentSchedule.set(id, updated);
    return updated;
  }

  async createInvoice(invoiceData: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const invoice: Invoice = {
      id,
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoicesByBaker(bakerId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(i => i.bakerId === bakerId);
  }

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(i => i.customerId === customerId);
  }

  async updateInvoice(id: string, updates: Partial<InsertInvoice>): Promise<Invoice> {
    const invoice = this.invoices.get(id);
    if (!invoice) throw new Error('Invoice not found');
    const updated: Invoice = { ...invoice, ...updates, updatedAt: new Date() };
    this.invoices.set(id, updated);
    return updated;
  }

  private initializeSampleData() {
    // Create sample baker (this should exist from initializeBakers)
    const sampleBakerId = "baker-1";
    const sampleTenantId = "tenant-1";

    // Create sample customers
    const customer1: Customer = {
      id: "customer-1",
      tenantId: sampleTenantId,
      bakerId: sampleBakerId,
      name: "Emily & James Thompson",
      email: "emily.thompson@email.com",
      phone: "(555) 234-5678",
      partnerName: "James Thompson",
      eventDate: '2024-09-15',
      eventType: "wedding",
      venue: "Sunset Gardens",
      guestCount: 120,
      budget: "$1500-2000",
      source: "instagram",
      status: "contracted",
      dietaryRestrictions: { glutenFree: false, vegan: false },
      preferences: { flavors: ["vanilla", "strawberry"], styles: ["elegant", "rustic"] },
      priority: "high",
      tags: ["premium", "referral-candidate"],
      lastContactDate: new Date(),
      nextFollowUpDate: new Date('2024-08-15'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const customer2: Customer = {
      id: "customer-2",
      tenantId: sampleTenantId,
      bakerId: sampleBakerId,
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "(555) 345-6789",
      eventDate: '2024-10-22',
      eventType: "birthday",
      guestCount: 25,
      budget: "$300-500",
      source: "website",
      status: "quoted",
      dietaryRestrictions: { glutenFree: true },
      preferences: { flavors: ["chocolate"], themes: ["superhero"] },
      priority: "medium",
      tags: ["birthday", "gluten-free"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.customers.set(customer1.id, customer1);
    this.customers.set(customer2.id, customer2);

    // Create sample leads for baker-1
    const lead1: Lead = {
      id: "lead-1",
      tenantId: sampleTenantId,
      bakerId: sampleBakerId,
      profileId: null,
      customerName: "Jessica Martinez",
      customerEmail: "jessica.martinez@email.com",
      customerPhone: "(555) 789-0123",
      weddingDate: "2024-11-30",
      guestCount: 85,
      budget: "$1200-1800",
      message: "Hi! I'm looking for a 2-tier wedding cake for my November wedding. We love vintage designs and would prefer vanilla and chocolate flavors. Can you provide a quote?",
      status: "new",
      estimateId: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    };

    const lead2: Lead = {
      id: "lead-2", 
      tenantId: sampleTenantId,
      bakerId: sampleBakerId,
      profileId: null,
      customerName: "Michael & Anna Chen",
      customerEmail: "anna.chen@email.com",
      customerPhone: "(555) 456-7890",
      weddingDate: "2024-12-15",
      guestCount: 150,
      budget: "$2000-3000",
      message: "We're planning our December wedding and need a 3-tier cake. We're interested in modern designs with gold accents. Do you do tasting sessions?",
      status: "contacted",
      estimateId: null,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    };

    const lead3: Lead = {
      id: "lead-3",
      tenantId: sampleTenantId,
      bakerId: sampleBakerId,
      profileId: null,
      customerName: "David Johnson",
      customerEmail: "david.johnson@email.com", 
      customerPhone: "(555) 321-9876",
      weddingDate: "2025-01-20",
      guestCount: 200,
      budget: "$3000+",
      message: "Looking for an elaborate 4-tier wedding cake with sugar flowers. This is for a black-tie wedding at the Grand Ballroom. Budget is flexible for the right design.",
      status: "quoted",
      estimateId: null,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    };

    const lead4: Lead = {
      id: "lead-4",
      tenantId: sampleTenantId,
      bakerId: sampleBakerId,
      profileId: null,
      customerName: "Rachel Thompson",
      customerEmail: "rachel.t@email.com",
      customerPhone: "(555) 654-3210",
      weddingDate: "2024-10-05",
      guestCount: 50,
      budget: "$800-1200",
      message: "Small intimate wedding cake needed. We love rustic, naked cake styles with fresh berries. Can you accommodate dietary restrictions?",
      status: "booked",
      estimateId: null,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    };

    const lead5: Lead = {
      id: "lead-5",
      tenantId: sampleTenantId,
      bakerId: sampleBakerId,
      profileId: null,
      customerName: "Kevin Brown",
      customerEmail: "k.brown@email.com",
      customerPhone: null,
      weddingDate: "2024-09-28",
      guestCount: 75,
      budget: "$1000-1500",
      message: "Quick question about pricing for a 2-tier wedding cake with buttercream frosting.",
      status: "declined",
      estimateId: null,
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
    };

    // Add leads to storage
    this.leads.set(lead1.id, lead1);
    this.leads.set(lead2.id, lead2);
    this.leads.set(lead3.id, lead3);
    this.leads.set(lead4.id, lead4);
    this.leads.set(lead5.id, lead5);

    // Create sample quote template
    const quoteTemplate: QuoteTemplate = {
      id: "template-1",
      tenantId: sampleTenantId,
      bakerId: sampleBakerId,
      name: "Wedding Cake - 3 Tier",
      description: "Beautiful 3-tier wedding cake template",
      category: "wedding",
      basePrice: "500.00",
      pricePerServing: "8.50",
      tiers: [
        { tierNumber: 1, diameter: 12, height: 4, servings: 60, priceMultiplier: 1.0 },
        { tierNumber: 2, diameter: 9, height: 4, servings: 35, priceMultiplier: 0.8 },
        { tierNumber: 3, diameter: 6, height: 4, servings: 15, priceMultiplier: 0.6 }
      ],
      addOns: [
        { name: "Sugar Flowers", description: "Handcrafted sugar flowers", price: 150, category: "decoration" },
        { name: "Gold Leaf Accent", description: "Edible gold leaf details", price: 100, category: "decoration" },
        { name: "Delivery & Setup", description: "Professional delivery and setup", price: 75, category: "service" }
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.quoteTemplates.set(quoteTemplate.id, quoteTemplate);

    // Create sample quote
    const quote: Quote = {
      id: "quote-1",
      tenantId: sampleTenantId,
      bakerId: sampleBakerId,
      customerId: customer1.id,
      templateId: quoteTemplate.id,
      quoteNumber: "Q2024-001",
      title: "Emily & James Wedding Cake",
      description: "3-tier wedding cake for 120 guests",
      eventDate: '2024-09-15',
      eventType: "wedding",
      guestCount: 120,
      deliveryAddress: "Sunset Gardens, 456 Garden Path, Event City, CA",
      setupTime: "2:00 PM",
      subtotal: "1275.00",
      taxRate: "0.0875",
      taxAmount: "111.56",
      total: "1386.56",
      depositAmount: "693.28",
      depositPercentage: "50.00",
      status: "approved",
      validUntil: new Date('2024-08-01'),
      terms: "50% deposit required to secure date. Final payment due 7 days before event.",
      createdAt: new Date(),
      updatedAt: new Date(),
      sentAt: new Date(),
      approvedAt: new Date(),
    };
    this.quotes.set(quote.id, quote);

    // Create sample quote items
    const quoteItems = [
      {
        id: "item-1",
        quoteId: quote.id,
        name: "3-Tier Wedding Cake (110 servings)",
        description: "Vanilla and strawberry tiers with buttercream frosting",
        quantity: "1.00",
        unitPrice: "935.00",
        totalPrice: "935.00",
        category: "cake",
        sortOrder: 1,
      },
      {
        id: "item-2",
        quoteId: quote.id,
        name: "Sugar Flower Decorations",
        description: "Handcrafted sugar roses and peonies",
        quantity: "1.00",
        unitPrice: "150.00",
        totalPrice: "150.00",
        category: "decoration",
        sortOrder: 2,
      },
      {
        id: "item-3",
        quoteId: quote.id,
        name: "Delivery & Professional Setup",
        description: "Delivery to venue and professional cake setup",
        quantity: "1.00",
        unitPrice: "190.00",
        totalPrice: "190.00",
        category: "service",
        sortOrder: 3,
      },
    ];

    quoteItems.forEach(item => this.quoteItems.set(item.id, item));

    // Create default contract templates
    this.initializeDefaultContractTemplates(sampleTenantId, sampleBakerId);
  }

  private async initializeDefaultContractTemplates(tenantId: string, bakerId: string) {
    // Wedding Cake Standard Contract
    const weddingContract: ContractTemplate = {
      id: "template-wedding-standard",
      tenantId,
      bakerId,
      name: "Wedding Cake Service Agreement",
      description: "Standard contract for wedding cake orders with terms, conditions, and payment schedule",
      template: `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #2d3748; margin-bottom: 30px;">WEDDING CAKE SERVICE AGREEMENT</h1>
        <p><strong>Contract Number:</strong> [CONTRACT_NUMBER]</p>
        <p><strong>Baker:</strong> [BAKER_NAME]</p>
        <p><strong>Client:</strong> [CUSTOMER_NAME]</p>
        <p><strong>Event Date:</strong> [EVENT_DATE]</p>
        <p><strong>Total Amount:</strong> $[TOTAL_AMOUNT]</p>
        <p><strong>Deposit:</strong> $[DEPOSIT_AMOUNT]</p>
        <h2>Terms and Conditions</h2>
        <p>1. 50% deposit required to secure date</p>
        <p>2. Final payment due 7 days before event</p>
        <p>3. Cancellation policy applies per terms</p>
        <div style="margin-top: 40px;">
          <p>Baker Signature: _________________</p>
          <p>Client Signature: _________________</p>
        </div>
      </div>`,
      category: "wedding",
      terms: "50% deposit required. Final payment due 7 days before event.",
      cancellationPolicy: "30-day notice required for partial refund.",
      paymentTerms: "50% deposit to secure date. Balance due 7 days prior.",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Birthday Contract
    const birthdayContract: ContractTemplate = {
      id: "template-birthday-standard",
      tenantId,
      bakerId,
      name: "Birthday Cake Agreement",
      description: "Contract for birthday and special occasion cakes",
      template: `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #2d3748; margin-bottom: 30px;">BIRTHDAY CAKE AGREEMENT</h1>
        <p><strong>Contract Number:</strong> [CONTRACT_NUMBER]</p>
        <p><strong>Baker:</strong> [BAKER_NAME]</p>
        <p><strong>Customer:</strong> [CUSTOMER_NAME]</p>
        <p><strong>Event Date:</strong> [EVENT_DATE]</p>
        <p><strong>Total Amount:</strong> $[TOTAL_AMOUNT]</p>
        <h2>Terms</h2>
        <p>1. 50% deposit secures order</p>
        <p>2. Balance due on pickup/delivery</p>
        <p>3. 48-hour notice for changes</p>
        <div style="margin-top: 40px;">
          <p>Baker: _________________</p>
          <p>Customer: _________________</p>
        </div>
      </div>`,
      category: "birthday",
      terms: "50% deposit to secure order. Balance due on pickup.",
      cancellationPolicy: "48-hour notice required for deposit refund.",
      paymentTerms: "50% deposit, balance on pickup/delivery.",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Corporate Contract
    const corporateContract: ContractTemplate = {
      id: "template-corporate-standard",
      tenantId,
      bakerId,
      name: "Corporate Event Agreement",
      description: "Professional contract for corporate events and business celebrations",
      template: `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #2d3748; margin-bottom: 30px;">CORPORATE EVENT AGREEMENT</h1>
        <p><strong>Business:</strong> [BAKER_NAME]</p>
        <p><strong>Client Company:</strong> [COMPANY_NAME]</p>
        <p><strong>Contact:</strong> [CONTACT_PERSON]</p>
        <p><strong>Event Date:</strong> [EVENT_DATE]</p>
        <p><strong>Total Amount:</strong> $[TOTAL_AMOUNT]</p>
        <h2>Corporate Terms</h2>
        <p>1. Standard corporate payment terms</p>
        <p>2. Net 30 payment for established accounts</p>
        <p>3. 14-day cancellation notice required</p>
        <div style="margin-top: 40px;">
          <p>Service Provider: _________________</p>
          <p>Client Representative: _________________</p>
        </div>
      </div>`,
      category: "corporate",
      terms: "Net 30 payment terms for established accounts.",
      cancellationPolicy: "14-day notice required. Cancellation fees may apply.",
      paymentTerms: "Standard corporate payment schedule or Net 30.",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store templates
    this.contractTemplates.set(weddingContract.id, weddingContract);
    this.contractTemplates.set(birthdayContract.id, birthdayContract);
    this.contractTemplates.set(corporateContract.id, corporateContract);
  }
}

// Helper function to convert undefined to null for database operations
function sanitizeForDb<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  Object.keys(result).forEach(key => {
    if (result[key] === undefined) {
      result[key] = null;
    }
  });
  return result;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, id: insertUser.id || randomUUID() })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Profile operations
  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values({ ...insertProfile, id: insertProfile.id || randomUUID() })
      .returning();
    return profile;
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile || undefined;
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || undefined;
  }

  async getProfilesByTenant(tenantId: string): Promise<Profile[]> {
    return await db.select().from(profiles).where(eq(profiles.tenantId, tenantId));
  }

  async updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return profile;
  }

  // Estimate operations
  async createEstimate(insertEstimate: InsertEstimate): Promise<Estimate> {
    const [estimate] = await db
      .insert(estimates)
      .values({ ...insertEstimate, id: insertEstimate.id || randomUUID() })
      .returning();
    return estimate;
  }

  async getEstimate(id: string): Promise<Estimate | undefined> {
    const [estimate] = await db.select().from(estimates).where(eq(estimates.id, id));
    return estimate || undefined;
  }

  async getEstimatesByProfile(profileId: string): Promise<Estimate[]> {
    return await db.select().from(estimates).where(eq(estimates.profileId, profileId));
  }

  async getEstimatesByTenant(tenantId: string): Promise<Estimate[]> {
    return await db.select().from(estimates).where(eq(estimates.tenantId, tenantId));
  }

  async updateEstimate(id: string, updates: Partial<InsertEstimate>): Promise<Estimate> {
    const [estimate] = await db
      .update(estimates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(estimates.id, id))
      .returning();
    return estimate;
  }

  async deleteEstimate(id: string): Promise<boolean> {
    const result = await db.delete(estimates).where(eq(estimates.id, id));
    return result.rowCount > 0;
  }

  // Baker operations - simplified for production deployment
  async getBakers(): Promise<Baker[]> {
    return await db.select().from(bakers);
  }

  async getBaker(id: string): Promise<Baker | undefined> {
    const [baker] = await db.select().from(bakers).where(eq(bakers.id, id));
    return baker || undefined;
  }

  async createBaker(insertBaker: InsertBaker): Promise<Baker> {
    const [baker] = await db
      .insert(bakers)
      .values({ ...insertBaker, id: insertBaker.id || randomUUID() })
      .returning();
    return baker;
  }

  async updateBaker(id: string, updates: Partial<InsertBaker>): Promise<Baker> {
    const [baker] = await db
      .update(bakers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bakers.id, id))
      .returning();
    return baker;
  }

  async searchBakers(location?: string, radius?: number, specialty?: string, tenantId?: string): Promise<Baker[]> {
    // Simplified search for now - can be enhanced later
    return await db.select().from(bakers);
  }

  // Stub implementations for remaining methods - can be expanded as needed
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(sanitizeForDb({ ...insertLead, id: insertLead.id || randomUUID() }))
      .returning();
    return lead;
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async getLeadsByBaker(bakerId: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.bakerId, bakerId));
  }

  async getLeadsByTenant(tenantId: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.tenantId, tenantId));
  }

  async updateLead(id: string, updates: Partial<InsertLead>): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set(sanitizeForDb({ ...updates, updatedAt: new Date() }))
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({ ...insertMessage, id: insertMessage.id || randomUUID() })
      .returning();
    return message;
  }

  async getMessagesByLead(leadId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.leadId, leadId));
  }

  async updateMessage(id: string, content: string): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set({ content, updatedAt: new Date() })
      .where(eq(messages.id, id))
      .returning();
    return message || undefined;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return result.rowCount > 0;
  }

  // Placeholder implementations for all other required methods
  // These can be implemented incrementally as features are needed
  
  async createReview(review: InsertReview): Promise<Review> {
    const [result] = await db.insert(reviews).values({ ...review, id: review.id || randomUUID() }).returning();
    return result;
  }

  async getReviewsByBakerId(bakerId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.bakerId, bakerId));
  }

  async getReviewById(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async updateReviewVerification(id: string, isVerified: boolean): Promise<Review | undefined> {
    const [review] = await db.update(reviews).set({ isVerified }).where(eq(reviews.id, id)).returning();
    return review || undefined;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [result] = await db.insert(transactions).values({ ...transaction, id: transaction.id || randomUUID() }).returning();
    return result;
  }

  async getTransactionsByBakerId(bakerId: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.bakerId, bakerId));
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined> {
    const [transaction] = await db.update(transactions).set({ status }).where(eq(transactions.id, id)).returning();
    return transaction || undefined;
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const [result] = await db.insert(availability).values({ ...insertAvailability, id: insertAvailability.id || randomUUID() }).returning();
    return result;
  }

  async getAvailabilityByBakerId(bakerId: string): Promise<Availability[]> {
    return await db.select().from(availability).where(eq(availability.bakerId, bakerId));
  }

  async updateAvailability(id: string, updates: Partial<InsertAvailability>): Promise<Availability | undefined> {
    const [result] = await db.update(availability).set({ ...updates, updatedAt: new Date() }).where(eq(availability.id, id)).returning();
    return result || undefined;
  }

  async deleteAvailability(id: string): Promise<boolean> {
    const result = await db.delete(availability).where(eq(availability.id, id));
    return result.rowCount > 0;
  }

  async trackAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    const [result] = await db.insert(analytics).values({ ...analytics, id: analytics.id || randomUUID() }).returning();
    return result;
  }

  async getAnalyticsByBakerId(bakerId: string, metric?: string): Promise<Analytics[]> {
    let query = db.select().from(analytics).where(eq(analytics.bakerId, bakerId));
    if (metric) {
      query = query.where(eq(analytics.metric, metric));
    }
    return await query;
  }

  async getAnalyticsSummary(bakerId: string, startDate: string, endDate: string): Promise<{ [key: string]: number }> {
    // Simplified implementation - can be enhanced with proper aggregation
    return {};
  }

  // Continue with remaining method stubs...
  async createBakerProfile(profile: InsertBakerProfile): Promise<BakerProfile> {
    const [result] = await db.insert(bakerProfiles).values({ ...profile, id: profile.id || randomUUID() }).returning();
    return result;
  }

  async getBakerProfile(id: string): Promise<BakerProfile | undefined> {
    const [profile] = await db.select().from(bakerProfiles).where(eq(bakerProfiles.id, id));
    return profile || undefined;
  }

  async getBakerProfileByBakerId(bakerId: string): Promise<BakerProfile | undefined> {
    const [profile] = await db.select().from(bakerProfiles).where(eq(bakerProfiles.bakerId, bakerId));
    return profile || undefined;
  }

  async updateBakerProfile(id: string, updates: Partial<InsertBakerProfile>): Promise<BakerProfile> {
    const [profile] = await db.update(bakerProfiles).set(updates).where(eq(bakerProfiles.id, id)).returning();
    return profile;
  }

  // Add minimal tenant operations
  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [result] = await db.insert(tenants).values({ ...tenant, id: tenant.id || randomUUID() }).returning();
    return result;
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
    return tenant || undefined;
  }

  async getTenantByDomain(domain: string): Promise<Tenant | undefined> {
    // Check both subdomain and custom domain
    const [tenant] = await db.select().from(tenants).where(
      or(eq(tenants.subdomain, domain), eq(tenants.customDomain, domain))
    );
    return tenant || undefined;
  }

  async updateTenant(id: string, updates: Partial<InsertTenant>): Promise<Tenant> {
    const [tenant] = await db.update(tenants).set(updates).where(eq(tenants.id, id)).returning();
    return tenant;
  }

  // Add remaining stub methods for compilation
  async getTenantConfiguration(tenantId: string): Promise<TenantConfiguration | undefined> {
    const [config] = await db.select().from(tenantConfigurations).where(eq(tenantConfigurations.tenantId, tenantId));
    return config || undefined;
  }

  async createTenantConfiguration(config: InsertTenantConfiguration): Promise<TenantConfiguration> {
    const [result] = await db.insert(tenantConfigurations).values({ ...config, id: config.id || randomUUID() }).returning();
    return result;
  }

  async updateTenantConfiguration(tenantId: string, updates: Partial<InsertTenantConfiguration>): Promise<TenantConfiguration> {
    const [config] = await db.update(tenantConfigurations).set(updates).where(eq(tenantConfigurations.tenantId, tenantId)).returning();
    return config;
  }

  // Simplified implementations for all remaining required methods
  async getTenantsByBaker(bakerId: string): Promise<Tenant[]> { return []; }
  async addBakerToTenant(tenantId: string, bakerId: string): Promise<TenantBakerNetwork> {
    const [result] = await db.insert(tenantBakerNetworks).values({ 
      id: randomUUID(), tenantId, bakerId, isApproved: false 
    }).returning();
    return result;
  }
  async removeBakerFromTenant(tenantId: string, bakerId: string): Promise<boolean> { return true; }
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [result] = await db.insert(customers).values({ ...customer, id: customer.id || randomUUID() }).returning();
    return result;
  }
  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }
  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }
  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer> {
    const [customer] = await db.update(customers).set(updates).where(eq(customers.id, id)).returning();
    return customer;
  }
  async getCustomersByBaker(bakerId: string): Promise<Customer[]> { return []; }
  async createCustomerNote(note: InsertCustomerNote): Promise<CustomerNote> {
    const [result] = await db.insert(customerNotes).values({ ...note, id: note.id || randomUUID() }).returning();
    return result;
  }
  async getCustomerNotes(customerId: string): Promise<CustomerNote[]> { return []; }
  async updateCustomerNote(id: string, content: string): Promise<CustomerNote | undefined> { return undefined; }
  async deleteCustomerNote(id: string): Promise<boolean> { return true; }
  async createQuoteTemplate(template: InsertQuoteTemplate): Promise<QuoteTemplate> {
    const [result] = await db.insert(quoteTemplates).values({ ...template, id: template.id || randomUUID() }).returning();
    return result;
  }
  async getQuoteTemplate(id: string): Promise<QuoteTemplate | undefined> {
    const [template] = await db.select().from(quoteTemplates).where(eq(quoteTemplates.id, id));
    return template || undefined;
  }
  async getQuoteTemplatesByBaker(bakerId: string): Promise<QuoteTemplate[]> { return []; }
  async updateQuoteTemplate(id: string, updates: Partial<InsertQuoteTemplate>): Promise<QuoteTemplate> {
    const [template] = await db.update(quoteTemplates).set(updates).where(eq(quoteTemplates.id, id)).returning();
    return template;
  }
  async deleteQuoteTemplate(id: string): Promise<boolean> { return true; }
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [result] = await db.insert(quotes).values({ ...quote, id: quote.id || randomUUID() }).returning();
    return result;
  }
  async getQuote(id: string): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote || undefined;
  }
  async getQuotesByCustomer(customerId: string): Promise<Quote[]> { return []; }
  async getQuotesByBaker(bakerId: string): Promise<Quote[]> { return []; }
  async updateQuote(id: string, updates: Partial<InsertQuote>): Promise<Quote> {
    const [quote] = await db.update(quotes).set(updates).where(eq(quotes.id, id)).returning();
    return quote;
  }
  async deleteQuote(id: string): Promise<boolean> { return true; }
  async createQuoteItem(item: InsertQuoteItem): Promise<QuoteItem> {
    const [result] = await db.insert(quoteItems).values({ ...item, id: item.id || randomUUID() }).returning();
    return result;
  }
  async getQuoteItems(quoteId: string): Promise<QuoteItem[]> { return []; }
  async updateQuoteItem(id: string, updates: Partial<InsertQuoteItem>): Promise<QuoteItem> {
    const [item] = await db.update(quoteItems).set(updates).where(eq(quoteItems.id, id)).returning();
    return item;
  }
  async deleteQuoteItem(id: string): Promise<boolean> { return true; }
  async createContractTemplate(template: InsertContractTemplate): Promise<ContractTemplate> {
    const [result] = await db.insert(contractTemplates).values({ ...template, id: template.id || randomUUID() }).returning();
    return result;
  }
  async getContractTemplate(id: string): Promise<ContractTemplate | undefined> {
    const [template] = await db.select().from(contractTemplates).where(eq(contractTemplates.id, id));
    return template || undefined;
  }
  async getContractTemplatesByBaker(bakerId: string): Promise<ContractTemplate[]> { return []; }
  async updateContractTemplate(id: string, updates: Partial<InsertContractTemplate>): Promise<ContractTemplate> {
    const [template] = await db.update(contractTemplates).set(updates).where(eq(contractTemplates.id, id)).returning();
    return template;
  }
  async deleteContractTemplate(id: string): Promise<boolean> { return true; }
  async createContract(contract: InsertContract): Promise<Contract> {
    const [result] = await db.insert(contracts).values({ ...contract, id: contract.id || randomUUID() }).returning();
    return result;
  }
  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract || undefined;
  }
  async getContractsByCustomer(customerId: string): Promise<Contract[]> { return []; }
  async getContractsByBaker(bakerId: string): Promise<Contract[]> { return []; }
  async updateContract(id: string, updates: Partial<InsertContract>): Promise<Contract> {
    const [contract] = await db.update(contracts).set(updates).where(eq(contracts.id, id)).returning();
    return contract;
  }
  async deleteContract(id: string): Promise<boolean> { return true; }
  async createContractSignature(signature: InsertContractSignature): Promise<ContractSignature> {
    const [result] = await db.insert(contractSignatures).values({ ...signature, id: signature.id || randomUUID() }).returning();
    return result;
  }
  async getContractSignatures(contractId: string): Promise<ContractSignature[]> { return []; }
  async createPaymentPlan(plan: InsertPaymentPlan): Promise<PaymentPlan> {
    const [result] = await db.insert(paymentPlans).values({ ...plan, id: plan.id || randomUUID() }).returning();
    return result;
  }
  async getPaymentPlan(id: string): Promise<PaymentPlan | undefined> {
    const [plan] = await db.select().from(paymentPlans).where(eq(paymentPlans.id, id));
    return plan || undefined;
  }
  async getPaymentPlansByBaker(bakerId: string): Promise<PaymentPlan[]> { return []; }
  async updatePaymentPlan(id: string, updates: Partial<InsertPaymentPlan>): Promise<PaymentPlan> {
    const [plan] = await db.update(paymentPlans).set(updates).where(eq(paymentPlans.id, id)).returning();
    return plan;
  }
  async deletePaymentPlan(id: string): Promise<boolean> { return true; }
  async createPaymentSchedule(schedule: InsertPaymentSchedule): Promise<PaymentSchedule> {
    const [result] = await db.insert(paymentSchedules).values({ ...schedule, id: schedule.id || randomUUID() }).returning();
    return result;
  }
  async getPaymentSchedulesByContract(contractId: string): Promise<PaymentSchedule[]> { return []; }
  async updatePaymentSchedule(id: string, updates: Partial<InsertPaymentSchedule>): Promise<PaymentSchedule> {
    const [schedule] = await db.update(paymentSchedules).set(updates).where(eq(paymentSchedules.id, id)).returning();
    return schedule;
  }
  async deletePaymentSchedule(id: string): Promise<boolean> { return true; }
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [result] = await db.insert(invoices).values({ ...invoice, id: invoice.id || randomUUID() }).returning();
    return result;
  }
  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }
  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> { return []; }
  async getInvoicesByBaker(bakerId: string): Promise<Invoice[]> { return []; }
  async updateInvoice(id: string, updates: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db.update(invoices).set(updates).where(eq(invoices.id, id)).returning();
    return invoice;
  }
  async deleteInvoice(id: string): Promise<boolean> { return true; }

  // Tenant operations
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async getTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants);
  }

  async updateTenant(id: string, updates: Partial<InsertTenant>): Promise<Tenant> {
    const [tenant] = await db
      .update(tenants)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return tenant;
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await db
      .insert(tenants)
      .values({ ...insertTenant, id: insertTenant.id || randomUUID() })
      .returning();
    return tenant;
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
    return tenant || undefined;
  }

  async getTenantByDomain(domain: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.domain, domain));
    return tenant || undefined;
  }
}

export const storage = new DatabaseStorage();
