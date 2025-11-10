import Stripe from 'stripe';
import { Request } from 'express';
import { db } from '../db.js';
import { webhookEvents, bakers } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from './logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  req: Request,
  signature: string
): Stripe.Event | null {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET not configured');
    return null;
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
    return event;
  } catch (error) {
    logger.error('Webhook signature verification failed', error);
    return null;
  }
}

/**
 * Check if webhook event has already been processed (idempotency)
 */
export async function isEventProcessed(stripeEventId: string): Promise<boolean> {
  try {
    const [existing] = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.stripeEventId, stripeEventId))
      .limit(1);

    return !!existing;
  } catch (error) {
    logger.error('Failed to check event processing status', error, { stripeEventId });
    return false;
  }
}

/**
 * Record webhook event processing
 */
export async function recordWebhookEvent(
  stripeEventId: string,
  eventType: string,
  payload: any,
  processed: boolean = true,
  error?: string
): Promise<void> {
  try {
    await db.insert(webhookEvents).values({
      stripeEventId,
      eventType,
      payload,
      processed,
      processedAt: processed ? new Date() : null,
      error: error || null,
    });

    logger.info('Webhook event recorded', { stripeEventId, eventType, processed });
  } catch (err) {
    logger.error('Failed to record webhook event', err, { stripeEventId, eventType });
  }
}

/**
 * Handle subscription created event
 */
export async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  try {
    const customerId = subscription.customer as string;
    const status = subscription.status;
    const planId = subscription.items.data[0]?.price.id;

    logger.info('Processing subscription.created', {
      subscriptionId: subscription.id,
      customerId,
      status,
      planId,
    });

    // Update baker's subscription status
    // This assumes you store Stripe customer ID in the bakers table
    await db
      .update(bakers)
      .set({
        subscriptionStatus: status,
        stripeSubscriptionId: subscription.id,
        updatedAt: new Date(),
      })
      .where(eq(bakers.stripeCustomerId as any, customerId));

  } catch (error) {
    logger.error('Failed to handle subscription.created', error, {
      subscriptionId: subscription.id,
    });
    throw error;
  }
}

/**
 * Handle subscription updated event
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  try {
    const customerId = subscription.customer as string;
    const status = subscription.status;

    logger.info('Processing subscription.updated', {
      subscriptionId: subscription.id,
      customerId,
      status,
    });

    await db
      .update(bakers)
      .set({
        subscriptionStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(bakers.stripeCustomerId as any, customerId));

  } catch (error) {
    logger.error('Failed to handle subscription.updated', error, {
      subscriptionId: subscription.id,
    });
    throw error;
  }
}

/**
 * Handle subscription deleted event
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  try {
    const customerId = subscription.customer as string;

    logger.info('Processing subscription.deleted', {
      subscriptionId: subscription.id,
      customerId,
    });

    await db
      .update(bakers)
      .set({
        subscriptionStatus: 'canceled',
        stripeSubscriptionId: null,
        updatedAt: new Date(),
      })
      .where(eq(bakers.stripeCustomerId as any, customerId));

  } catch (error) {
    logger.error('Failed to handle subscription.deleted', error, {
      subscriptionId: subscription.id,
    });
    throw error;
  }
}

/**
 * Handle invoice payment failed event
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  try {
    const customerId = invoice.customer as string;
    const subscriptionId = invoice.subscription as string;

    logger.warn('Processing invoice.payment_failed', {
      invoiceId: invoice.id,
      customerId,
      subscriptionId,
      amount: invoice.amount_due,
    });

    // Update subscription status to past_due
    await db
      .update(bakers)
      .set({
        subscriptionStatus: 'past_due',
        updatedAt: new Date(),
      })
      .where(eq(bakers.stripeCustomerId as any, customerId));

    // TODO: Send notification email to baker about failed payment

  } catch (error) {
    logger.error('Failed to handle invoice.payment_failed', error, {
      invoiceId: invoice.id,
    });
    throw error;
  }
}
