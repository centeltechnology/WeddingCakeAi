import { pgTable, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const vendorClaims = pgTable("vendor_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull(), // Marketplace vendor ID
  email: text("email").notNull(),
  name: text("name").notNull(),
  businessName: text("business_name"),
  phone: text("phone"),
  status: text("status").notNull().default('pending'), // pending, approved, rejected
  approvedBy: varchar("approved_by"), // Admin user who approved
  approvedAt: timestamp("approved_at"),
  rejectedBy: varchar("rejected_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  provisionedTenantId: varchar("provisioned_tenant_id"), // Tenant ID in app after provisioning
  provisionedUserId: varchar("provisioned_user_id"),
  provisionedBakerId: varchar("provisioned_baker_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const claimAuditLog = pgTable("claim_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimId: varchar("claim_id").notNull().references(() => vendorClaims.id),
  action: text("action").notNull(), // created, approved, rejected, provisioned
  performedBy: varchar("performed_by"), // User who performed action
  details: text("details"), // JSON string with additional details
  createdAt: timestamp("created_at").defaultNow(),
});

export type VendorClaim = typeof vendorClaims.$inferSelect;
export type InsertVendorClaim = typeof vendorClaims.$inferInsert;
export type ClaimAuditLog = typeof claimAuditLog.$inferSelect;
export type InsertClaimAuditLog = typeof claimAuditLog.$inferInsert;
