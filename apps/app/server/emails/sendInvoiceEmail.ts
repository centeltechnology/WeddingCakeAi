import { db } from '../db';
import { invoices, customers, bakers } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '../emailService';

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

    // Send email to customer
    const emailSent = await sendEmail({
      to: customer.email,
      toName: customer.name,
      from: baker.email,
      fromName: baker.businessName || baker.name,
      subject: `Invoice ${invoice.invoiceNumber} - Payment Due`,
      textPart: `Your invoice is ready.

Invoice: ${invoice.title}
Invoice Number: ${invoice.invoiceNumber}
Amount Due: $${invoice.total}
${invoice.dueDate ? `Due Date: ${invoice.dueDate}` : ''}

View and pay your invoice here: ${paymentLink}

— ${baker.businessName || baker.name}`,
      htmlPart: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px; background-color: #FF6A00; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                ${baker.businessName || baker.name}
              </h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; color: #111111; font-size: 24px; font-weight: 600;">
                Your Invoice is Ready! 💳
              </h2>
              
              <p style="margin: 0 0 24px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hi ${customer.name},
              </p>
              
              <p style="margin: 0 0 24px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Your invoice is ready for payment. Please review the details below:
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 24px 0; background-color: #f9f9f9; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Invoice:</strong> ${invoice.title}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Invoice Number:</strong> ${invoice.invoiceNumber}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 20px;">
                    <strong style="color: #111111;">Amount Due:</strong> 
                    <span style="color: #FF6A00; font-weight: 700;">$${invoice.total}</span>
                  </td>
                </tr>
                ${invoice.dueDate ? `
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Due Date:</strong> ${invoice.dueDate}
                  </td>
                </tr>
                ` : ''}
              </table>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 8px; background-color: #FF6A00;">
                    <a href="${paymentLink}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Pay Now
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link:
              </p>
              
              <p style="margin: 8px 0 0 0; padding: 12px; background-color: #FFD7BF; border-radius: 6px; word-break: break-all;">
                <a href="${paymentLink}" style="color: #111111; font-size: 14px; text-decoration: none;">${paymentLink}</a>
              </p>

              <p style="margin: 24px 0 0 0; color: #888888; font-size: 14px; line-height: 1.6;">
                Questions? Reply to this email or contact us directly.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #888888; font-size: 12px; line-height: 1.5; text-align: center;">
                © ${new Date().getFullYear()} ${baker.businessName || baker.name}. Powered by BakerIQ.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim()
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
