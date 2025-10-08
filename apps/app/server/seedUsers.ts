import bcrypt from "bcryptjs";
import { db } from "./db.js";
import { users, bakers, tenants } from "../shared/schema.js";
import { eq } from "drizzle-orm";

async function run() {
  const email = "demo@bakeriq.app";
  const pass = "DemoPass123!";
  const hash = await bcrypt.hash(pass, 10);

  console.log("Starting seed...");

  // 1. Upsert tenant
  const tenantId = "tenant-demo-1";
  const existingTenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  
  if (existingTenant.length === 0) {
    await db.insert(tenants).values({
      id: tenantId,
      name: "Demo Tenant",
      subdomain: "demo-tenant",
      contactEmail: email,
      contactPhone: "555-0100",
      address: "123 Demo Street, Demo City, DC 12345",
      subscriptionPlan: "basic",
      subscriptionStatus: "active",
      isActive: true,
    });
    console.log("✓ Created tenant:", tenantId);
  } else {
    console.log("✓ Tenant already exists:", tenantId);
  }

  // 2. Upsert user
  const userId = "user-demo-1";
  const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: userId,
      username: "Demo Baker",
      email,
      passwordHash: hash,
      role: "baker",
      isActive: true,
    });
    console.log("✓ Created user:", userId);
  } else {
    console.log("✓ User already exists:", userId);
  }

  // 3. Upsert baker
  const bakerId = "baker-demo-1";
  const existingBaker = await db.select().from(bakers).where(eq(bakers.id, bakerId)).limit(1);
  
  if (existingBaker.length === 0) {
    await db.insert(bakers).values({
      id: bakerId,
      name: "Demo Baker",
      email,
      address: "123 Demo Bakery Lane, Cake City, CC 12345",
      phone: "555-0100",
      tenantId,
      subscriptionPlan: "starter",
      isActive: true,
    });
    console.log("✓ Created baker:", bakerId);
  } else {
    console.log("✓ Baker already exists:", bakerId);
  }

  console.log("\n=== Seed Complete ===");
  console.log("Email:", email);
  console.log("Password:", pass);
  console.log("====================\n");
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });
