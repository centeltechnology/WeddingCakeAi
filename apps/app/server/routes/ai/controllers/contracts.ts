import type { Request, Response } from "express";
import { safe } from "../util/http";
import { chargeCredits } from "../util/credits";

const tenantFrom = (req: any) => (req.session?.tenantId || req.user?.tenantId || "demo-tenant");

export const draftContract = safe(async (req: Request, res: Response) => {
  const tenantId = tenantFrom(req);

  try {
    const result = await chargeCredits(tenantId, "contracts.draft", 4, async () => {
      return {
        draft: `
This Services Agreement ("Agreement") is made between Baker ("Provider") and Client.
1) Services: Custom cake as outlined in Quote #XXXX.
2) Delivery Window: TBD by Provider; Client to confirm address and time.
3) Changes: Design changes freeze 7 days before event.
4) Allergens: Products may contain or come into contact with common allergens.
5) Payment & Refunds: Non-refundable retainer to secure date; remaining balance due before delivery.
6) Force Majeure: Provider not liable for delays beyond reasonable control.
`.trim(),
      };
    });

    res.json(result);
  } catch (err: any) {
    if (err.code === 402) {
      return res.status(402).json({ 
        error: "insufficient_credits", 
        have: err.have, 
        need: err.need, 
        topup: true 
      });
    }
    throw err;
  }
});
