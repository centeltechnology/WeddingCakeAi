import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const isProd = process.env.NODE_ENV === "production";
const ses = new SESv2Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  } : undefined,
});

export async function sendResetEmail(to: string, link: string) {
  const from = process.env.SES_FROM || "no-reply@bakeriq.app";
  const Subject = "Reset your BakerIQ password";
  const Text = `Tap the link to reset your password (valid for 30 minutes): ${link}`;
  const Html = `
    <div style="font-family:Inter,Arial,sans-serif">
      <h2>Reset your BakerIQ password</h2>
      <p>This link is valid for 30 minutes and can be used once.</p>
      <p><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Reset Password</a></p>
      <p>If you didn't request this, ignore this email.</p>
    </div>`;

  // Dev fallback: log to console
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log("[DEV email] To:", to, "Link:", link);
    return;
  }

  await ses.send(new SendEmailCommand({
    FromEmailAddress: from,
    Destination: { ToAddresses: [to] },
    Content: {
      Simple: {
        Subject: { Data: Subject },
        Body: { Text: { Data: Text }, Html: { Data: Html } }
      }
    }
  }));
}
