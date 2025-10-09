import type { Request, Response } from "express";
import { openai, AI_DEFAULT_MODEL, AI_MAX_OUTPUT_TOKENS } from "../clients/openai";
import { LeadAutoResponderInput, LeadScoreInput } from "../schemas/leads.schema";
import { safe } from "../util/http";

export const autoresponder = safe(async (req: Request, res: Response) => {
  const parsed = LeadAutoResponderInput.parse(req.body);
  const { bakeryName, customerName, eventType, eventDate, guestCount, styleNotes, tone, emailSignature } = parsed;

  const system = "You write concise, warm first-replies for a bakery. Keep it under 140 words. Ask 1-2 clarifying questions.";
  const user = `
Bakery: ${bakeryName}
Tone: ${tone}
Lead: { name: ${customerName ?? "N/A"}, eventType: ${eventType ?? "unknown"}, eventDate: ${eventDate ?? "unknown"}, guests: ${guestCount ?? "unknown"} }
Style notes: ${styleNotes ?? "N/A"}
Signature: ${emailSignature ?? ""}

Write a first reply email (no subject line), short paragraphs, include a friendly CTA to share inspo photos and confirm date.
  `.trim();

  const completion = await openai.chat.completions.create({
    model: AI_DEFAULT_MODEL,
    max_tokens: AI_MAX_OUTPUT_TOKENS,
    temperature: 0.6,
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
  });

  res.json({ reply: completion.choices?.[0]?.message?.content?.trim() ?? "" });
});

export const leadScore = safe(async (req: Request, res: Response) => {
  const parsed = LeadScoreInput.parse(req.body);
  let score = 50;
  if (parsed.guestCount && parsed.guestCount >= 100) score += 15;
  if (parsed.budgetBand === "high") score += 20;
  if ((parsed.distanceMiles ?? 0) > 25) score -= 10;
  if (parsed.specialRequests?.toLowerCase().includes("sugar")) score += 5;
  res.json({ score: Math.max(0, Math.min(100, score)) });
});
