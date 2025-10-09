import rateLimit from "express-rate-limit";

const base = (max: number) => rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests. Please try again later." },
});

export const aiLimiter = base(Number(process.env.AI_ROUTE_RATE_LIMIT_PER_10M || 120));
export const aiPublicLimiter = base(Number(process.env.AI_PUBLIC_ROUTE_RATE_LIMIT_PER_10M || 40));
