import { db } from '../db';
import { invoices, invoiceEvents } from '../../shared/schema';
import { randomUUID } from 'node:crypto';

export async function createDepositInvoice(contract: {
  id: string; tenantId: string; bakerId: string; customerId: string;
  quoteId: string | null; title: string; depositAmount: number | null; eventDate?: string | null;
}) {
  const amount = contract.depositAmount ?? 0;
  const [invoice] = await db.insert(invoices).values({
    tenantId: contract.tenantId,
    bakerId: contract.bakerId,
    customerId: contract.customerId,
    contractId: contract.id,
    quoteId: contract.quoteId,
    invoiceNumber: `INV-${Date.now()}`,
    title: `Deposit - ${contract.title}`,
    subtotal: amount.toString(),
    total: amount.toString(),
    remainingBalance: amount.toString(),
    dueDate: contract.eventDate ?? null,
    status: 'pending'
  }).returning();

  await db.insert(invoiceEvents).values({
    tenantId: contract.tenantId,
    invoiceId: invoice.id,
    type: 'created',
    meta: { source: 'contract.signed' }
  });

  return invoice;
}

export async function createSimpleInvoice(params: {
  tenantId: string;
  bakerId: string;
  customerId?: string | null;
  title: string;
  total: number;
}) {
  const [invoice] = await db.insert(invoices).values({
    tenantId: params.tenantId,
    bakerId: params.bakerId,
    customerId: params.customerId || null,
    invoiceNumber: `INV-${Date.now()}`,
    title: params.title,
    subtotal: params.total.toString(),
    total: params.total.toString(),
    remainingBalance: params.total.toString(),
    status: 'pending'
  }).returning();

  await db.insert(invoiceEvents).values({
    tenantId: params.tenantId,
    invoiceId: invoice.id,
    type: 'created',
    meta: { source: 'manual' }
  });

  return invoice;
}
