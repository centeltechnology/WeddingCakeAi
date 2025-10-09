import type { Express } from "express";
import { Router } from "express";
import { aiLimiter, aiPublicLimiter } from "./util/limiter";
import { autoresponder, leadScore } from "./controllers/leads";
import { suggestPrice } from "./controllers/quotes";
import { captionForImage, marketingCopy } from "./controllers/marketing";
import { draftContract } from "./controllers/contracts";

export function registerAiRoutes(app: Express) {
  const r = Router();

  // Dashboard (CSRF-protected) routes
  r.post("/leads/autoresponder", aiLimiter, autoresponder);
  r.post("/leads/score", aiLimiter, leadScore);
  r.post("/quotes/suggest-price", aiLimiter, suggestPrice);
  r.post("/marketing/caption", aiLimiter, captionForImage);
  r.post("/marketing/copy", aiLimiter, marketingCopy);
  r.post("/contracts/draft", aiLimiter, draftContract);

  app.use("/api/ai", r);

  // Optional public routes (CSRF-exempt in your app if you whitelist /api/bakers/public/*)
  // app.post("/api/bakers/public/ai/marketing/caption", aiPublicLimiter, captionForImage);
}
