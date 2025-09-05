import Mailjet from 'node-mailjet';

if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
  throw new Error("MAILJET_API_KEY and MAILJET_SECRET_KEY environment variables must be set");
}

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY
});

export interface EmailParams {
  to: string;
  toName?: string;
  from: string;
  fromName?: string;
  subject: string;
  textPart?: string;
  htmlPart?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const request = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: params.from,
              Name: params.fromName || 'Wedding Cake Calculator'
            },
            To: [
              {
                Email: params.to,
                Name: params.toName
              }
            ],
            Subject: params.subject,
            TextPart: params.textPart,
            HTMLPart: params.htmlPart
          }
        ]
      });

    console.log('Email sent successfully:', request.body);
    return true;
  } catch (error) {
    console.error('Mailjet email error:', error);
    return false;
  }
}

// Email templates
export const emailTemplates = {
  newLeadNotification: (bakerName: string, customerName: string, customerEmail: string, message: string, weddingDate?: string) => ({
    subject: `New Wedding Cake Inquiry from ${customerName}`,
    textPart: `Hi ${bakerName},

You have received a new wedding cake inquiry!

Customer Details:
- Name: ${customerName}
- Email: ${customerEmail}
${weddingDate ? `- Wedding Date: ${weddingDate}` : ''}

Message:
${message}

Log in to your dashboard to view full details and respond to this inquiry.

Best regards,
Wedding Cake Calculator Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #7c2d12;">New Wedding Cake Inquiry 🎂</h2>
<p>Hi <strong>${bakerName}</strong>,</p>
<p>You have received a new wedding cake inquiry!</p>

<div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
<h3 style="color: #7c2d12; margin-top: 0;">Customer Details:</h3>
<ul style="list-style: none; padding: 0;">
<li><strong>Name:</strong> ${customerName}</li>
<li><strong>Email:</strong> ${customerEmail}</li>
${weddingDate ? `<li><strong>Wedding Date:</strong> ${weddingDate}</li>` : ''}
</ul>

<h3 style="color: #7c2d12;">Message:</h3>
<p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #7c2d12;">${message}</p>
</div>

<p>Log in to your dashboard to view full details and respond to this inquiry.</p>

<p>Best regards,<br><strong>Wedding Cake Calculator Team</strong></p>
</div>`
  }),

  leadConfirmation: (customerName: string, bakerName: string) => ({
    subject: `Your Wedding Cake Inquiry Sent Successfully`,
    textPart: `Hi ${customerName},

Thank you for your wedding cake inquiry! We've successfully sent your request to ${bakerName}.

The baker will review your requirements and get back to you directly via email or phone. You can expect to hear back within 24-48 hours.

In the meantime, feel free to browse other bakers in our directory or calculate more estimates for your special day.

Best wishes for your wedding planning!

Wedding Cake Calculator Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #7c2d12;">Inquiry Sent Successfully! ✨</h2>
<p>Hi <strong>${customerName}</strong>,</p>
<p>Thank you for your wedding cake inquiry! We've successfully sent your request to <strong>${bakerName}</strong>.</p>

<div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
<h3 style="color: #7c2d12; margin-top: 0;">What's Next?</h3>
<ul>
<li>The baker will review your requirements</li>
<li>You can expect to hear back within 24-48 hours</li>
<li>They'll contact you directly via email or phone</li>
</ul>
</div>

<p>In the meantime, feel free to browse other bakers in our directory or calculate more estimates for your special day.</p>

<p>Best wishes for your wedding planning! 🎂💕</p>

<p>Best regards,<br><strong>Wedding Cake Calculator Team</strong></p>
</div>`
  }),

  reviewReminder: (customerName: string, bakerName: string, weddingDate: string) => ({
    subject: `How was your wedding cake from ${bakerName}?`,
    textPart: `Hi ${customerName},

Congratulations on your recent wedding! We hope you had an absolutely magical day.

We'd love to hear about your experience with ${bakerName}. Your feedback helps other couples make informed decisions and helps bakers improve their services.

Would you mind taking a few minutes to leave a review? You can share details about:
- The taste and quality of your cake
- The baker's professionalism and communication
- How well they met your expectations
- Any special touches that made your cake unique

Thank you for being part of our wedding cake community!

Wedding Cake Calculator Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #7c2d12;">How was your wedding cake? 🎂✨</h2>
<p>Hi <strong>${customerName}</strong>,</p>
<p>Congratulations on your recent wedding! We hope you had an absolutely magical day.</p>

<p>We'd love to hear about your experience with <strong>${bakerName}</strong>. Your feedback helps other couples make informed decisions and helps bakers improve their services.</p>

<div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
<h3 style="color: #7c2d12; margin-top: 0;">Share Your Experience:</h3>
<ul>
<li>The taste and quality of your cake</li>
<li>The baker's professionalism and communication</li>
<li>How well they met your expectations</li>
<li>Any special touches that made your cake unique</li>
</ul>
</div>

<p>Thank you for being part of our wedding cake community! 💕</p>

<p>Best regards,<br><strong>Wedding Cake Calculator Team</strong></p>
</div>`
  })
};