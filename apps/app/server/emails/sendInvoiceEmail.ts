import { db } from '../db';
import { invoices, customers, bakers } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '../emailService';
import { invoiceEmail } from './invoiceEmail';

export async function sendInvoiceEmail(invoiceId: string): Promise<boolean> {
  try {
    // Load invoice with related data
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
    
    if (!invoice) {
      console.error('Invoice not found:', invoiceId);
      return false;
    }

    // Load customer and baker
    const [customer] = invoice.customerId 
      ? await db.select().from(customers).where(eq(customers.id, invoice.customerId))
      : [null];
    
    const [baker] = invoice.bakerId
      ? await db.select().from(bakers).where(eq(bakers.id, invoice.bakerId))
      : [null];

    if (!customer || !baker) {
      console.error('Customer or baker not found for invoice:', invoiceId);
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    const invoiceLink = `${frontendUrl}/customer-portal?invoice=${invoiceId}`;
    const paymentLink = `${frontendUrl}/customer-portal?invoice=${invoiceId}&action=pay`;

    // Render email template
    const { subject, html, text } = invoiceEmail({
      customerName: customer.name,
      bakerName: baker.name,
      businessName: baker.businessName || undefined,
      invoiceTitle: invoice.title,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      dueDate: invoice.dueDate || undefined,
      paymentLink
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
      console.log(`✅ Invoice email sent to ${customer.email} for invoice ${invoiceId}`);
      
      // Update invoice status to 'sent'
      await db.update(invoices)
        .set({ 
          status: 'sent',
          sentAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(invoices.id, invoiceId));
    }

    return emailSent;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return false;
  }
}
