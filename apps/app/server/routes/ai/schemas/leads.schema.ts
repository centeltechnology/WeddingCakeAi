import { z } from "zod";

export const LeadAutoResponderInput = z.object({
  bakeryName: z.string().min(1),
  customerName: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.string().optional(),
  guestCount: z.coerce.number().int().min(1).optional(),
  styleNotes: z.string().optional(),
  tone: z.enum(["friendly","formal","lux","casual"]).default("friendly"),
  emailSignature: z.string().optional(),
});

export const LeadScoreInput = z.object({
  eventDate: z.string().optional(),
  budgetBand: z.enum(["low","mid","high"]).optional(),
  guestCount: z.coerce.number().int().min(1).optional(),
  distanceMiles: z.coerce.number().min(0).optional(),
  specialRequests: z.string().optional(),
});
