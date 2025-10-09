import { db } from '../db';
import { contracts, invoices, contractEvents, invoiceEvents } from '../../shared/schema';
import { sql, and, eq } from 'drizzle-orm';

async function backfill() {
  console.log('Starting backfill of contract and invoice events...');
  
  // Contracts: ensure 'created' exists
  const existingCreatedC = await db.select({ id: contractEvents.contractId }).from(contractEvents)
    .where(eq(contractEvents.type, 'created'));
  const createdSet = new Set(existingCreatedC.map(r => r.id));

  const allContracts = await db.select().from(contracts);
  let contractCreatedCount = 0;
  for (const c of allContracts) {
    if (!createdSet.has(c.id)) {
      await db.insert(contractEvents).values({
        tenantId: c.tenantId,
        contractId: c.id,
        type: 'created',
        meta: { source: 'backfill' }
      });
      contractCreatedCount++;
    }
  }
  console.log(`Created ${contractCreatedCount} 'created' events for contracts`);

  // Contracts: ensure 'signed' exists if status is signed
  const existingSignedC = await db.select({ id: contractEvents.contractId }).from(contractEvents)
    .where(eq(contractEvents.type, 'signed'));
  const signedSet = new Set(existingSignedC.map(r => r.id));

  let contractSignedCount = 0;
  for (const c of allContracts) {
    if (c.status === 'signed' && !signedSet.has(c.id)) {
      await db.insert(contractEvents).values({
        tenantId: c.tenantId,
        contractId: c.id,
        type: 'signed',
        meta: { source: 'backfill', signedAt: c.signedAt ?? null }
      });
      contractSignedCount++;
    }
  }
  console.log(`Created ${contractSignedCount} 'signed' events for contracts`);

  // Invoices: ensure 'created' exists
  const existingCreatedI = await db.select({ id: invoiceEvents.invoiceId }).from(invoiceEvents)
    .where(eq(invoiceEvents.type, 'created'));
  const createdInvSet = new Set(existingCreatedI.map(r => r.id));

  const allInvoices = await db.select().from(invoices);
  let invoiceCreatedCount = 0;
  for (const inv of allInvoices) {
    if (!createdInvSet.has(inv.id)) {
      await db.insert(invoiceEvents).values({
        tenantId: inv.tenantId,
        invoiceId: inv.id,
        type: 'created',
        meta: { source: 'backfill' }
      });
      invoiceCreatedCount++;
    }
  }
  console.log(`Created ${invoiceCreatedCount} 'created' events for invoices`);

  // Invoices: ensure 'paid' exists if status is paid
  const existingPaidI = await db.select({ id: invoiceEvents.invoiceId }).from(invoiceEvents)
    .where(eq(invoiceEvents.type, 'paid'));
  const paidSet = new Set(existingPaidI.map(r => r.id));

  let invoicePaidCount = 0;
  for (const inv of allInvoices) {
    if (inv.status === 'paid' && !paidSet.has(inv.id)) {
      await db.insert(invoiceEvents).values({
        tenantId: inv.tenantId,
        invoiceId: inv.id,
        type: 'paid',
        meta: { source: 'backfill', paidAt: inv.paidAt ?? null }
      });
      invoicePaidCount++;
    }
  }
  console.log(`Created ${invoicePaidCount} 'paid' events for invoices`);

  console.log('Backfill complete.');
}

backfill().then(()=>process.exit(0)).catch((e)=>{ console.error(e); process.exit(1); });
