import { db } from '../db';
import { contracts, contractEvents } from '../../shared/schema';
import { randomUUID } from 'node:crypto';

export async function createContractFromQuote(quote: {
  id: string; tenantId: string; bakerId: string; customerId: string;
  title: string; total: number; depositAmount: number | null; eventDate?: string | null;
}) {
  const [contract] = await db.insert(contracts).values({
    tenantId: quote.tenantId,
    bakerId: quote.bakerId,
    customerId: quote.customerId,
    quoteId: quote.id,
    contractNumber: `C-${Date.now()}`,
    title: `Contract - ${quote.title}`,
    content: `<p>Contract for ${quote.title}</p>`,
    totalAmount: quote.total.toString(),
    depositAmount: quote.depositAmount?.toString() ?? '0',
    eventDate: quote.eventDate ?? null,
    status: 'draft'
  }).returning();

  await db.insert(contractEvents).values({
    tenantId: quote.tenantId,
    contractId: contract.id,
    type: 'created',
    meta: { source: 'quote.approved' }
  });

  return contract;
}
