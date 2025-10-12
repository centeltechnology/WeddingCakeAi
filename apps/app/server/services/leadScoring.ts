import { db } from '../db';
import { leads, leadScores } from '../../shared/schema';
import { sql, eq, and } from 'drizzle-orm';

type ScoreExplanation = {
  factor: string;
  weight: number;
  value: number;
  contribution: number;
};

type ScoreInput = {
  createdAt: Date;
  budget?: number | null;
  source?: string | null;
  respondedMinutes?: number | null;
  hasRecentActivity?: boolean;
};

type ScoreResult = {
  score: number;
  explanations: ScoreExplanation[];
};

export function computeLeadScore(input: ScoreInput): ScoreResult {
  const weights = {
    recency: 0.40,        // 40% - How recent the lead is
    budget: 0.25,         // 25% - Lead budget value
    engagement: 0.20,     // 20% - Response speed/interaction
    completeness: 0.15    // 15% - Data completeness
  };

  const now = new Date().getTime();
  const ageHours = Math.max(0, (now - input.createdAt.getTime()) / (1000 * 60 * 60));
  
  const recency = Math.max(0, Math.min(1, 1 - ageHours / 168));
  
  const budget = Math.max(0, Math.min(1, (input.budget ?? 0) / 5000));
  
  const engagement = (() => {
    if (input.respondedMinutes == null) return 0;
    const m = input.respondedMinutes;
    if (m <= 10) return 1.0;
    if (m <= 60) return 0.6;
    if (m <= 360) return 0.2;
    if (m <= 1440) return 0.05;
    return 0;
  })();
  
  const completeness = ((): number => {
    const s = (input.source ?? '').toLowerCase();
    if (['referral', 'returning', 'instagram', 'website'].includes(s)) return 1.0;
    if (['ad', 'facebook', 'tiktok', 'pinterest'].includes(s)) return 0.6;
    if (!s || s === 'unknown') return 0.2;
    return 0.5;
  })();

  const parts: ScoreExplanation[] = [
    {
      factor: 'Recency (40%)',
      weight: weights.recency,
      value: recency,
      contribution: weights.recency * recency
    },
    {
      factor: 'Budget (25%)',
      weight: weights.budget,
      value: budget,
      contribution: weights.budget * budget
    },
    {
      factor: 'Engagement (20%)',
      weight: weights.engagement,
      value: engagement,
      contribution: weights.engagement * engagement
    },
    {
      factor: 'Completeness (15%)',
      weight: weights.completeness,
      value: completeness,
      contribution: weights.completeness * completeness
    },
  ];

  const score = Math.round(parts.reduce((sum, part) => sum + part.contribution, 0) * 100);
  
  return { score, explanations: parts };
}

function parseBudgetToNumber(budgetStr: string | null | undefined): number | null {
  if (!budgetStr) return null;
  
  // Map budget range strings to numeric values (use midpoint of range)
  const budgetMap: Record<string, number> = {
    'under-500': 400,
    '500-1000': 750,
    '1000-2000': 1500,
    '2000-3000': 2500,
    'over-3000': 4000
  };
  
  // Try to match budget string from dropdown
  const normalized = budgetStr.toLowerCase().trim();
  if (budgetMap[normalized]) {
    return budgetMap[normalized];
  }
  
  // Fallback: try to parse as number (for legacy numeric budgets)
  const parsed = parseInt(budgetStr, 10);
  return isNaN(parsed) ? null : parsed;
}

export async function upsertLeadScore(tenantId: string, leadId: string) {
  const [lead] = await db
    .select()
    .from(leads)
    .where(and(eq(leads.id, leadId), eq(leads.tenantId, tenantId)));
  
  if (!lead) return null;

  const budgetNum = parseBudgetToNumber(lead.budget);
  
  const model = computeLeadScore({
    createdAt: lead.createdAt!,
    budget: budgetNum,
    source: lead.source,
    respondedMinutes: null,
    hasRecentActivity: false,
  });

  const [row] = await db
    .insert(leadScores)
    .values({
      leadId,
      tenantId,
      score: model.score,
      explanations: model.explanations
    })
    .onConflictDoUpdate({
      target: [leadScores.leadId],
      set: {
        score: model.score,
        explanations: model.explanations,
        computedAt: sql`now()`
      }
    })
    .returning();
  
  return row;
}
