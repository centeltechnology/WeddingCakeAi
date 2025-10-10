import { randomBytes } from "crypto";
import { storage } from "./storage";
import type { InsertPublicToken, PublicToken } from "@shared/schema";

export async function issuePublicToken(
  tenantId: string,
  entity: "quote" | "contract" | "invoice",
  entityId: string,
  ttlDays: number = 30
): Promise<PublicToken> {
  // Check if token already exists
  const existing = await storage.getPublicTokenByEntity(tenantId, entity, entityId);
  if (existing && existing.expiresAt > new Date()) {
    // Return existing valid token
    return existing;
  }

  // Generate secure random token
  const token = randomBytes(32).toString('base64url');
  
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttlDays);

  // Create token in database
  const insertToken: InsertPublicToken = {
    tenantId,
    entity,
    entityId,
    token,
    expiresAt
  };

  return await storage.createPublicToken(insertToken);
}

export async function validatePublicToken(
  token: string
): Promise<{ valid: boolean; tokenData?: PublicToken; error?: string }> {
  const tokenData = await storage.getPublicTokenByToken(token);

  if (!tokenData) {
    return { valid: false, error: "Token not found" };
  }

  if (tokenData.expiresAt < new Date()) {
    return { valid: false, error: "Token has expired" };
  }

  return { valid: true, tokenData };
}
