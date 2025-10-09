import type { Request, Response } from "express";
import { openai, AI_DEFAULT_MODEL, AI_MAX_OUTPUT_TOKENS } from "../clients/openai";
import { CaptionInput, CopyInput } from "../schemas/marketing.schema";
import { safe } from "../util/http";
import { chargeCredits } from "../util/credits";

const tenantFrom = (req: any) => (req.session?.tenantId || req.user?.tenantId || "demo-tenant");

export const captionForImage = safe(async (req: Request, res: Response) => {
  const { tags, tone, hashtags, maxChars } = CaptionInput.parse(req.body);
  const tenantId = tenantFrom(req);

  try {
    const result = await chargeCredits(tenantId, "marketing.caption", 1, async () => {
      const system = "You write concise, engaging Instagram captions for a bakery.";
      const user = `
Tone: ${tone}
Tags: ${tags.join(", ")}
Max Length: ${maxChars}
Include Hashtags: ${hashtags ? "yes" : "no"}

Write 1 caption. If hashtags are included, put 4–8 tasteful hashtags at the end.
`.trim();

      const completion = await openai.chat.completions.create({
        model: AI_DEFAULT_MODEL,
        max_tokens: AI_MAX_OUTPUT_TOKENS,
        temperature: 0.8,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      });

      return { caption: completion.choices?.[0]?.message?.content?.trim() ?? "" };
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

export const marketingCopy = safe(async (req: Request, res: Response) => {
  const { section, context, tone, maxChars } = CopyInput.parse(req.body);
  const tenantId = tenantFrom(req);

  try {
    const result = await chargeCredits(tenantId, "marketing.copy", 2, async () => {
      const system = "You are a brand copywriter for a boutique bakery marketplace.";
      const user = `
Section: ${section}
Tone: ${tone}
Max: ${maxChars} chars
Context:
${context ?? "N/A"}

Write polished copy that fits the section and length.
`.trim();

      const completion = await openai.chat.completions.create({
        model: AI_DEFAULT_MODEL,
        max_tokens: AI_MAX_OUTPUT_TOKENS,
        temperature: 0.7,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      });

      return { copy: completion.choices?.[0]?.message?.content?.trim() ?? "" };
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
