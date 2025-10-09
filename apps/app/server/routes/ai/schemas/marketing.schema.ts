import { z } from "zod";

export const CaptionInput = z.object({
  tags: z.array(z.string()).min(1),
  tone: z.enum(["friendly","elegant","playful","lux"]).default("elegant"),
  hashtags: z.boolean().default(true),
  maxChars: z.coerce.number().min(60).max(2200).default(280),
});

export const CopyInput = z.object({
  section: z.enum(["about","email_signature","promo","seo_meta"]),
  context: z.string().optional(),
  tone: z.enum(["friendly","formal","elegant","lux","playful"]).default("friendly"),
  maxChars: z.coerce.number().min(60).max(2000).default(400),
});
