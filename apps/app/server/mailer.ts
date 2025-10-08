import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { resetEmail } from "./emails/resetEmail";

const isProd = process.env.NODE_ENV === "production";
const ses = new SESv2Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  } : undefined,
});

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Generic email sender using AWS SES v2
 * Falls back to console logging in dev if AWS credentials are missing
 */
export async function sendMail({ to, subject, html, text }: SendMailOptions) {
  const from = process.env.SES_FROM || "no-reply@bakeriq.app";

  // Dev fallback: log to console
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log("[DEV email]");
    console.log("  To:", to);
    console.log("  Subject:", subject);
    console.log("\n--- Text Version ---");
    console.log(text);
    console.log("\n--- HTML Version ---");
    console.log(html);
    console.log("--- End Email ---\n");
    return;
  }

  try {
    await ses.send(new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: subject },
          Body: { Text: { Data: text }, Html: { Data: html } }
        }
      }
    }));
    console.log(`[Email sent] To: ${to}, Subject: ${subject}`);
  } catch (error) {
    console.error("[Email error]", error);
    // In dev mode, still log the email content for debugging
    if (!isProd) {
      console.log("[DEV email fallback]");
      console.log("  To:", to);
      console.log("  Subject:", subject);
      console.log("\n--- Text Version ---");
      console.log(text);
      console.log("\n--- HTML Version ---");
      console.log(html);
      console.log("--- End Email ---\n");
    }
    throw error; // Re-throw so caller can handle
  }
}

/**
 * Send password reset email with branded template
 */
export async function sendResetEmail(to: string, link: string) {
  const { subject, html, text } = resetEmail({ link });
  await sendMail({ to, subject, html, text });
}
