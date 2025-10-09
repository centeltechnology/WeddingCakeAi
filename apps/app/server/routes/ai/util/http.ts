import type { Request, Response, NextFunction, RequestHandler } from "express";

export const safe =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error("AI route error:", err);
      res.status(500).json({ error: "AI_service_error", detail: err?.message ?? "unknown_error" });
    });
