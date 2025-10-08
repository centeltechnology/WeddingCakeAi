interface WelcomeEmailData {
  email: string;
  name: string;
  tempPassword: string;
  subdomain: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  const { email, name, tempPassword, subdomain } = data;

  // TODO: Integrate with SES/Sendy or email service
  // For now, this is a stub that logs the email

  const emailContent = `
    Welcome to BakerIQ, ${name}!

    Your baker account has been created. Here are your login details:

    Email: ${email}
    Temporary Password: ${tempPassword}
    
    Your bakery dashboard: https://${subdomain}.bakeriq.app/baker/dashboard
    
    Please log in and change your password immediately.
    
    If you have any questions, reply to this email.

    Best regards,
    The BakerIQ Team
  `;

  console.log('[Welcome Email] TODO: Send email to', email);
  console.log('[Welcome Email] Subject: Welcome to BakerIQ - Set Up Your Account');
  console.log('[Welcome Email] Content:\n', emailContent);

  // TODO: Uncomment when email service is configured
  // await sendEmail({
  //   to: email,
  //   subject: 'Welcome to BakerIQ - Set Up Your Account',
  //   text: emailContent,
  //   htmlPart: `<h2>Welcome to BakerIQ, ${name}!</h2>
  //     <p>Your baker account has been created. Here are your login details:</p>
  //     <ul>
  //       <li><strong>Email:</strong> ${email}</li>
  //       <li><strong>Temporary Password:</strong> ${tempPassword}</li>
  //     </ul>
  //     <p><a href="https://${subdomain}.bakeriq.app/baker/dashboard">Log in to your dashboard</a></p>
  //     <p>Please change your password immediately after logging in.</p>
  //     <p>Best regards,<br>The BakerIQ Team</p>`,
  // });
}
