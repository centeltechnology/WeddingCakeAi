interface InvoiceEmailData {
  customerName: string;
  bakerName: string;
  businessName?: string;
  invoiceTitle: string;
  invoiceNumber: string;
  total: string;
  dueDate?: string;
  paymentLink: string;
}

export function invoiceEmail(data: InvoiceEmailData) {
  const { customerName, bakerName, businessName, invoiceTitle, invoiceNumber, total, dueDate, paymentLink } = data;
  const bakerDisplayName = businessName || bakerName;

  const subject = `Invoice ${invoiceNumber} - Payment Due`;
  
  const text = `Your invoice is ready.

Invoice: ${invoiceTitle}
Invoice Number: ${invoiceNumber}
Amount Due: $${total}
${dueDate ? `Due Date: ${dueDate}` : ''}

View and pay your invoice here: ${paymentLink}

— ${bakerDisplayName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice Ready</title>
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
                Your Invoice is Ready! 💳
              </h2>
              
              <p style="margin: 0 0 24px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hi <strong>${customerName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Your invoice is ready for payment. Please review the details below:
              </p>

              <!-- Invoice Details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 24px 0; background-color: #f9f9f9; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Invoice:</strong> ${invoiceTitle}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Invoice Number:</strong> ${invoiceNumber}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 20px;">
                    <strong style="color: #111111;">Amount Due:</strong> 
                    <span style="color: #FF6A00; font-weight: 700;">$${total}</span>
                  </td>
                </tr>
                ${dueDate ? `
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #111111;">Due Date:</strong> ${dueDate}
                  </td>
                </tr>
                ` : ''}
              </table>
              
              <!-- CTA Button -->
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
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              
              <p style="margin: 8px 0 0 0; padding: 12px; background-color: #FFD7BF; border-radius: 6px; word-break: break-all;">
                <a href="${paymentLink}" style="color: #111111; font-size: 14px; text-decoration: none;">${paymentLink}</a>
              </p>

              <p style="margin: 24px 0 0 0; color: #888888; font-size: 14px; line-height: 1.6;">
                Questions? Reply to this email or contact us directly.
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
