import { z } from "zod";

export const SuggestPriceInput = z.object({
  guestCount: z.coerce.number().int().min(5),
  icing: z.enum(["buttercream","fondant"]),
  complexity: z.enum(["basic","standard","premium","couture"]).default("standard"),
  addOns: z.object({
    metallicLeaf: z.boolean().optional().default(false),
    sugarFlorals: z.boolean().optional().default(false),
    ediblePrint: z.boolean().optional().default(false),
    topperCustom: z.boolean().optional().default(false),
  }).default({}),
  deliveryMiles: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});
