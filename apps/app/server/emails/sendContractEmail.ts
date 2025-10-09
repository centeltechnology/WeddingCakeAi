import { db } from '../db';
import { contracts, customers, bakers } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '../emailService';
import { contractEmail } from './contractEmail';
import { randomBytes } from 'crypto';

export async function sendContractEmail(contractId: string): Promise<boolean> {
  try {
    // Load contract with related data
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, contractId));
    
    if (!contract) {
      console.error('Contract not found:', contractId);
      return false;
    }

    // Load customer and baker
    const [customer] = contract.customerId 
      ? await db.select().from(customers).where(eq(customers.id, contract.customerId))
      : [null];
    
    const [baker] = contract.bakerId
      ? await db.select().from(bakers).where(eq(bakers.id, contract.bakerId))
      : [null];

    if (!customer || !baker) {
      console.error('Customer or baker not found for contract:', contractId);
      return false;
    }

    // Generate approval token if not exists
    let approvalToken = contract.approvalToken;
    if (!approvalToken) {
      approvalToken = randomBytes(16).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      await db.update(contracts)
        .set({ 
          approvalToken,
          approvalTokenExpiresAt: expiresAt 
        })
        .where(eq(contracts.id, contractId));
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    const approvalLink = `${frontendUrl}/c/${contractId}`;

    // Render email template
    const { subject, html, text } = contractEmail({
      customerName: customer.name,
      bakerName: baker.name,
      businessName: baker.businessName || undefined,
      contractTitle: contract.title,
      totalAmount: contract.totalAmount,
      depositAmount: contract.depositAmount,
      eventDate: contract.eventDate || undefined,
      approvalLink
    });

    // Send email to customer
    const emailSent = await sendEmail({
      to: customer.email,
      toName: customer.name,
      from: baker.email,
      fromName: baker.businessName || baker.name,
      subject,
      textPart: text,
      htmlPart: html
    });

    if (emailSent) {
      console.log(`✅ Contract email sent to ${customer.email} for contract ${contractId}`);
      
      // Update contract status to 'sent'
      await db.update(contracts)
        .set({ 
          status: 'sent',
          updatedAt: new Date()
        })
        .where(eq(contracts.id, contractId));
    }

    return emailSent;
  } catch (error) {
    console.error('Error sending contract email:', error);
    return false;
  }
}
