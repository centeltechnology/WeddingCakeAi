import { db } from '../db';
import { contracts, customers, bakers } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '../emailService';
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

    // Send email to customer
    const emailSent = await sendEmail({
      to: customer.email,
      toName: customer.name,
      from: baker.email,
      fromName: baker.businessName || baker.name,
      subject: `Contract Ready for Review - ${contract.title}`,
      textPart: `Your contract is ready for review.

Contract: ${contract.title}
Total Amount: $${contract.totalAmount}
Deposit Amount: $${contract.depositAmount}

Review and sign your contract here: ${approvalLink}

This link is valid for 7 days.

— ${baker.businessName || baker.name}`,
      htmlPart: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contract Ready for Review</title>
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
                Your Contract is Ready! 📝
              </h2>
              
              <p style="margin: 0 0 24px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hi ${customer.name},
              </p>
              
              <p style="margin: 0 0 24px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Your contract is ready for review and signature. Please review the details below:
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 24px 0; background-color: #f9f9f9; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Contract:</strong> ${contract.title}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Total Amount:</strong> $${contract.totalAmount}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Deposit Amount:</strong> $${contract.depositAmount}
                  </td>
                </tr>
                ${contract.eventDate ? `
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Event Date:</strong> ${contract.eventDate}
                  </td>
                </tr>
                ` : ''}
              </table>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 8px; background-color: #FF6A00;">
                    <a href="${approvalLink}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Review & Sign Contract
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link:
              </p>
              
              <p style="margin: 8px 0 0 0; padding: 12px; background-color: #FFD7BF; border-radius: 6px; word-break: break-all;">
                <a href="${approvalLink}" style="color: #111111; font-size: 14px; text-decoration: none;">${approvalLink}</a>
              </p>

              <p style="margin: 24px 0 0 0; color: #888888; font-size: 14px; line-height: 1.6;">
                This link is valid for 7 days.
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
