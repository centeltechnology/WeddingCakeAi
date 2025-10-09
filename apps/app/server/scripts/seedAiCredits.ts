import { db } from "../db";
import { aiBalances } from "../../shared/schema";
import { sql, eq } from "drizzle-orm";

async function main() {
  const tenantId = process.env.SEED_TENANT_ID || "demo-tenant";
  const cycleEnd = new Date();
  cycleEnd.setMonth(cycleEnd.getMonth() + 1);
  
  console.log(`Seeding AI credits for tenant: ${tenantId}`);
  console.log(`Credits: 400, Cycle End: ${cycleEnd.toISOString()}`);
  
  await db.insert(aiBalances)
    .values({
      tenantId,
      creditsBalance: 400,
      rolloverCap: 400,
      cycleEnd: cycleEnd.toISOString()
    })
    .onConflictDoNothing();
  
  console.log("✓ Seeded AI credits for", tenantId);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
