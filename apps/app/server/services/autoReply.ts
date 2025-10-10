import { db } from '../db';
import { autoReplySettings, autoReplyTemplates, autoReplyRules, autoReplyLogs, leads } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { format } from 'date-fns';

// In-memory rate limiting (simple implementation)
const rateLimitStore = new Map<string, { count: number; resetAt: number; lastSent: Map<string, number> }>();

const RATE_LIMITS = {
  maxPerTenant: 50, // max sends per tenant per day
  maxPerLead: 1, // max auto-replies per lead per 12 hours
  leadCooldownHours: 12,
};

/**
 * Render template with variable substitution
 */
export async function renderTemplate(body: string, vars: Record<string, any>): Promise<string> {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return vars?.[key] ?? '';
  });
}

/**
 * Send auto-reply email (stub-safe)
 */
export async function sendAutoReplyEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; id: string; error?: string }> {
  // If no provider configured, log and return ok
  if (!process.env.EMAIL_PROVIDER) {
    console.log('[AUTO-REPLY EMAIL STUB]', { to, subject, bodyLength: html.length });
    return { ok: true, id: `stub-${Date.now()}` };
  }

  // TODO: Wire real provider (SES, Resend, etc.)
  try {
    // Add your email provider integration here
    // Example: await sendgridClient.send({ to, subject, html });
    console.log('[AUTO-REPLY EMAIL]', { to, subject });
    return { ok: true, id: `provider-${Date.now()}` };
  } catch (error: any) {
    console.error('[AUTO-REPLY EMAIL ERROR]', error);
    return { ok: false, id: '', error: error.message };
  }
}

/**
 * Send auto-reply SMS (stub)
 */
export async function sendAutoReplySMS(to: string, body: string): Promise<{ ok: boolean; id: string; error?: string }> {
  // SMS stub - not implemented yet
  console.log('[AUTO-REPLY SMS STUB]', { to, bodyLength: body.length });
  return { ok: true, id: `sms-stub-${Date.now()}` };
}

/**
 * Check if current time is within quiet hours
 * Note: Uses server local time - for production, integrate with timezone library
 */
export function isWithinQuietHours(timezone: string, quietHours?: { from: string; to: string }): boolean {
  if (!quietHours?.from || !quietHours?.to) {
    return false;
  }

  try {
    // Use server local time for MVP
    // TODO: For production, integrate proper timezone conversion
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    
    const fromTime = quietHours.from;
    const toTime = quietHours.to;
    
    // Handle cases where quiet hours span midnight
    if (fromTime > toTime) {
      return currentTime >= fromTime || currentTime <= toTime;
    } else {
      return currentTime >= fromTime && currentTime <= toTime;
    }
  } catch (error) {
    console.error('[QUIET HOURS CHECK ERROR]', error);
    return false;
  }
}

/**
 * Check rate limits for a tenant and lead
 */
export function checkRateLimit(tenantId: string, leadId: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  
  // Get or create tenant rate limit data
  if (!rateLimitStore.has(tenantId)) {
    rateLimitStore.set(tenantId, {
      count: 0,
      resetAt: now + 24 * 60 * 60 * 1000, // 24 hours from now
      lastSent: new Map(),
    });
  }
  
  const tenantData = rateLimitStore.get(tenantId)!;
  
  // Reset daily count if expired
  if (now > tenantData.resetAt) {
    tenantData.count = 0;
    tenantData.resetAt = now + 24 * 60 * 60 * 1000;
    tenantData.lastSent.clear();
  }
  
  // Check tenant daily limit
  if (tenantData.count >= RATE_LIMITS.maxPerTenant) {
    return { allowed: false, reason: 'tenant_daily_limit_exceeded' };
  }
  
  // Check per-lead cooldown
  const lastSentTime = tenantData.lastSent.get(leadId);
  if (lastSentTime) {
    const hoursSinceLastSend = (now - lastSentTime) / (1000 * 60 * 60);
    if (hoursSinceLastSend < RATE_LIMITS.leadCooldownHours) {
      return { allowed: false, reason: 'lead_cooldown_active' };
    }
  }
  
  return { allowed: true };
}

/**
 * Record a send for rate limiting
 */
export function recordSend(tenantId: string, leadId: string) {
  const tenantData = rateLimitStore.get(tenantId);
  if (tenantData) {
    tenantData.count++;
    tenantData.lastSent.set(leadId, Date.now());
  }
}

/**
 * Build variables for template rendering from lead data
 */
export function buildTemplateVariables(lead: any): Record<string, any> {
  return {
    customer_name: lead.customer_name || lead.customerName || '',
    customer_email: lead.customer_email || lead.customerEmail || '',
    customer_phone: lead.customer_phone || lead.customerPhone || '',
    event_date: lead.wedding_date || lead.weddingDate || '',
    budget: lead.budget || '',
    lead_source: lead.source || '',
    quote_link: lead.id ? `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/q/${lead.id}` : '',
  };
}

/**
 * Evaluate and execute auto-reply rules for a lead
 */
export async function evaluateAndSendAutoReplies(
  tenantId: string,
  leadId: string,
  trigger: 'new_lead' | 'after_hours' | 'no_response'
): Promise<{ sent: number; skipped: number; failed: number }> {
  const results = { sent: 0, skipped: 0, failed: 0 };

  try {
    // Check if feature is enabled
    if (process.env.AUTO_REPLY_ENABLED !== 'true') {
      console.log('[AUTO-REPLY] Feature disabled');
      return results;
    }

    // Load tenant settings
    const [settings] = await db
      .select()
      .from(autoReplySettings)
      .where(eq(autoReplySettings.tenantId, tenantId))
      .limit(1);

    if (!settings || !settings.enabled) {
      console.log('[AUTO-REPLY] Tenant settings disabled');
      return results;
    }

    // Check quiet hours
    const inQuietHours = isWithinQuietHours(settings.timezone || 'America/Chicago', settings.quietHours || undefined);
    if (inQuietHours) {
      await db.insert(autoReplyLogs).values({
        tenantId,
        leadId,
        channel: 'email',
        toAddress: '',
        status: 'skipped',
        meta: { reason: 'quiet_hours' },
      });
      results.skipped++;
      return results;
    }

    // Check rate limits
    const rateCheck = checkRateLimit(tenantId, leadId);
    if (!rateCheck.allowed) {
      await db.insert(autoReplyLogs).values({
        tenantId,
        leadId,
        channel: 'email',
        toAddress: '',
        status: 'skipped',
        meta: { reason: rateCheck.reason },
      });
      results.skipped++;
      return results;
    }

    // Load active rules for this trigger
    const rules = await db
      .select()
      .from(autoReplyRules)
      .where(
        and(
          eq(autoReplyRules.tenantId, tenantId),
          eq(autoReplyRules.trigger, trigger),
          eq(autoReplyRules.active, true)
        )
      );

    if (rules.length === 0) {
      console.log('[AUTO-REPLY] No active rules for trigger:', trigger);
      return results;
    }

    // Load lead data
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!lead) {
      console.log('[AUTO-REPLY] Lead not found:', leadId);
      return results;
    }

    // Evaluate each rule
    for (const rule of rules) {
      // Check rule conditions
      const conditions = rule.conditions || {};
      
      // Min budget check
      if (conditions.minBudget && lead.budget) {
        const budgetNum = parseFloat(lead.budget.replace(/[^0-9.-]+/g, ''));
        if (budgetNum < conditions.minBudget) {
          continue;
        }
      }

      // Source filter check
      if (conditions.sources && conditions.sources.length > 0) {
        if (!lead.source || !conditions.sources.includes(lead.source)) {
          continue;
        }
      }

      // Load template
      if (!rule.templateId) {
        continue;
      }

      const [template] = await db
        .select()
        .from(autoReplyTemplates)
        .where(eq(autoReplyTemplates.id, rule.templateId))
        .limit(1);

      if (!template) {
        continue;
      }

      // Check if channel is enabled
      const channels = settings.channels || { email: true, sms: false };
      if (template.channel === 'email' && !channels.email) {
        continue;
      }
      if (template.channel === 'sms' && !channels.sms) {
        continue;
      }

      // Build variables and render template
      const variables = buildTemplateVariables(lead);
      const renderedBody = await renderTemplate(template.body, variables);
      const renderedSubject = template.subject ? await renderTemplate(template.subject, variables) : '';

      // Send based on channel
      let sendResult: { ok: boolean; id: string; error?: string };
      const toAddress = template.channel === 'email' ? lead.customerEmail : lead.customerPhone || '';

      if (!toAddress) {
        await db.insert(autoReplyLogs).values({
          tenantId,
          leadId,
          channel: template.channel,
          templateId: template.id,
          ruleId: rule.id,
          toAddress: '',
          status: 'skipped',
          meta: { reason: 'no_recipient_address' },
        });
        results.skipped++;
        continue;
      }

      if (template.channel === 'email') {
        sendResult = await sendAutoReplyEmail(toAddress, renderedSubject, renderedBody);
      } else {
        sendResult = await sendAutoReplySMS(toAddress, renderedBody);
      }

      // Log the result
      const logStatus = sendResult.ok ? 'sent' : 'failed';
      await db.insert(autoReplyLogs).values({
        tenantId,
        leadId,
        channel: template.channel,
        templateId: template.id,
        ruleId: rule.id,
        toAddress,
        status: logStatus,
        meta: sendResult.error ? { error: sendResult.error } : undefined,
      });

      if (sendResult.ok) {
        results.sent++;
        recordSend(tenantId, leadId);
      } else {
        results.failed++;
      }
    }

    return results;
  } catch (error) {
    console.error('[AUTO-REPLY EVALUATION ERROR]', error);
    return results;
  }
}
