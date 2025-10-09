import type { Request, Response } from "express";
import { SuggestPriceInput } from "../schemas/quotes.schema";
import { safe } from "../util/http";
import { chargeCredits } from "../util/credits";

const tenantFrom = (req: any) => (req.session?.tenantId || req.user?.tenantId || "demo-tenant");

const BASE_RATE_PER_SERVING = { buttercream: 6.0, fondant: 8.0 } as const;
const COMPLEXITY_MULT = { basic: 1.0, standard: 1.25, premium: 1.5, couture: 2.0 } as const;
const ADDER = { metallicLeaf: 45, sugarFlorals: 85, ediblePrint: 25, topperCustom: 30 };
const DELIVERY = { base: 25, free_radius_miles: 5, per_mile_after: 2.0 };

function servings(guests: number) { return Math.ceil(guests * 1.1); }
function deliveryFee(miles: number) {
  const extra = Math.max(0, miles - DELIVERY.free_radius_miles);
  return DELIVERY.base + extra * DELIVERY.per_mile_after;
}
function band(total: number) {
  return { low: Math.round(total * 0.92), high: Math.round(total * 1.08) };
}

export const suggestPrice = safe(async (req: Request, res: Response) => {
  const input = SuggestPriceInput.parse(req.body);
  const tenantId = tenantFrom(req);

  try {
    const result = await chargeCredits(tenantId, "quotes.suggest-price", 1, async () => {
      const s = servings(input.guestCount);
      const base = s * BASE_RATE_PER_SERVING[input.icing];
      const mult = COMPLEXITY_MULT[input.complexity];
      const addOns =
        (input.addOns.metallicLeaf ? ADDER.metallicLeaf : 0) +
        (input.addOns.sugarFlorals ? ADDER.sugarFlorals : 0) +
        (input.addOns.ediblePrint   ? ADDER.ediblePrint   : 0) +
        (input.addOns.topperCustom  ? ADDER.topperCustom  : 0);

      const subtotal = base * mult + addOns;
      const ship = deliveryFee(input.deliveryMiles);
      const total = Math.round(subtotal + ship);
      const { low, high } = band(total);

      return {
        servings: s,
        total,
        range: { low, high },
        breakdown: { base, complexityMultiplier: mult, addOnsCost: addOns, deliveryFee: ship },
        notesEcho: input.notes ?? null,
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
