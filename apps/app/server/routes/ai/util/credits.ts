import { db } from "../../../db";
import { aiBalances, aiUsage } from "../../../../shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function getBalance(tenantId: string) {
  const [row] = await db.select().from(aiBalances).where(eq(aiBalances.tenantId, tenantId)).limit(1);
  return row || null;
}

export async function ensureTenantBalance(tenantId: string, defaults: { initial: number; rolloverCap: number; cycleEnd: Date }) {
  const existing = await getBalance(tenantId);
  if (existing) return existing;
  await db.insert(aiBalances).values({
    tenantId,
    creditsBalance: defaults.initial,
    rolloverCap: defaults.rolloverCap,
    cycleEnd: defaults.cycleEnd.toISOString()
  });
  return getBalance(tenantId);
}

// charges credits and writes usage atomically
export async function chargeCredits<T>(tenantId: string, feature: string, credits: number, run: () => Promise<T>): Promise<T> {
  return await db.transaction(async (tx) => {
    const [row] = await tx.select().from(aiBalances).where(eq(aiBalances.tenantId, tenantId)).limit(1);
    if (!row || row.creditsBalance < credits) {
      throw Object.assign(new Error("insufficient_credits"), { code: 402, have: row?.creditsBalance ?? 0, need: credits });
    }
    await tx.update(aiBalances)
      .set({ creditsBalance: row.creditsBalance - credits })
      .where(eq(aiBalances.tenantId, tenantId));

    try {
      const result = await run();
      await tx.insert(aiUsage).values({
        tenantId, feature, credits
      });
      return result;
    } catch (e) {
      // refund on failure
      await tx.update(aiBalances)
        .set({ creditsBalance: row.creditsBalance })
        .where(eq(aiBalances.tenantId, tenantId));
      throw e;
    }
  });
}
