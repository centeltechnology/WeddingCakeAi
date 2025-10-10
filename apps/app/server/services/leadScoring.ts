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
    budget: 0.35,
    recency: 0.25,
    responseSpeed: 0.25,
    sourceQuality: 0.10,
    activity: 0.05
  };

  const now = new Date().getTime();
  const ageHours = Math.max(0, (now - input.createdAt.getTime()) / (1000 * 60 * 60));
  
  const recency = Math.max(0, Math.min(1, 1 - ageHours / 168));
  
  const budget = Math.max(0, Math.min(1, (input.budget ?? 0) / 5000));
  
  const responseSpeed = (() => {
    if (input.respondedMinutes == null) return 0;
    const m = input.respondedMinutes;
    if (m <= 10) return 1.0;
    if (m <= 60) return 0.6;
    if (m <= 360) return 0.2;
    if (m <= 1440) return 0.05;
    return 0;
  })();
  
  const sourceQuality = ((): number => {
    const s = (input.source ?? '').toLowerCase();
    if (['referral', 'returning', 'instagram', 'website'].includes(s)) return 1.0;
    if (['ad', 'facebook', 'tiktok', 'pinterest'].includes(s)) return 0.6;
    if (!s || s === 'unknown') return 0.2;
    return 0.5;
  })();
  
  const activity = input.hasRecentActivity ? 1 : 0;

  const parts: ScoreExplanation[] = [
    {
      factor: 'Budget',
      weight: weights.budget,
      value: budget,
      contribution: weights.budget * budget
    },
    {
      factor: 'Recency',
      weight: weights.recency,
      value: recency,
      contribution: weights.recency * recency
    },
    {
      factor: 'Response Speed',
      weight: weights.responseSpeed,
      value: responseSpeed,
      contribution: weights.responseSpeed * responseSpeed
    },
    {
      factor: 'Source Quality',
      weight: weights.sourceQuality,
      value: sourceQuality,
      contribution: weights.sourceQuality * sourceQuality
    },
    {
      factor: 'Recent Activity',
      weight: weights.activity,
      value: activity,
      contribution: weights.activity * activity
    },
  ];

  const score = Math.round(parts.reduce((sum, part) => sum + part.contribution, 0) * 100);
  
  return { score, explanations: parts };
}

export async function upsertLeadScore(tenantId: string, leadId: string) {
  const [lead] = await db
    .select()
    .from(leads)
    .where(and(eq(leads.id, leadId), eq(leads.tenantId, tenantId)));
  
  if (!lead) return null;

  const budgetNum = lead.budget ? parseInt(lead.budget, 10) : null;
  
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
