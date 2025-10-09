import type { Request, Response } from "express";
import { safe } from "../util/http";

export const draftContract = safe(async (_req: Request, res: Response) => {
  res.json({
    draft: `
This Services Agreement ("Agreement") is made between Baker ("Provider") and Client.
1) Services: Custom cake as outlined in Quote #XXXX.
2) Delivery Window: TBD by Provider; Client to confirm address and time.
3) Changes: Design changes freeze 7 days before event.
4) Allergens: Products may contain or come into contact with common allergens.
5) Payment & Refunds: Non-refundable retainer to secure date; remaining balance due before delivery.
6) Force Majeure: Provider not liable for delays beyond reasonable control.
`.trim(),
  });
});
