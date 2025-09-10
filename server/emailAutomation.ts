import { storage } from "./storage";
import { sendEmail, emailTemplates } from "./emailService";
import { differenceInDays, isAfter, format } from "date-fns";

// Email automation service for subscription lifecycle management
export class EmailAutomationService {
  
  // Send welcome email when user starts trial
  static async sendTrialWelcomeEmail(bakerId: string) {
    try {
      const baker = await storage.getBaker(bakerId);
      if (!baker || !baker.email) return false;

      // Calculate trial end date (14 days from now)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      const template = emailTemplates.trialWelcome(
        baker.name, 
        trialEndDate.toISOString()
      );

      const success = await sendEmail({
        to: baker.email,
        toName: baker.name,
        from: 'noreply@bakewiseapp.com',
        fromName: 'Bakewise Team',
        subject: template.subject,
        htmlPart: template.htmlPart,
        textPart: template.textPart
      });

      if (success) {
        console.log(`Trial welcome email sent to ${baker.name} (${baker.email})`);
        // Track email sent to avoid duplicates
        await this.trackEmailSent(bakerId, 'trial_welcome');
      }

      return success;
    } catch (error) {
      console.error('Error sending trial welcome email:', error);
      return false;
    }
  }

  // Send trial expiration warning emails
  static async sendTrialExpirationWarnings() {
    try {
      const bakers = await storage.getBakers();
      const now = new Date();
      let emailsSent = 0;

      for (const baker of bakers) {
        // Skip if not trialing or no email
        if (baker.subscriptionStatus !== 'trialing' || !baker.email || !baker.currentPeriodEnd) {
          continue;
        }

        const trialEndDate = new Date(baker.currentPeriodEnd);
        const daysLeft = differenceInDays(trialEndDate, now);
        
        // Skip if trial already expired (negative days)
        if (daysLeft < 0) continue;

        // Check if we should send warning email
        const shouldSendWarning = 
          daysLeft === 7 || // 7-day info warning
          daysLeft === 3 || // 3-day warning
          daysLeft === 1 || // 1-day urgent warning
          daysLeft === 0;   // Same day warning

        if (!shouldSendWarning) continue;

        // Check if we already sent this warning type
        const warningType = `trial_warning_${daysLeft}`;
        if (await this.wasEmailSent(baker.id, warningType)) {
          continue;
        }

        // Send warning email
        const template = emailTemplates.trialExpirationWarning(
          baker.name,
          daysLeft,
          trialEndDate.toISOString()
        );

        const success = await sendEmail({
          to: baker.email,
          toName: baker.name,
          from: 'noreply@bakewiseapp.com',
          fromName: 'Bakewise Team',
          subject: template.subject,
          htmlPart: template.htmlPart,
          textPart: template.textPart
        });

        if (success) {
          console.log(`Trial warning email sent to ${baker.name} (${daysLeft} days left)`);
          await this.trackEmailSent(baker.id, warningType);
          emailsSent++;
        }
      }

      console.log(`Sent ${emailsSent} trial warning emails`);
      return emailsSent;

    } catch (error) {
      console.error('Error sending trial expiration warnings:', error);
      return 0;
    }
  }

  // Send trial expired notifications
  static async sendTrialExpiredNotifications() {
    try {
      const bakers = await storage.getBakers();
      const now = new Date();
      let emailsSent = 0;

      for (const baker of bakers) {
        // Skip if not trialing or no email
        if (baker.subscriptionStatus !== 'trialing' || !baker.email || !baker.currentPeriodEnd) {
          continue;
        }

        const trialEndDate = new Date(baker.currentPeriodEnd);
        const daysAfterExpiration = differenceInDays(now, trialEndDate);
        
        // Only send to recently expired trials (1-3 days after expiration)
        if (daysAfterExpiration < 1 || daysAfterExpiration > 3) continue;

        // Check if we already sent expired email
        if (await this.wasEmailSent(baker.id, 'trial_expired')) {
          continue;
        }

        // Send expired notification
        const template = emailTemplates.trialExpired(baker.name);

        const success = await sendEmail({
          to: baker.email,
          toName: baker.name,
          from: 'noreply@bakewiseapp.com',
          fromName: 'Bakewise Team',
          subject: template.subject,
          htmlPart: template.htmlPart,
          textPart: template.textPart
        });

        if (success) {
          console.log(`Trial expired email sent to ${baker.name}`);
          await this.trackEmailSent(baker.id, 'trial_expired');
          emailsSent++;
        }
      }

      console.log(`Sent ${emailsSent} trial expired emails`);
      return emailsSent;

    } catch (error) {
      console.error('Error sending trial expired notifications:', error);
      return 0;
    }
  }

  // Send subscription success email
  static async sendSubscriptionSuccessEmail(bakerId: string, planName: string) {
    try {
      const baker = await storage.getBaker(bakerId);
      if (!baker || !baker.email) return false;

      const template = emailTemplates.subscriptionSuccess(baker.name, planName);

      const success = await sendEmail({
        to: baker.email,
        toName: baker.name,
        from: 'noreply@bakewiseapp.com',
        fromName: 'Bakewise Team',
        subject: template.subject,
        htmlPart: template.htmlPart,
        textPart: template.textPart
      });

      if (success) {
        console.log(`Subscription success email sent to ${baker.name} (${planName})`);
        await this.trackEmailSent(bakerId, 'subscription_success');
      }

      return success;
    } catch (error) {
      console.error('Error sending subscription success email:', error);
      return false;
    }
  }

  // Automatically downgrade expired trials to free tier
  static async processExpiredTrials() {
    try {
      const bakers = await storage.getBakers() || [];
      const now = new Date();
      let downgradedCount = 0;

      for (const baker of bakers) {
        // Only process trialing accounts
        if (baker.subscriptionStatus !== 'trialing' || !baker.currentPeriodEnd) {
          continue;
        }

        const trialEndDate = new Date(baker.currentPeriodEnd);
        const isExpired = isAfter(now, trialEndDate);

        // Skip if trial hasn't expired yet
        if (!isExpired) continue;

        // Calculate how many days since expiration
        const daysExpired = differenceInDays(now, trialEndDate);

        // Allow 3-day grace period before automatic downgrade
        if (daysExpired < 3) continue;

        console.log(`Processing expired trial for baker ${baker.name} (expired ${daysExpired} days ago)`);

        // Downgrade to free tier
        await storage.updateBaker(baker.id, {
          subscriptionStatus: 'cancelled',
          stripeSubscriptionId: null,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          planName: 'Free',
          // Keep existing portfolio but limit to 5 images in frontend
          // Keep existing leads but limit new lead generation
        });

        console.log(`Baker ${baker.name} automatically downgraded to free tier`);
        downgradedCount++;

        // Optional: Send a final "You've been downgraded" email
        if (baker.email && daysExpired === 3) {
          await this.sendDowngradeNotification(baker);
        }
      }

      console.log(`Automatically downgraded ${downgradedCount} expired trials to free tier`);
      return downgradedCount;

    } catch (error) {
      console.error('Error processing expired trials:', error);
      return 0;
    }
  }

  // Send downgrade notification email
  private static async sendDowngradeNotification(baker: any) {
    try {
      const template = {
        subject: `Account Downgraded - You're still welcome at Bakewise`,
        htmlPart: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
<div style="background: #6b7280; padding: 30px; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
    📋 Account Update
  </h1>
</div>

<div style="padding: 40px 30px;">
  <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hi ${baker.name},</p>
  
  <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
    Your trial has expired and your account has been moved to our free tier. Don't worry - you can still use Bakewise with some limitations.
  </p>

  <div style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">🎯 Free Tier Includes:</h3>
    <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.6;">
      <li>5 portfolio images</li>
      <li>Basic lead management</li>
      <li>Essential analytics</li>
      <li>Community support</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://bakewise.app/billing" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 10px 10px 0;">
      Upgrade Anytime →
    </a>
    <a href="https://bakewise.app/dashboard" style="display: inline-block; background: transparent; color: #6b7280; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; border: 1px solid #d1d5db;">
      Continue with Free
    </a>
  </div>

  <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 30px 0 0 0;">
    Ready to unlock premium features? <a href="https://bakewise.app/billing" style="color: #f97316;">Upgrade your plan</a> anytime.
  </p>
</div>
</div>`,
        textPart: `Hi ${baker.name}, your trial has expired and your account has been moved to our free tier. You can still use Bakewise with 5 portfolio images, basic lead management, and essential analytics. Upgrade anytime at https://bakewise.app/billing`
      };

      const success = await sendEmail({
        to: baker.email,
        toName: baker.name,
        from: 'noreply@bakewiseapp.com',
        fromName: 'Bakewise Team',
        subject: template.subject,
        htmlPart: template.htmlPart,
        textPart: template.textPart
      });

      if (success) {
        console.log(`Downgrade notification sent to ${baker.name}`);
        await this.trackEmailSent(baker.id, 'downgrade_notification');
      }

      return success;
    } catch (error) {
      console.error('Error sending downgrade notification:', error);
      return false;
    }
  }

  // Run all automation checks including downgrades (to be called by scheduler)
  static async runAutomationChecks() {
    console.log('Running subscription lifecycle automation checks...');
    
    const warningsCount = await this.sendTrialExpirationWarnings();
    const expiredCount = await this.sendTrialExpiredNotifications();
    const downgradedCount = await this.processExpiredTrials();
    
    console.log(`Automation completed: ${warningsCount} warnings, ${expiredCount} expired notifications, ${downgradedCount} downgrades processed`);
    
    return {
      warnings: warningsCount,
      expired: expiredCount,
      downgrades: downgradedCount
    };
  }

  // Track that an email was sent to prevent duplicates
  private static async trackEmailSent(bakerId: string, emailType: string) {
    try {
      // In a real app, you'd store this in a database table like email_log
      // For now, we'll track in memory or baker's metadata
      console.log(`Tracking email sent: ${emailType} to baker ${bakerId}`);
      
      // You could implement this by adding an emailLog field to baker schema
      // or creating a separate email tracking table
      
    } catch (error) {
      console.error('Error tracking email sent:', error);
    }
  }

  // Check if an email type was already sent to prevent duplicates
  private static async wasEmailSent(bakerId: string, emailType: string): Promise<boolean> {
    try {
      // In a real app, you'd check the database for this email type
      // For now, we'll return false to always send (but track above)
      return false;
      
    } catch (error) {
      console.error('Error checking email sent status:', error);
      return false;
    }
  }
}

// Scheduler function to run email automation periodically
export function startEmailAutomationScheduler() {
  console.log('Starting email automation scheduler...');
  
  // Run immediately on startup
  EmailAutomationService.runAutomationChecks();
  
  // Then run every 4 hours
  const FOUR_HOURS = 4 * 60 * 60 * 1000;
  setInterval(() => {
    EmailAutomationService.runAutomationChecks();
  }, FOUR_HOURS);
  
  console.log('Email automation scheduler started (runs every 4 hours)');
}