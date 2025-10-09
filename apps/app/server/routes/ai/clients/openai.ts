import OpenAI from "openai";

const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const apiKey = process.env.OPENAI_API_KEY || "";

export const openai = new OpenAI({ apiKey, baseURL });

export const AI_DEFAULT_MODEL = process.env.AI_DEFAULT_MODEL || "gpt-4.1-mini";
export const AI_STRICT_MODEL  = process.env.AI_STRICT_MODEL  || "gpt-4.1";
export const AI_MAX_INPUT_TOKENS  = Number(process.env.AI_MAX_INPUT_TOKENS || 8000);
export const AI_MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS || 800);
