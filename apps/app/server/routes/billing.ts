import type { Express, Request, Response } from "express";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { db } from "../db";
import { aiBalances } from "../../shared/schema";
import { eq } from "drizzle-orm";

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const PACKS: Record<string, number> = { "200": 200, "500": 500, "1000": 1000 };

function tenantFrom(req: any): string {
  return req?.session?.tenant_id || req?.session?.tenantId || req?.user?.tenantId || "demo-tenant";
}

export function registerBillingRoutes(app: Express) {
  const r = Router();

  // CSRF middleware in your app should protect this already.
  r.post("/topup", limiter, async (req: Request, res: Response) => {
    try {
      const { pack } = req.body || {};
      const add = PACKS[String(pack)] || 0;
      if (!add) return res.status(400).json({ error: "invalid_pack", allowed: Object.keys(PACKS) });

      const tenantId = tenantFrom(req);

      // upsert-ish: try update; if no row, insert with defaults then update
      const updated = await db.transaction(async (tx) => {
        const [row] = await tx.select().from(aiBalances).where(eq(aiBalances.tenantId, tenantId)).limit(1);
        if (!row) {
          // seed with zero if missing
          await tx.insert(aiBalances).values({
            tenantId,
            creditsBalance: add,
            rolloverCap: add, // can tune later
            cycleEnd: new Date(Date.now() + 30*24*3600*1000).toISOString()
          });
          return { balance: add };
        } else {
          const newBal = (row.creditsBalance || 0) + add;
          await tx.update(aiBalances)
            .set({ creditsBalance: newBal })
            .where(eq(aiBalances.tenantId, tenantId));
          return { balance: newBal };
        }
      });

      return res.json({ ok: true, balance: updated.balance, added: add });
    } catch (e:any) {
      console.error("topup_error", e);
      return res.status(500).json({ error: "topup_failed", detail: e?.message || "unknown" });
    }
  });

  app.use("/api/billing", r);
}
