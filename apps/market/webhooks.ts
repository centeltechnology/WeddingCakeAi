import { db } from "./db";
import { vendorClaims, claimAuditLog } from "./schema";
import { eq } from "drizzle-orm";

interface ProvisionBakerResult {
  success: boolean;
  tenantId?: string;
  userId?: string;
  bakerId?: string;
  message?: string;
  error?: string;
}

export async function handleClaimApproval(
  claimId: string,
  approvedBy: string
): Promise<void> {
  // Get the claim
  const claim = await db.query.vendorClaims.findFirst({
    where: eq(vendorClaims.id, claimId),
  });

  if (!claim) {
    throw new Error(`Claim not found: ${claimId}`);
  }

  if (claim.status !== 'pending') {
    throw new Error(`Claim is not pending: ${claim.status}`);
  }

  // Update claim to approved
  await db
    .update(vendorClaims)
    .set({
      status: 'approved',
      approvedBy: approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(vendorClaims.id, claimId));

  // Log audit
  await db.insert(claimAuditLog).values({
    claimId: claimId,
    action: 'approved',
    performedBy: approvedBy,
    details: JSON.stringify({ email: claim.email, name: claim.name }),
  });

  console.log('[Marketplace] Claim approved:', claimId);

  // Call app's internal provisioning endpoint
  const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
  const internalSecret = process.env.INTERNAL_SHARED_SECRET || 'dev-shared-secret-change-in-production';

  try {
    const response = await fetch(`${appBaseUrl}/internal/provision/baker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Auth': internalSecret,
      },
      body: JSON.stringify({
        claimId: claim.id,
        email: claim.email,
        name: claim.name,
        marketplaceVendorId: claim.vendorId,
      }),
    });

    const result: ProvisionBakerResult = await response.json();

    if (response.ok && result.success) {
      // Update claim with provisioned IDs
      await db
        .update(vendorClaims)
        .set({
          provisionedTenantId: result.tenantId,
          provisionedUserId: result.userId,
          provisionedBakerId: result.bakerId,
          updatedAt: new Date(),
        })
        .where(eq(vendorClaims.id, claimId));

      // Log provisioning success
      await db.insert(claimAuditLog).values({
        claimId: claimId,
        action: 'provisioned',
        performedBy: 'system',
        details: JSON.stringify({
          tenantId: result.tenantId,
          userId: result.userId,
          bakerId: result.bakerId,
        }),
      });

      console.log('[Marketplace] Baker provisioned successfully:', {
        claimId,
        tenantId: result.tenantId,
        userId: result.userId,
        bakerId: result.bakerId,
      });
    } else {
      throw new Error(result.error || result.message || 'Provisioning failed');
    }
  } catch (error: any) {
    // Log provisioning failure
    await db.insert(claimAuditLog).values({
      claimId: claimId,
      action: 'provisioning_failed',
      performedBy: 'system',
      details: JSON.stringify({ error: error.message }),
    });

    console.error('[Marketplace] Provisioning failed:', error);
    throw error;
  }
}
