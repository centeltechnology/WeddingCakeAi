import { storage } from "./storage";
import { sendEmail, emailTemplates } from "./emailService";
import { differenceInDays, isAfter, format, addDays, differenceInHours } from "date-fns";
import { FREE_TO_PAID_CAMPAIGN, getEmailTemplate, interpolateEmailTemplate } from "./emailTemplates";
import { randomUUID } from "crypto";

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
        from: 'noreply@bakeriq.app',
        fromName: 'BakerIQ Team',
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
          from: 'noreply@bakeriq.app',
          fromName: 'BakerIQ Team',
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
          from: 'noreply@bakeriq.app',
          fromName: 'BakerIQ Team',
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
        from: 'noreply@bakeriq.app',
        fromName: 'BakerIQ Team',
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
          subscriptionPlan: 'starter',
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
        subject: `Account Downgraded - You're still welcome at BakerIQ`,
        htmlPart: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
<div style="background: #6b7280; padding: 30px; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
    📋 Account Update
  </h1>
</div>

<div style="padding: 40px 30px;">
  <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hi ${baker.name},</p>
  
  <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
    Your trial has expired and your account has been moved to our free tier. Don't worry - you can still use BakerIQ with some limitations.
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
    <a href="https://bakeriq.app/billing" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 10px 10px 0;">
      Upgrade Anytime →
    </a>
    <a href="https://bakeriq.app/dashboard" style="display: inline-block; background: transparent; color: #6b7280; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; border: 1px solid #d1d5db;">
      Continue with Free
    </a>
  </div>

  <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 30px 0 0 0;">
    Ready to unlock premium features? <a href="https://bakeriq.app/billing" style="color: #f97316;">Upgrade your plan</a> anytime.
  </p>
</div>
</div>`,
        textPart: `Hi ${baker.name}, your trial has expired and your account has been moved to our free tier. You can still use BakerIQ with 5 portfolio images, basic lead management, and essential analytics. Upgrade anytime at https://bakeriq.app/billing`
      };

      const success = await sendEmail({
        to: baker.email,
        toName: baker.name,
        from: 'noreply@bakeriq.app',
        fromName: 'BakerIQ Team',
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

  // ====== CONVERSION CAMPAIGN METHODS ======
  
  // Enroll free users in the 7-day conversion campaign
  static async enrollFreeUsersInCampaign() {
    try {
      const bakers = await storage.getBakers();
      let enrolledCount = 0;
      
      for (const baker of bakers) {
        // Only enroll free users with emails who aren't already enrolled
        if (!baker.email || baker.subscriptionPlan !== 'starter') continue;
        
        // Check if already enrolled in active campaign
        const existingEnrollments = await storage.getEnrollmentsByUser(undefined, baker.id);
        const activeEnrollment = existingEnrollments.find(e => 
          e.campaignKey === 'free_to_paid_7day' && 
          ['active', 'completed'].includes(e.status)
        );
        
        if (activeEnrollment) continue; // Skip if already enrolled
        
        // Create enrollment
        const enrollment = await storage.createCampaignEnrollment({
          bakerId: baker.id,
          campaignKey: 'free_to_paid_7day',
          status: 'active',
          lastStepSent: 0,
          sendHour: 16, // 4 PM UTC default
          metadata: {
            enrollmentSource: 'auto_free_user',
            originalPlan: baker.subscriptionPlan || 'starter',
            unsubscribeToken: randomUUID()
          }
        });
        
        console.log(`Enrolled baker ${baker.name} in conversion campaign`);
        enrolledCount++;
      }
      
      console.log(`Enrolled ${enrolledCount} free users in conversion campaign`);
      return enrolledCount;
      
    } catch (error) {
      console.error('Error enrolling users in campaign:', error);
      return 0;
    }
  }
  
  // Process conversion campaign emails (check for users due for next step)
  static async processCampaignEmails() {
    try {
      const currentHour = new Date().getUTCHours();
      const enrollments = await storage.getActiveEnrollmentsDue('free_to_paid_7day', currentHour);
      let emailsSent = 0;
      
      for (const enrollment of enrollments) {
        try {
          // Determine next step
          const nextStep = (enrollment.lastStepSent || 0) + 1;
          if (nextStep > 7) continue; // Campaign complete
          
          // Get baker info
          const baker = enrollment.bakerId ? await storage.getBaker(enrollment.bakerId) : null;
          if (!baker || !baker.email) continue;
          
          // Check if user has upgraded (stop campaign)
          if (baker.subscriptionPlan !== 'starter') {
            await storage.markConverted(enrollment.id, baker.subscriptionPlan || 'professional');
            console.log(`Baker ${baker.name} converted to ${baker.subscriptionPlan}, stopping campaign`);
            continue;
          }
          
          // Get email template
          const template = getEmailTemplate('free_to_paid_7day', nextStep);
          if (!template) continue;
          
          // Interpolate template with user data
          const unsubscribeToken = enrollment.metadata?.unsubscribeToken || randomUUID();
          const interpolated = interpolateEmailTemplate(template, {
            upgradeUrl: `https://bakeriq.app/pricing?utm_source=email&utm_campaign=free_to_paid&utm_content=step${nextStep}&token=${enrollment.id}`,
            unsubscribeUrl: `https://bakeriq.app/unsubscribe?token=${unsubscribeToken}`,
            userName: baker.name,
            bakeryName: baker.name
          });
          
          // Send email
          const success = await sendEmail({
            to: baker.email,
            toName: baker.name,
            from: 'noreply@bakeriq.app',
            fromName: 'BakerIQ Team',
            subject: interpolated.subject,
            htmlPart: interpolated.body,
            textPart: this.htmlToText(interpolated.body)
          });
          
          if (success) {
            // Mark step as sent
            await storage.markStepSent(enrollment.id, nextStep);
            
            // Track event
            await storage.createCampaignEvent({
              enrollmentId: enrollment.id,
              bakerId: baker.id,
              campaignKey: 'free_to_paid_7day',
              step: nextStep,
              eventType: 'sent',
              metadata: {
                emailSubject: interpolated.subject
              }
            });
            
            console.log(`Sent conversion email step ${nextStep} to ${baker.name}`);
            emailsSent++;
          }
          
        } catch (stepError) {
          console.error(`Error processing campaign step for enrollment ${enrollment.id}:`, stepError);
        }
      }
      
      console.log(`Sent ${emailsSent} conversion campaign emails`);
      return emailsSent;
      
    } catch (error) {
      console.error('Error processing campaign emails:', error);
      return 0;
    }
  }
  
  // Helper to convert HTML to plain text for email
  private static htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim();
  }
  
  // Mark user as converted and stop campaigns
  static async markUserConverted(bakerId: string, planName: string) {
    try {
      const enrollments = await storage.getEnrollmentsByUser(undefined, bakerId);
      let conversionsMarked = 0;
      
      for (const enrollment of enrollments) {
        if (enrollment.status === 'active') {
          await storage.markConverted(enrollment.id, planName);
          
          // Track conversion event
          await storage.createCampaignEvent({
            enrollmentId: enrollment.id,
            bakerId: bakerId,
            campaignKey: enrollment.campaignKey,
            step: enrollment.lastStepSent || 0,
            eventType: 'converted',
            metadata: {
              emailSubject: `Converted to ${planName}`
            }
          });
          
          conversionsMarked++;
        }
      }
      
      console.log(`Marked ${conversionsMarked} campaigns as converted for baker ${bakerId}`);
      return conversionsMarked;
      
    } catch (error) {
      console.error('Error marking user as converted:', error);
      return 0;
    }
  }

  // Run all automation checks including downgrades (to be called by scheduler)
  static async runAutomationChecks() {
    console.log('Running subscription lifecycle automation checks...');
    
    const warningsCount = await this.sendTrialExpirationWarnings();
    const expiredCount = await this.sendTrialExpiredNotifications();
    const downgradedCount = await this.processExpiredTrials();
    
    // Process conversion campaigns
    console.log('Running conversion campaign automation...');
    const enrolledCount = await this.enrollFreeUsersInCampaign();
    const campaignEmailsCount = await this.processCampaignEmails();
    
    console.log(`Automation completed: ${warningsCount} warnings, ${expiredCount} expired notifications, ${downgradedCount} downgrades processed`);
    console.log(`Campaign automation: ${enrolledCount} users enrolled, ${campaignEmailsCount} campaign emails sent`);
    
    return {
      warnings: warningsCount,
      expired: expiredCount,
      downgrades: downgradedCount,
      campaignEnrollments: enrolledCount,
      campaignEmails: campaignEmailsCount
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

  // ====== CONVERSION TRACKING HOOKS ======
  
  /**
   * Check if a user is enrolled in a conversion campaign and mark them as converted
   * Call this when a user upgrades from starter to pro/plus plans
   */
  static async trackUserConversion(bakerId: string, newPlan: string) {
    try {
      // Check if baker is enrolled in active conversion campaign
      const enrollments = await storage.getEnrollmentsByUser(undefined, bakerId);
      const activeEnrollment = enrollments.find(e => 
        e.status === 'active' && 
        e.campaignKey === 'free_to_paid_7day'
      );

      if (!activeEnrollment) {
        console.log(`No active conversion campaign found for baker ${bakerId}`);
        return false;
      }

      // Check if this is actually a conversion (starter -> pro/plus)
      const baker = await storage.getBaker(bakerId);
      const previousPlan = baker?.subscriptionPlan || 'starter';
      
      if (previousPlan === 'starter' && (newPlan === 'professional' || newPlan === 'enterprise')) {
        // This is a valid conversion! Mark it
        await storage.markConverted(activeEnrollment.id, newPlan);
        
        // Track conversion event
        await storage.createCampaignEvent({
          enrollmentId: activeEnrollment.id,
          bakerId: bakerId,
          campaignKey: activeEnrollment.campaignKey,
          step: activeEnrollment.lastStepSent || 0,
          eventType: 'converted',
          metadata: {
            emailSubject: `Converted from ${previousPlan} to ${newPlan}`
          }
        });

        console.log(`🎉 Conversion tracked: Baker ${bakerId} upgraded from ${previousPlan} to ${newPlan}`);
        return true;
      } else {
        console.log(`Plan change not counted as conversion: ${previousPlan} -> ${newPlan}`);
        return false;
      }
    } catch (error) {
      console.error('Error tracking user conversion:', error);
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