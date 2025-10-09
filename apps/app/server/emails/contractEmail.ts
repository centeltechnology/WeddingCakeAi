interface ContractEmailData {
  customerName: string;
  bakerName: string;
  businessName?: string;
  contractTitle: string;
  totalAmount: string;
  depositAmount: string;
  eventDate?: string;
  approvalLink: string;
}

export function contractEmail(data: ContractEmailData) {
  const { customerName, bakerName, businessName, contractTitle, totalAmount, depositAmount, eventDate, approvalLink } = data;
  const bakerDisplayName = businessName || bakerName;

  const subject = `Contract Ready for Review - ${contractTitle}`;
  
  const text = `Your contract is ready for review.

Contract: ${contractTitle}
Total Amount: $${totalAmount}
Deposit Amount: $${depositAmount}

Review and sign your contract here: ${approvalLink}

This link is valid for 7 days.

— ${bakerDisplayName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contract Ready for Review</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px; background-color: #FF6A00; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                ${bakerDisplayName}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; color: #111111; font-size: 24px; font-weight: 600; line-height: 1.3;">
                Your Contract is Ready! 📝
              </h2>
              
              <p style="margin: 0 0 24px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hi <strong>${customerName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Your contract is ready for review and signature. Please review the details below:
              </p>

              <!-- Contract Details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 24px 0; background-color: #f9f9f9; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Contract:</strong> ${contractTitle}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Total Amount:</strong> $${totalAmount}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Deposit Amount:</strong> $${depositAmount}
                  </td>
                </tr>
                ${eventDate ? `
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Event Date:</strong> ${eventDate}
                  </td>
                </tr>
                ` : ''}
              </table>
              
              <!-- CTA Button -->
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
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              
              <p style="margin: 8px 0 0 0; padding: 12px; background-color: #FFD7BF; border-radius: 6px; word-break: break-all;">
                <a href="${approvalLink}" style="color: #111111; font-size: 14px; text-decoration: none;">${approvalLink}</a>
              </p>

              <p style="margin: 24px 0 0 0; color: #888888; font-size: 14px; line-height: 1.6;">
                This link is valid for 7 days.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #888888; font-size: 12px; line-height: 1.5; text-align: center;">
                © ${new Date().getFullYear()} ${bakerDisplayName}. Powered by BakerIQ.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html, text };
}
