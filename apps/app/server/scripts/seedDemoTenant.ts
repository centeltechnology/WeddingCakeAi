import { db } from "../db";
import { tenants, bakers, tenantProfiles, bookingSettings, calculatorSettings } from "../../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateUniqueSlug } from "../utils";

async function checkSlugExists(slug: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: bakers.id })
    .from(bakers)
    .where(eq(bakers.slug, slug))
    .limit(1);
  return !!existing;
}

async function main() {
  console.log('🎂 Seeding demo tenant: Sweet Treats Bakery');

  const email = 'demo@bakeriq.app';
  const password = 'DemoPass123!';
  const name = 'Sweet Treats Bakery';
  const desiredSlug = 'sweet-treats-bakery';

  // 1. Upsert Tenant
  let tenant;
  const existingTenant = await db.select().from(tenants).where(eq(tenants.contactEmail, email)).limit(1);
  
  if (existingTenant.length === 0) {
    [tenant] = await db.insert(tenants).values({
      name,
      subdomain: desiredSlug,
      contactEmail: email,
      contactPhone: '903-555-0123',
      address: '123 Main St, Bullard, TX 75757',
      subscriptionPlan: 'professional',
      subscriptionStatus: 'active',
      isActive: true,
    }).returning();
    console.log('✓ Created tenant:', tenant.id);
  } else {
    tenant = existingTenant[0];
    console.log('✓ Tenant already exists:', tenant.id);
  }

  // 2. Upsert Baker (user account)
  let baker;
  const existingBaker = await db.select().from(bakers).where(eq(bakers.email, email)).limit(1);
  
  if (existingBaker.length === 0) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = await generateUniqueSlug(name, checkSlugExists);

    [baker] = await db.insert(bakers).values({
      name,
      slug,
      email,
      passwordHash: hashedPassword,
      phone: '903-555-0123',
      address: '123 Main St, Bullard, TX 75757',
      tenantId: tenant.id,
      subscriptionPlan: 'professional',
      emailVerified: true, // Auto-verify for demo
      verificationToken: null,
      verificationTokenExpiry: null,
      isActive: true,
    }).returning();
    console.log('✓ Created baker:', baker.id, 'with slug:', baker.slug);
  } else {
    baker = existingBaker[0];
    // Update to ensure verified
    await db.update(bakers)
      .set({ 
        emailVerified: true, 
        verificationToken: null,
        verificationTokenExpiry: null,
        subscriptionPlan: 'professional'
      })
      .where(eq(bakers.id, baker.id));
    console.log('✓ Baker already exists:', baker.id, 'with slug:', baker.slug);
  }

  // 3. Upsert Public Profile (for marketplace /p/:slug)
  const existingProfile = await db.select().from(tenantProfiles).where(eq(tenantProfiles.tenantId, tenant.id)).limit(1);
  
  if (existingProfile.length === 0) {
    await db.insert(tenantProfiles).values({
      tenantId: tenant.id,
      displayName: name,
      phone: '903-555-0123',
      address: '123 Main St, Bullard, TX 75757',
      about: 'Custom cakes & desserts for every occasion. Specializing in wedding cakes, birthday cakes, and custom designs.',
      specialties: ['Wedding Cakes', 'Birthday Cakes', 'Custom Designs'],
      logoUrl: null, // Can be added later via media library
      isPublished: true, // Make it publicly visible
    });
    console.log('✓ Created published tenant profile');
  } else {
    await db.update(tenantProfiles)
      .set({ isPublished: true })
      .where(eq(tenantProfiles.tenantId, tenant.id));
    console.log('✓ Tenant profile already exists and is published');
  }

  // 4. Ensure Booking Settings
  const existingBooking = await db.select().from(bookingSettings).where(eq(bookingSettings.tenantId, tenant.id)).limit(1);
  
  if (existingBooking.length === 0) {
    await db.insert(bookingSettings).values({
      tenantId: tenant.id,
      timezone: 'America/Chicago',
      bookingEnabled: true,
      consultationDuration: 60,
      bufferTime: 15,
      advanceBookingDays: 30,
    });
    console.log('✓ Created booking settings');
  } else {
    console.log('✓ Booking settings already exist');
  }

  // 5. Ensure Calculator Settings
  const existingCalc = await db.select().from(calculatorSettings).where(eq(calculatorSettings.tenantId, tenant.id)).limit(1);
  
  if (existingCalc.length === 0) {
    await db.insert(calculatorSettings).values({
      tenantId: tenant.id,
      defaults: {
        taxRate: 8.25,
        deliveryFee: 25,
        cakeSizes: [
          { id: '1', name: '6-inch', servings: 8, basePrice: 45 },
          { id: '2', name: '8-inch', servings: 16, basePrice: 65 },
          { id: '3', name: '10-inch', servings: 30, basePrice: 95 },
        ]
      },
      theme: {
        primaryColor: '#7c2d12',
        accentColor: '#f97316',
      }
    });
    console.log('✓ Created calculator settings');
  } else {
    console.log('✓ Calculator settings already exist');
  }

  console.log('\n🎉 DEMO TENANT READY');
  console.log('=====================================');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Baker Slug:', baker.slug);
  console.log('Login at: /login');
  console.log(`Marketplace: /p/${baker.slug}`);
  console.log(`Booking: /b/${baker.slug}/book`);
  console.log(`Calculator: /calculator?tenant=${baker.slug}`);
  console.log('=====================================\n');

  process.exit(0);
}

main().catch((error) => {
  console.error('Seed error:', error);
  process.exit(1);
});
