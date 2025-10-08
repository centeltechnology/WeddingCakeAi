import { db } from "../db";
import { tenants, users, bakers } from "@shared/schema";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { generateUniqueSlug } from "../utils";

interface ProvisionBakerInput {
  claimId: string;
  email: string;
  name: string;
  marketplaceVendorId?: string;
}

interface ProvisionBakerOutput {
  tenantId: string;
  userId: string;
  bakerId: string;
  tempPassword: string;
}

export async function provisionBakerFromClaim(
  input: ProvisionBakerInput
): Promise<ProvisionBakerOutput> {
  const { claimId, email, name, marketplaceVendorId } = input;

  // Generate temporary password (12 char alphanumeric)
  const tempPassword = randomBytes(8).toString('hex').substring(0, 12);
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // Pre-check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (existingUser) {
    throw new Error(`User with email ${email} already exists`);
  }

  // Generate unique subdomain from name
  const baseSubdomain = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Check if tenant already exists with this subdomain
  let subdomain = baseSubdomain;
  let counter = 1;
  while (true) {
    const existing = await db.query.tenants.findFirst({
      where: (tenants, { eq }) => eq(tenants.subdomain, subdomain),
    });
    if (!existing) break;
    subdomain = `${baseSubdomain}-${counter}`;
    counter++;
  }

  // Generate unique baker slug
  const bakerSlug = await generateUniqueSlug(name, async (slug: string) => {
    const existing = await db.query.bakers.findFirst({
      where: (bakers, { eq }) => eq(bakers.slug, slug),
    });
    return !!existing;
  });

  // ATOMIC TRANSACTION: Create tenant, user, and baker in a single transaction
  const result = await db.transaction(async (tx) => {
    // 1. Create Tenant
    const [tenant] = await tx
      .insert(tenants)
      .values({
        name: name,
        subdomain: subdomain,
        contactEmail: email,
        subscriptionPlan: 'basic',
        subscriptionStatus: 'active',
        isActive: true,
      })
      .returning();

    console.log('[Provisioning] Created tenant:', {
      id: tenant.id,
      subdomain: tenant.subdomain,
      claimId,
    });

    // 2. Create User (role: baker)
    const username = email.split('@')[0] + '-' + randomBytes(4).toString('hex');
    
    const [user] = await tx
      .insert(users)
      .values({
        username: username,
        email: email,
        passwordHash: passwordHash,
        role: 'baker',
        isActive: true,
      })
      .returning();

    console.log('[Provisioning] Created user:', {
      id: user.id,
      email: user.email,
      role: user.role,
      claimId,
    });

    // 3. Create Baker Profile
    const [baker] = await tx
      .insert(bakers)
      .values({
        name: name,
        slug: bakerSlug,
        email: email,
        address: '', // Will be filled in later by baker
        tenantId: tenant.id,
        subscriptionPlan: 'starter',
        isActive: true,
        subdomain: subdomain,
      })
      .returning();

    console.log('[Provisioning] Created baker:', {
      id: baker.id,
      slug: baker.slug,
      tenantId: baker.tenantId,
      claimId,
    });

    return {
      tenant,
      user,
      baker,
    };
  });

  // Return provisioned IDs and temp password
  return {
    tenantId: result.tenant.id,
    userId: result.user.id,
    bakerId: result.baker.id,
    tempPassword: tempPassword,
  };
}
