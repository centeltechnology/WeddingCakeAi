import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

let sesClient: SESClient | null = null;

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION) {
  sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

export interface EmailParams {
  to: string;
  toName?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  subject: string;
  textPart?: string;
  htmlPart?: string;
  text?: string; // For simple text emails
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!sesClient) {
    console.warn('AWS SES not configured. Skipping email send.');
    return false;
  }

  try {
    const emailParams = {
      Source: `${params.fromName || 'BakerIQ'} <${params.from || 'noreply@bakeriq.app'}>`,
      ...(params.replyTo ? {
        ReplyToAddresses: [params.replyTo],
      } : {}),
      Destination: {
        ToAddresses: [
          params.toName 
            ? `${params.toName} <${params.to}>` 
            : params.to
        ],
      },
      Message: {
        Subject: {
          Data: params.subject,
          Charset: 'UTF-8',
        },
        Body: {
          ...(params.textPart || params.text ? {
            Text: {
              Data: params.textPart || params.text!,
              Charset: 'UTF-8',
            }
          } : {}),
          ...(params.htmlPart ? {
            Html: {
              Data: params.htmlPart,
              Charset: 'UTF-8',
            }
          } : {}),
        },
      },
    };

    const command = new SendEmailCommand(emailParams);
    const response = await sesClient.send(command);
    
    console.log('Email sent successfully via AWS SES:', {
      messageId: response.MessageId,
      to: params.to,
      subject: params.subject
    });
    return true;
  } catch (error) {
    console.error('AWS SES email error:', error);
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

  emailVerification: (name: string, verificationUrl: string, loginUrl: string = '/login') => ({
    subject: 'Please verify your BakerIQ account',
    textPart: `Hi ${name},

Welcome to BakerIQ! Please verify your email address to complete your account setup.

Click here to verify: ${verificationUrl}

Once verified, you can log in at: ${loginUrl}

Quick Tips to Get Started:
• Set up your bakery profile with photos and specialties
• Configure your pricing and availability
• Connect with customers looking for wedding cakes
• Track orders and manage your business efficiently

If you didn't create this account, you can safely ignore this email.

Best regards,
The BakerIQ Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="text-align: center; margin-bottom: 30px;">
<h1 style="color: #7c2d12; margin: 0;">Welcome to BakerIQ! 🎂</h1>
</div>

<p style="font-size: 16px; line-height: 1.5; color: #333;">Hi <strong>${name}</strong>,</p>

<p style="font-size: 16px; line-height: 1.5; color: #333;">
Welcome to BakerIQ! We're excited to have you join our community of talented bakers.
</p>

<p style="font-size: 16px; line-height: 1.5; color: #333;">
To complete your account setup and start managing your cake business, please verify your email address by clicking the button below:
</p>

<div style="text-align: center; margin: 30px 0;">
<a href="${verificationUrl}" style="background-color: #7c2d12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
Verify Email Address
</a>
</div>

<div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f97316;">
<h3 style="color: #7c2d12; margin-top: 0; margin-bottom: 15px;">🚀 Quick Tips to Get Started:</h3>
<ul style="margin: 0; padding-left: 20px; color: #333;">
<li style="margin-bottom: 8px;"><strong>Set up your bakery profile</strong> with photos and specialties</li>
<li style="margin-bottom: 8px;"><strong>Configure your pricing</strong> and availability</li>
<li style="margin-bottom: 8px;"><strong>Connect with customers</strong> looking for wedding cakes</li>
<li style="margin-bottom: 8px;"><strong>Track orders</strong> and manage your business efficiently</li>
</ul>
</div>

<div style="text-align: center; margin: 30px 0;">
<p style="font-size: 16px; color: #333; margin-bottom: 10px;">After verification, access your dashboard:</p>
<a href="${loginUrl}" style="background-color: #f97316; color: white; padding: 10px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
Go to Login
</a>
</div>

<p style="font-size: 14px; line-height: 1.5; color: #666; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
If the button doesn't work, you can copy and paste this link into your browser:<br>
<a href="${verificationUrl}" style="color: #7c2d12; word-break: break-all;">${verificationUrl}</a>
</p>

<p style="font-size: 14px; color: #666;">
If you didn't create this account, you can safely ignore this email.
</p>

<p style="font-size: 14px; color: #666;">
Best regards,<br>
<strong>The BakerIQ Team</strong>
</p>
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
  }),

  // Quote-related email templates
  quoteSent: (customerName: string, bakerName: string, quoteNumber: string, amount: string, validUntil: string, quoteUrl: string) => ({
    subject: `Your Custom Quote from ${bakerName} - Quote #${quoteNumber}`,
    textPart: `Hi ${customerName},

Great news! ${bakerName} has prepared a custom quote for your special event.

Quote Details:
- Quote Number: #${quoteNumber}
- Total Amount: $${amount}
- Valid Until: ${validUntil}

View your quote: ${quoteUrl}

Please review your quote and let us know if you have any questions. You can view the full details and accept the quote through your customer portal.

Best regards,
${bakerName}`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #f472b6;">Your Custom Quote is Ready! 🎂</h2>
<p>Hi <strong>${customerName}</strong>,</p>
<p>Great news! <strong>${bakerName}</strong> has prepared a custom quote for your special event.</p>

<div style="background-color: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f472b6;">
<h3 style="color: #be185d; margin-top: 0;">Quote Details:</h3>
<ul style="list-style: none; padding: 0;">
<li><strong>Quote Number:</strong> #${quoteNumber}</li>
<li><strong>Total Amount:</strong> $${amount}</li>
<li><strong>Valid Until:</strong> ${validUntil}</li>
</ul>
</div>

<div style="text-align: center; margin: 30px 0;">
<a href="${quoteUrl}" style="background-color: #f472b6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Quote Details</a>
</div>

<p>Please review your quote and let us know if you have any questions. You can view the full details and accept the quote through your customer portal.</p>

<p>Best regards,<br><strong>${bakerName}</strong></p>
</div>`
  }),

  quoteApproved: (bakerName: string, customerName: string, quoteNumber: string, amount: string) => ({
    subject: `Quote Approved! - Quote #${quoteNumber} from ${customerName}`,
    textPart: `Hi ${bakerName},

Congratulations! ${customerName} has approved quote #${quoteNumber} for $${amount}.

Next Steps:
1. Send the contract for signature
2. Collect the deposit payment
3. Schedule any needed consultations

You can view the full quote details in your dashboard.

Best regards,
BakerIQ Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #10b981;">Quote Approved! 🎉</h2>
<p>Hi <strong>${bakerName}</strong>,</p>
<p>Congratulations! <strong>${customerName}</strong> has approved quote #${quoteNumber} for <strong>$${amount}</strong>.</p>

<div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
<h3 style="color: #047857; margin-top: 0;">Next Steps:</h3>
<ol>
<li>Send the contract for signature</li>
<li>Collect the deposit payment</li>
<li>Schedule any needed consultations</li>
</ol>
</div>

<div style="text-align: center; margin: 30px 0;">
<a href="#" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Quote Details</a>
</div>

<p>You can view the full quote details in your dashboard.</p>

<p>Best regards,<br><strong>BakerIQ Team</strong></p>
</div>`
  }),

  // Contract-related email templates
  contractSent: (customerName: string, bakerName: string, contractNumber: string) => ({
    subject: `Contract Ready for Signature - ${bakerName}`,
    textPart: `Hi ${customerName},

Your contract from ${bakerName} is ready for signature!

Contract Number: ${contractNumber}

Please review the contract terms and sign electronically through your customer portal. Once signed, your order will be confirmed and we can begin planning your special event.

If you have any questions about the contract terms, please contact ${bakerName} directly.

Best regards,
BakerIQ Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #8b5cf6;">Contract Ready for Signature! 📝</h2>
<p>Hi <strong>${customerName}</strong>,</p>
<p>Your contract from <strong>${bakerName}</strong> is ready for signature!</p>

<div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p><strong>Contract Number:</strong> ${contractNumber}</p>
</div>

<div style="text-align: center; margin: 30px 0;">
<a href="#" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Review & Sign Contract</a>
</div>

<p>Please review the contract terms and sign electronically through your customer portal. Once signed, your order will be confirmed and we can begin planning your special event.</p>

<p>If you have any questions about the contract terms, please contact <strong>${bakerName}</strong> directly.</p>

<p>Best regards,<br><strong>BakerIQ Team</strong></p>
</div>`
  }),

  contractSigned: (bakerName: string, customerName: string, contractNumber: string) => ({
    subject: `Contract Signed! - ${customerName} Contract #${contractNumber}`,
    textPart: `Hi ${bakerName},

Great news! ${customerName} has signed contract #${contractNumber}.

The contract is now legally binding and you can proceed with:
1. Collecting the deposit payment
2. Scheduling consultations
3. Beginning production planning

You can download the signed contract from your dashboard.

Best regards,
BakerIQ Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #10b981;">Contract Signed! ✅</h2>
<p>Hi <strong>${bakerName}</strong>,</p>
<p>Great news! <strong>${customerName}</strong> has signed contract #${contractNumber}.</p>

<div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
<p>The contract is now legally binding and you can proceed with:</p>
<ol>
<li>Collecting the deposit payment</li>
<li>Scheduling consultations</li>
<li>Beginning production planning</li>
</ol>
</div>

<div style="text-align: center; margin: 30px 0;">
<a href="#" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Download Signed Contract</a>
</div>

<p>You can download the signed contract from your dashboard.</p>

<p>Best regards,<br><strong>BakerIQ Team</strong></p>
</div>`
  }),

  // Payment-related email templates
  paymentReminder: (customerName: string, bakerName: string, amount: string, dueDate: string, type: string) => ({
    subject: `Payment Reminder - ${type} Due ${dueDate}`,
    textPart: `Hi ${customerName},

This is a friendly reminder that your ${type.toLowerCase()} payment of $${amount} to ${bakerName} is due on ${dueDate}.

You can easily make your payment through your customer portal using our secure payment system.

If you have any questions about your payment, please contact ${bakerName} directly.

Best regards,
BakerIQ Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #f59e0b;">Payment Reminder 💳</h2>
<p>Hi <strong>${customerName}</strong>,</p>
<p>This is a friendly reminder that your <strong>${type.toLowerCase()}</strong> payment of <strong>$${amount}</strong> to <strong>${bakerName}</strong> is due on <strong>${dueDate}</strong>.</p>

<div style="text-align: center; margin: 30px 0;">
<a href="#" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Make Payment</a>
</div>

<p>You can easily make your payment through your customer portal using our secure payment system.</p>

<p>If you have any questions about your payment, please contact <strong>${bakerName}</strong> directly.</p>

<p>Best regards,<br><strong>BakerIQ Team</strong></p>
</div>`
  }),

  paymentConfirmation: (customerName: string, bakerName: string, amount: string, type: string, transactionId: string) => ({
    subject: `Payment Confirmation - $${amount} ${type}`,
    textPart: `Hi ${customerName},

Your payment has been successfully processed!

Payment Details:
- Amount: $${amount}
- Type: ${type}
- Baker: ${bakerName}
- Transaction ID: ${transactionId}

Thank you for your payment. ${bakerName} will be notified and will contact you regarding next steps.

Best regards,
BakerIQ Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #10b981;">Payment Confirmed! ✅</h2>
<p>Hi <strong>${customerName}</strong>,</p>
<p>Your payment has been successfully processed!</p>

<div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
<h3 style="color: #047857; margin-top: 0;">Payment Details:</h3>
<ul style="list-style: none; padding: 0;">
<li><strong>Amount:</strong> $${amount}</li>
<li><strong>Type:</strong> ${type}</li>
<li><strong>Baker:</strong> ${bakerName}</li>
<li><strong>Transaction ID:</strong> ${transactionId}</li>
</ul>
</div>

<p>Thank you for your payment. <strong>${bakerName}</strong> will be notified and will contact you regarding next steps.</p>

<p>Best regards,<br><strong>BakerIQ Team</strong></p>
</div>`
  }),

  // Automated follow-up templates
  followUpReminder: (bakerName: string, customerName: string, daysSinceLastContact: number, customerEmail: string) => ({
    subject: `Follow-up Reminder - ${customerName} (${daysSinceLastContact} days ago)`,
    textPart: `Hi ${bakerName},

This is a reminder to follow up with ${customerName}. It's been ${daysSinceLastContact} days since your last contact.

Customer Email: ${customerEmail}

Consider reaching out to:
- Check on their decision timeline
- Answer any additional questions
- Provide updated pricing if needed
- Schedule a tasting or consultation

Consistent follow-up helps convert inquiries into bookings!

Best regards,
BakerIQ Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #f59e0b;">Follow-up Reminder 📞</h2>
<p>Hi <strong>${bakerName}</strong>,</p>
<p>This is a reminder to follow up with <strong>${customerName}</strong>. It's been <strong>${daysSinceLastContact} days</strong> since your last contact.</p>

<div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p><strong>Customer Email:</strong> ${customerEmail}</p>
</div>

<div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
<h3 style="margin-top: 0;">Consider reaching out to:</h3>
<ul>
<li>Check on their decision timeline</li>
<li>Answer any additional questions</li>
<li>Provide updated pricing if needed</li>
<li>Schedule a tasting or consultation</li>
</ul>
</div>

<p>Consistent follow-up helps convert inquiries into bookings!</p>

<p>Best regards,<br><strong>BakerIQ Team</strong></p>
</div>`
  }),

  // Trial and Subscription Lifecycle Email Templates
  trialWelcome: (bakerName: string, trialEndDate: string) => ({
    subject: `🎉 Welcome to BakerIQ! Your 14-day trial has started`,
    htmlPart: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fef7f0 0%, #fdf2f8 100%); border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); padding: 40px 30px; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Welcome to BakerIQ! 🎂</h1>
  <p style="color: #fef7f0; margin: 10px 0 0 0; font-size: 18px;">Your premium trial is now active</p>
</div>

<div style="padding: 40px 30px;">
  <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hi ${bakerName},</p>
  
  <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
    Welcome to BakerIQ! We're thrilled to have you join our community of successful cake decorators and bakeries. Your <strong>14-day premium trial</strong> has started, giving you full access to all our powerful tools.
  </p>

  <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0; border-radius: 8px;">
    <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 18px;">🚀 What's Included in Your Trial:</h3>
    <ul style="color: #166534; margin: 0; padding-left: 20px; line-height: 1.8;">
      <li><strong>Unlimited Leads:</strong> Connect with as many customers as you want</li>
      <li><strong>Advanced Analytics:</strong> Track your business performance in real-time</li>
      <li><strong>Unlimited Portfolio Images:</strong> Showcase all your beautiful creations</li>
      <li><strong>Custom Branding:</strong> Make your presence truly yours</li>
      <li><strong>Priority Support:</strong> Get help when you need it most</li>
    </ul>
  </div>

  <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px;">
    <p style="color: #92400e; margin: 0; font-size: 16px; text-align: center;">
      ⏰ <strong>Your trial expires on ${new Date(trialEndDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</strong>
    </p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://bakeriq.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Start Building Your Business →
    </a>
  </div>

  <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 30px 0 0 0;">
    Need help getting started? Reply to this email or check out our <a href="https://bakeriq.app/help" style="color: #f97316;">getting started guide</a>.
  </p>
</div>
</div>`,
    textPart: `Welcome to BakerIQ, ${bakerName}! Your 14-day premium trial has started and expires on ${new Date(trialEndDate).toLocaleDateString()}. During your trial, you have access to unlimited leads, advanced analytics, unlimited portfolio images, custom branding, and priority support. Get started at https://bakeriq.app/dashboard`
  }),

  trialExpirationWarning: (bakerName: string, daysLeft: number, trialEndDate: string) => {
    const urgency = daysLeft <= 1 ? 'urgent' : daysLeft <= 3 ? 'warning' : 'info';
    const emoji = urgency === 'urgent' ? '🚨' : urgency === 'warning' ? '⏰' : '⏳';
    const color = urgency === 'urgent' ? '#dc2626' : urgency === 'warning' ? '#d97706' : '#0369a1';
    
    return {
      subject: `${emoji} ${daysLeft === 0 ? 'Your trial ends today!' : daysLeft === 1 ? 'Your trial ends tomorrow!' : `${daysLeft} days left in your trial`}`,
      htmlPart: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
<div style="background: ${color}; padding: 30px; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
    ${emoji} Trial Expiration Notice
  </h1>
</div>

<div style="padding: 40px 30px;">
  <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hi ${bakerName},</p>
  
  <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <p style="color: #991b1b; margin: 0; font-size: 16px; text-align: center; font-weight: 600;">
      ${daysLeft === 0 ? 'Your BakerIQ trial expires today!' : 
        daysLeft === 1 ? 'Your BakerIQ trial expires tomorrow!' : 
        `Your BakerIQ trial expires in ${daysLeft} days`}
    </p>
    <p style="color: #7f1d1d; margin: 10px 0 0 0; font-size: 14px; text-align: center;">
      Trial ends: ${new Date(trialEndDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </p>
  </div>

  <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 20px 0;">
    ${daysLeft === 0 ? 
      'Don\'t lose access to your premium features! Upgrade now to continue growing your cake business with unlimited leads, advanced analytics, and priority support.' :
      `We hope you\'re loving BakerIQ! To continue using all premium features like unlimited leads, advanced analytics, and custom branding, upgrade before your trial expires.`}
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://bakeriq.app/billing" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 10px 10px 0;">
      Upgrade Now →
    </a>
  </div>

  <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 30px 0 0 0;">
    Questions? Reply to this email or visit our <a href="https://bakeriq.app/help" style="color: #f97316;">help center</a>.
  </p>
</div>
</div>`,
      textPart: `Hi ${bakerName}, your BakerIQ trial ${daysLeft === 0 ? 'expires today' : `expires in ${daysLeft} days`} on ${new Date(trialEndDate).toLocaleDateString()}. Upgrade now at https://bakeriq.app/billing to continue using premium features.`
    };
  },

  trialExpired: (bakerName: string) => ({
    subject: `😟 Your BakerIQ trial has expired - Upgrade to continue`,
    htmlPart: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
<div style="background: #dc2626; padding: 30px; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
    ⚠️ Trial Expired
  </h1>
</div>

<div style="padding: 40px 30px;">
  <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hi ${bakerName},</p>
  
  <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
    Your BakerIQ premium trial has expired, but don't worry - your account is still active! However, you now have limited access to premium features.
  </p>

  <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <h3 style="color: #991b1b; margin: 0 0 15px 0; font-size: 16px;">🚫 Limited Access:</h3>
    <ul style="color: #7f1d1d; margin: 0; padding-left: 20px; line-height: 1.6;">
      <li>Lead generation is limited</li>
      <li>Portfolio limited to 5 images</li>
      <li>Basic analytics only</li>
      <li>Standard support</li>
    </ul>
  </div>

  <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 16px;">🎉 Upgrade to Unlock:</h3>
    <ul style="color: #166534; margin: 0; padding-left: 20px; line-height: 1.6;">
      <li>Unlimited lead generation</li>
      <li>Unlimited portfolio images</li>
      <li>Advanced analytics & insights</li>
      <li>Custom branding options</li>
      <li>Priority support</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://bakeriq.app/billing" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Upgrade Now - Starting at $29/month →
    </a>
  </div>

  <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 30px 0 0 0;">
    Still have questions? <a href="https://bakeriq.app/contact" style="color: #f97316;">Contact our team</a> - we're here to help!
  </p>
</div>
</div>`,
    textPart: `Hi ${bakerName}, your BakerIQ trial has expired. You now have limited access to features. Upgrade at https://bakeriq.app/billing starting at $29/month to unlock unlimited leads, portfolio images, advanced analytics, and more.`
  }),

  subscriptionSuccess: (bakerName: string, planName: string) => ({
    subject: `🎉 Welcome to ${planName}! Your subscription is active`,
    htmlPart: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🎉 Subscription Active!</h1>
  <p style="color: #dcfce7; margin: 10px 0 0 0; font-size: 18px;">Welcome to ${planName}</p>
</div>

<div style="padding: 40px 30px;">
  <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hi ${bakerName},</p>
  
  <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
    Congratulations! Your <strong>${planName}</strong> subscription is now active. You have full access to all premium features to grow your cake business.
  </p>

  <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0; border-radius: 8px;">
    <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 18px;">✨ You now have access to:</h3>
    <ul style="color: #166534; margin: 0; padding-left: 20px; line-height: 1.8;">
      <li><strong>Unlimited Leads:</strong> Connect with unlimited customers</li>
      <li><strong>Advanced Analytics:</strong> Detailed business insights</li>
      <li><strong>Unlimited Portfolio:</strong> Showcase all your creations</li>
      <li><strong>Custom Branding:</strong> Make your presence unique</li>
      <li><strong>Priority Support:</strong> Get help when you need it</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://bakeriq.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Access Your Dashboard →
    </a>
  </div>

  <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 30px 0 0 0;">
    Thank you for choosing BakerIQ! We're excited to help you grow your business.
  </p>
</div>
</div>`,
    textPart: `Hi ${bakerName}, congratulations! Your ${planName} subscription is now active with unlimited leads, advanced analytics, unlimited portfolio images, custom branding, and priority support. Access your dashboard at https://bakeriq.app/dashboard`
  }),

  superAdminPasswordReset: (resetUrl: string) => ({
    subject: 'Reset your BakerIQ Super Admin password',
    textPart: `Password Reset Request

You have requested to reset your BakerIQ Super Admin password.

Click here to reset your password: ${resetUrl}

This link will expire in 15 minutes for security reasons.

If you didn't request this password reset, you can safely ignore this email. Your password will not be changed unless you click the link above and set a new password.

For security reasons:
• This reset link can only be used once
• The link expires in 15 minutes
• You must set a new password immediately after clicking the link

Best regards,
The BakerIQ Security Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="text-align: center; margin-bottom: 30px;">
<h1 style="color: #7c2d12; margin: 0;">🔐 Password Reset Request</h1>
</div>

<p style="font-size: 16px; line-height: 1.5; color: #333;">
You have requested to reset your <strong>BakerIQ Super Admin</strong> password.
</p>

<div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
<p style="margin: 0; color: #7c2d12; font-weight: 600;">⚠️ Security Notice</p>
<p style="margin: 10px 0 0 0; color: #7c2d12; font-size: 14px;">This reset link expires in <strong>15 minutes</strong> and can only be used <strong>once</strong>.</p>
</div>

<div style="text-align: center; margin: 30px 0;">
<a href="${resetUrl}" style="background-color: #7c2d12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
Reset My Password
</a>
</div>

<div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0;">
<h3 style="color: #7c2d12; margin-top: 0;">Security Guidelines:</h3>
<ul style="color: #666; font-size: 14px; line-height: 1.5;">
<li>This reset link can only be used once</li>
<li>The link expires in 15 minutes for your security</li>
<li>You must set a new password immediately after clicking the link</li>
<li>Choose a strong password with at least 8 characters</li>
</ul>
</div>

<p style="font-size: 14px; line-height: 1.5; color: #666; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
If the button doesn't work, you can copy and paste this link into your browser:<br>
<a href="${resetUrl}" style="color: #7c2d12; word-break: break-all;">${resetUrl}</a>
</p>

<p style="font-size: 14px; color: #666;">
<strong>Didn't request this?</strong> If you didn't request this password reset, you can safely ignore this email. Your password will not be changed unless you click the link above.
</p>

<p style="font-size: 14px; color: #666;">
Best regards,<br>
<strong>The BakerIQ Security Team</strong>
</p>
</div>`
  }),

  // Seven-Day Onboarding Email Sequence
  onboardingDay1: (name: string, dashboardUrl: string) => ({
    subject: '🎂 Complete your bakery profile - Day 1 with BakerIQ',
    textPart: `Hi ${name},

Welcome to Day 1 of your BakerIQ journey! 

Let's get your bakery profile set up so customers can find and connect with you.

Complete these quick steps:
• Add your bakery name and description
• Set your location and service areas  
• Add your contact information
• Upload a profile photo

Complete your profile: ${dashboardUrl}

Tomorrow we'll help you set up your pricing and specialties.

Best regards,
The BakerIQ Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="text-align: center; margin-bottom: 30px;">
<h1 style="color: #7c2d12; margin: 0;">Day 1: Complete Your Profile 🎂</h1>
</div>

<p style="font-size: 16px; line-height: 1.5; color: #333;">Hi <strong>${name}</strong>,</p>

<p style="font-size: 16px; line-height: 1.5; color: #333;">
Welcome to Day 1 of your BakerIQ journey! Let's get your bakery profile set up so customers can find and connect with you.
</p>

<div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f97316;">
<h3 style="color: #7c2d12; margin-top: 0; margin-bottom: 15px;">📝 Quick Setup Checklist:</h3>
<ul style="margin: 0; padding-left: 20px; color: #333;">
<li style="margin-bottom: 8px;">Add your bakery name and description</li>
<li style="margin-bottom: 8px;">Set your location and service areas</li>
<li style="margin-bottom: 8px;">Add your contact information</li>
<li style="margin-bottom: 8px;">Upload a profile photo</li>
</ul>
</div>

<div style="text-align: center; margin: 30px 0;">
<a href="${dashboardUrl}" style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
Complete Your Profile
</a>
</div>

<p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
💡 <strong>Tomorrow:</strong> We'll help you set up your pricing and specialties
</p>

<p style="font-size: 14px; color: #666;">
Best regards,<br>
<strong>The BakerIQ Team</strong>
</p>
</div>`
  }),

  onboardingDay2: (name: string, dashboardUrl: string) => ({
    subject: '💰 Set up your pricing strategy - Day 2 with BakerIQ',
    textPart: `Hi ${name},

Day 2: Let's set up your pricing and specialties!

Configure these important settings:
• Base pricing for different cake sizes
• Special dietary options (gluten-free, vegan, etc.)
• Your signature flavors and decorating styles
• Delivery and setup fees

Set up pricing: ${dashboardUrl}

This helps customers get accurate quotes and shows your expertise.

Best regards,
The BakerIQ Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="text-align: center; margin-bottom: 30px;">
<h1 style="color: #7c2d12; margin: 0;">Day 2: Pricing & Specialties 💰</h1>
</div>

<p style="font-size: 16px; line-height: 1.5; color: #333;">Hi <strong>${name}</strong>,</p>

<p style="font-size: 16px; line-height: 1.5; color: #333;">
Time to set up your pricing and specialties! This helps customers get accurate quotes and showcases your expertise.
</p>

<div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f97316;">
<h3 style="color: #7c2d12; margin-top: 0; margin-bottom: 15px;">💰 Pricing Setup:</h3>
<ul style="margin: 0; padding-left: 20px; color: #333;">
<li style="margin-bottom: 8px;">Base pricing for different cake sizes</li>
<li style="margin-bottom: 8px;">Special dietary options (gluten-free, vegan, etc.)</li>
<li style="margin-bottom: 8px;">Your signature flavors and decorating styles</li>
<li style="margin-bottom: 8px;">Delivery and setup fees</li>
</ul>
</div>

<div style="text-align: center; margin: 30px 0;">
<a href="${dashboardUrl}" style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
Configure Pricing
</a>
</div>

<p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
📸 <strong>Tomorrow:</strong> We'll help you upload your portfolio photos
</p>

<p style="font-size: 14px; color: #666;">
Best regards,<br>
<strong>The BakerIQ Team</strong>
</p>
</div>`
  }),

  onboardingDay3: (name: string, dashboardUrl: string) => ({
    subject: '📸 Showcase your work - Day 3 with BakerIQ',
    textPart: `Hi ${name},

Day 3: Time to showcase your beautiful work!

Upload photos that will wow potential customers:
• Your best wedding cakes and desserts
• Before and after transformation shots
• Behind-the-scenes baking process
• Happy customers with their cakes

Upload photos: ${dashboardUrl}

Great photos are your best marketing tool - they sell your services before you even talk to the customer!

Best regards,
The BakerIQ Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="text-align: center; margin-bottom: 30px;">
<h1 style="color: #7c2d12; margin: 0;">Day 3: Showcase Your Work 📸</h1>
</div>

<p style="font-size: 16px; line-height: 1.5; color: #333;">Hi <strong>${name}</strong>,</p>

<p style="font-size: 16px; line-height: 1.5; color: #333;">
Time to showcase your beautiful work! Great photos are your best marketing tool - they sell your services before you even talk to the customer.
</p>

<div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f97316;">
<h3 style="color: #7c2d12; margin-top: 0; margin-bottom: 15px;">📸 Photo Ideas:</h3>
<ul style="margin: 0; padding-left: 20px; color: #333;">
<li style="margin-bottom: 8px;">Your best wedding cakes and desserts</li>
<li style="margin-bottom: 8px;">Before and after transformation shots</li>
<li style="margin-bottom: 8px;">Behind-the-scenes baking process</li>
<li style="margin-bottom: 8px;">Happy customers with their cakes</li>
</ul>
</div>

<div style="text-align: center; margin: 30px 0;">
<a href="${dashboardUrl}" style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
Upload Photos
</a>
</div>

<p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
📋 <strong>Tomorrow:</strong> Learn about managing customer leads and orders
</p>

<p style="font-size: 14px; color: #666;">
Best regards,<br>
<strong>The BakerIQ Team</strong>
</p>
</div>`
  }),

  onboardingDay7: (name: string, dashboardUrl: string, supportUrl: string) => ({
    subject: '🎉 You made it! Welcome to the BakerIQ community',
    textPart: `Hi ${name},

Congratulations! You've completed your 7-day BakerIQ setup journey! 🎉

You're now ready to:
• Receive and manage customer inquiries
• Send professional quotes and contracts
• Track your business growth with analytics
• Connect with our community of successful bakers

Access your dashboard: ${dashboardUrl}
Need help? Contact us: ${supportUrl}

Here's to your sweet success!

Best regards,
The BakerIQ Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="text-align: center; margin-bottom: 30px;">
<h1 style="color: #7c2d12; margin: 0;">Welcome to the Community! 🎉</h1>
</div>

<p style="font-size: 16px; line-height: 1.5; color: #333;">Hi <strong>${name}</strong>,</p>

<p style="font-size: 16px; line-height: 1.5; color: #333;">
Congratulations! You've completed your 7-day BakerIQ setup journey! You're now fully equipped to grow your bakery business.
</p>

<div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f97316;">
<h3 style="color: #7c2d12; margin-top: 0; margin-bottom: 15px;">🚀 You're Ready To:</h3>
<ul style="margin: 0; padding-left: 20px; color: #333;">
<li style="margin-bottom: 8px;">Receive and manage customer inquiries</li>
<li style="margin-bottom: 8px;">Send professional quotes and contracts</li>
<li style="margin-bottom: 8px;">Track your business growth with analytics</li>
<li style="margin-bottom: 8px;">Connect with our community of successful bakers</li>
</ul>
</div>

<div style="text-align: center; margin: 30px 0;">
<a href="${dashboardUrl}" style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
Go to Dashboard
</a>
<a href="${supportUrl}" style="background-color: #7c2d12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
Get Support
</a>
</div>

<p style="font-size: 16px; color: #7c2d12; text-align: center; font-weight: 600; margin: 30px 0;">
Here's to your sweet success! 🎂
</p>

<p style="font-size: 14px; color: #666;">
Best regards,<br>
<strong>The BakerIQ Team</strong>
</p>
</div>`
  }),

  bakerPasswordReset: (name: string, resetUrl: string) => ({
    subject: 'Reset your BakerIQ password',
    textPart: `Hi ${name},

We received a request to reset your BakerIQ account password.

Click here to reset your password: ${resetUrl}

This link will expire in 15 minutes for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

Best regards,
The BakerIQ Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="text-align: center; margin-bottom: 30px;">
<h1 style="color: #7c2d12; margin: 0;">Reset Your Password 🔐</h1>
</div>

<p style="font-size: 16px; line-height: 1.5; color: #333;">Hi <strong>${name}</strong>,</p>

<p style="font-size: 16px; line-height: 1.5; color: #333;">
We received a request to reset your BakerIQ account password.
</p>

<p style="font-size: 16px; line-height: 1.5; color: #333;">
Click the button below to create a new password:
</p>

<div style="text-align: center; margin: 30px 0;">
<a href="${resetUrl}" style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
Reset Password
</a>
</div>

<div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f97316;">
<p style="margin: 0; color: #7c2d12; font-weight: 600;">⚠️ Security Notice</p>
<p style="margin: 10px 0 0 0; color: #333; font-size: 14px;">
This link will expire in 15 minutes for security reasons. If you need a new link, you can request another password reset.
</p>
</div>

<p style="font-size: 14px; line-height: 1.5; color: #666; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
If the button doesn't work, you can copy and paste this link into your browser:<br>
<a href="${resetUrl}" style="color: #7c2d12; word-break: break-all;">${resetUrl}</a>
</p>

<p style="font-size: 14px; color: #666;">
If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
</p>

<p style="font-size: 14px; color: #666;">
Best regards,<br>
<strong>The BakerIQ Team</strong>
</p>
</div>`
  }),

  calculatorLeadConfirmation: (customerName: string, estimatedPrice: number, eventDate?: string) => ({
    subject: `Your Cake Quote Request Received - ${estimatedPrice ? `$${estimatedPrice.toFixed(2)} Estimate` : 'Details Saved'}`,
    textPart: `Hi ${customerName},

Thank you for using our Wedding Cake Calculator!

Your cake quote request has been received and saved. ${estimatedPrice ? `Your estimated price is $${estimatedPrice.toFixed(2)}.` : ''}${eventDate ? ` We've noted your event date of ${eventDate}.` : ''}

What's Next:
• Your information has been added to our mailing list for special offers and bakery promotions
• Local bakers in our network will be able to view your request
• You can browse our bakery directory to connect directly with bakers
• We'll keep you updated on special offers and tips for your big day

Need help or have questions? Feel free to reach out anytime.

Best wishes for your event planning!

The BakerIQ Team`,
    htmlPart: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="text-align: center; margin-bottom: 30px;">
<h1 style="color: #f97316; margin: 0;">Your Cake Quote is Saved! 🎂</h1>
</div>

<p style="font-size: 16px; line-height: 1.5; color: #333;">Hi <strong>${customerName}</strong>,</p>

<p style="font-size: 16px; line-height: 1.5; color: #333;">
Thank you for using our Wedding Cake Calculator! Your cake quote request has been received.
</p>

${estimatedPrice || eventDate ? `<div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
<h3 style="color: #7c2d12; margin-top: 0;">Your Details:</h3>
<ul style="list-style: none; padding: 0; color: #333;">
${estimatedPrice ? `<li style="margin-bottom: 8px;"><strong>Estimated Price:</strong> $${estimatedPrice.toFixed(2)}</li>` : ''}
${eventDate ? `<li style="margin-bottom: 8px;"><strong>Event Date:</strong> ${eventDate}</li>` : ''}
</ul>
</div>` : ''}

<div style="background-color: #fef7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
<h3 style="color: #7c2d12; margin-top: 0;">What's Next?</h3>
<ul style="color: #333; padding-left: 20px;">
<li style="margin-bottom: 8px;">You're now on our mailing list for special offers and bakery promotions</li>
<li style="margin-bottom: 8px;">Local bakers in our network can view your request</li>
<li style="margin-bottom: 8px;">Browse our bakery directory to connect directly with bakers</li>
<li style="margin-bottom: 8px;">We'll keep you updated on special offers and tips for your big day</li>
</ul>
</div>

<p style="font-size: 16px; line-height: 1.5; color: #333;">
Need help or have questions? Feel free to reach out anytime.
</p>

<p style="font-size: 16px; line-height: 1.5; color: #333;">
Best wishes for your event planning! 🎉
</p>

<p style="font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
Best regards,<br>
<strong>The BakerIQ Team</strong>
</p>
</div>`
  })
};