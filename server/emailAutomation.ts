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
        from: 'noreply@bakewise.co',
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
          from: 'noreply@bakewise.co',
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
          from: 'noreply@bakewise.co',
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
        from: 'noreply@bakewise.co',
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

  // Run all email automation checks (to be called by scheduler)
  static async runAutomationChecks() {
    console.log('Running email automation checks...');
    
    const warningsCount = await this.sendTrialExpirationWarnings();
    const expiredCount = await this.sendTrialExpiredNotifications();
    
    console.log(`Email automation completed: ${warningsCount} warnings, ${expiredCount} expired notifications sent`);
    
    return {
      warnings: warningsCount,
      expired: expiredCount
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