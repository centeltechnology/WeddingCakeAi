export interface EmailTemplate {
  subject: string;
  body: string;
  cta: {
    text: string;
    url: string;
  };
}

export interface CampaignEmailTemplates {
  [key: string]: EmailTemplate;
}

// 7-Day Free-to-Paid Conversion Campaign Templates
export const FREE_TO_PAID_CAMPAIGN: CampaignEmailTemplates = {
  step1: {
    subject: "Welcome to Bakewise - Let's grow your bakery business! 🎂",
    body: `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef7ed;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; font-size: 28px; margin-bottom: 10px;">Welcome to Bakewise!</h1>
            <p style="color: #78716c; font-size: 16px;">The professional platform that helps bakeries grow and thrive</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h2 style="color: #292524; margin-bottom: 20px;">Ready to take your bakery to the next level?</h2>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 20px;">
              Hi there! I'm excited to welcome you to Bakewise. You've just joined thousands of successful bakers who use our platform to:
            </p>
            
            <ul style="color: #44403c; line-height: 1.8; margin-bottom: 25px;">
              <li><strong>Automate customer management</strong> - Never lose track of orders again</li>
              <li><strong>Generate professional quotes</strong> - Impress clients with branded estimates</li>
              <li><strong>Track revenue and growth</strong> - See exactly how your business is performing</li>
              <li><strong>Streamline operations</strong> - Focus on baking, not paperwork</li>
            </ul>
            
            <div style="background: #fef7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; margin-bottom: 25px;">
              <p style="color: #78716c; margin: 0; font-style: italic;">
                "Since using Bakewise, my revenue has increased by 40% and I save 10 hours per week on administrative tasks." - Sarah M., Custom Cake Designer
              </p>
            </div>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              Your free account gives you a taste of what's possible, but our Professional and Plus plans unlock the full potential of your bakery business.
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="{{upgradeUrl}}" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Explore Professional Features →
            </a>
          </div>
          
          <div style="text-align: center; color: #78716c; font-size: 14px;">
            <p>Questions? Reply to this email - I read every response!</p>
            <p><a href="{{unsubscribeUrl}}" style="color: #78716c;">Unsubscribe</a></p>
          </div>
        </body>
      </html>
    `,
    cta: {
      text: "Explore Professional Features →",
      url: "/pricing?utm_source=email&utm_campaign=free_to_paid&utm_content=step1"
    }
  },

  step2: {
    subject: "See how Professional features can transform your bakery 📈",
    body: `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef7ed;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; font-size: 24px; margin-bottom: 10px;">Professional Features Deep Dive</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              Hi! Yesterday I shared how Bakewise can help grow your bakery. Today, let me show you exactly what our Professional plan includes:
            </p>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #f97316; margin-bottom: 15px;">🏢 Advanced Customer Management</h3>
              <p style="color: #44403c; line-height: 1.6; margin-bottom: 10px;">
                • Unlimited customer profiles with order history<br>
                • Automated follow-up sequences<br>
                • Customer segmentation and targeting<br>
                • Birthday and anniversary reminders
              </p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #f97316; margin-bottom: 15px;">📊 Business Analytics Dashboard</h3>
              <p style="color: #44403c; line-height: 1.6; margin-bottom: 10px;">
                • Revenue tracking and projections<br>
                • Popular product insights<br>
                • Seasonal trends analysis<br>
                • Profit margin optimization
              </p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #f97316; margin-bottom: 15px;">📝 Professional Quote Generation</h3>
              <p style="color: #44403c; line-height: 1.6; margin-bottom: 10px;">
                • Branded quote templates<br>
                • Automatic pricing calculations<br>
                • Digital signature collection<br>
                • Payment processing integration
              </p>
            </div>
            
            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 25px;">
              <h4 style="color: #1e40af; margin-bottom: 10px;">Case Study: Maria's Cupcake Corner</h4>
              <p style="color: #1e3a8a; margin: 0; line-height: 1.6;">
                "After upgrading to Professional, I increased my average order value by 35% using the analytics insights. The automated customer follow-ups alone brought back $3,200 in repeat business last month."
              </p>
            </div>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              <strong>Limited Time:</strong> Upgrade this week and get 2 months free on your first year!
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="{{upgradeUrl}}" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Start Free Trial - Pro Features
            </a>
          </div>
          
          <div style="text-align: center; color: #78716c; font-size: 14px;">
            <p><a href="{{unsubscribeUrl}}" style="color: #78716c;">Unsubscribe</a></p>
          </div>
        </body>
      </html>
    `,
    cta: {
      text: "Start Free Trial - Pro Features",
      url: "/pricing?utm_source=email&utm_campaign=free_to_paid&utm_content=step2"
    }
  },

  step3: {
    subject: "Quick question: What's holding back your bakery growth? 🤔",
    body: `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef7ed;">
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h2 style="color: #292524; margin-bottom: 20px;">I want to understand your challenges</h2>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              Hi! I've been thinking about your bakery and the challenges you might be facing. 
            </p>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              Every baker I talk to mentions similar frustrations:
            </p>
            
            <div style="margin-bottom: 30px;">
              <div style="background: #fef7ed; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f97316;">
                <p style="color: #44403c; margin: 0;"><strong>"I spend too much time on paperwork instead of baking"</strong></p>
              </div>
              <div style="background: #fef7ed; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f97316;">
                <p style="color: #44403c; margin: 0;"><strong>"I lose track of customer orders and preferences"</strong></p>
              </div>
              <div style="background: #fef7ed; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f97316;">
                <p style="color: #44403c; margin: 0;"><strong>"I don't know which products are most profitable"</strong></p>
              </div>
              <div style="background: #fef7ed; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f97316;">
                <p style="color: #44403c; margin: 0;"><strong>"My quotes look unprofessional compared to competitors"</strong></p>
              </div>
            </div>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              Does any of this sound familiar? I designed Bakewise specifically to solve these exact problems.
            </p>
            
            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 25px;">
              <h4 style="color: #1e40af; margin-bottom: 10px;">💡 Here's what changes when you upgrade:</h4>
              <ul style="color: #1e3a8a; line-height: 1.8; margin: 0;">
                <li>Paperwork time drops by 70% with automation</li>
                <li>Customer satisfaction increases with better organization</li>
                <li>Revenue grows 25-40% with data-driven decisions</li>
                <li>Professional appearance wins more high-value clients</li>
              </ul>
            </div>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              <strong>Still on the fence?</strong> I'm offering a risk-free 30-day trial. If Bakewise doesn't transform your business, get a full refund.
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="{{upgradeUrl}}" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Try Risk-Free for 30 Days
            </a>
          </div>
          
          <div style="text-align: center; color: #78716c; font-size: 14px;">
            <p>Reply with your biggest business challenge - I read every email!</p>
            <p><a href="{{unsubscribeUrl}}" style="color: #78716c;">Unsubscribe</a></p>
          </div>
        </body>
      </html>
    `,
    cta: {
      text: "Try Risk-Free for 30 Days",
      url: "/pricing?utm_source=email&utm_campaign=free_to_paid&utm_content=step3"
    }
  },

  step4: {
    subject: "Success story: How Emma doubled her bakery revenue 💰",
    body: `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef7ed;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; font-size: 24px; margin-bottom: 10px;">Customer Success Story</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #1e40af; margin-bottom: 15px;">Emma's Sweet Success</h3>
              <p style="color: #1e3a8a; font-style: italic; margin-bottom: 15px;">
                "I was skeptical about paying for business software, but Bakewise literally transformed my small home bakery into a thriving business."
              </p>
              <p style="color: #1e3a8a; margin: 0; font-weight: bold;">
                - Emma Rodriguez, Sweet Delights Bakery
              </p>
            </div>
            
            <h3 style="color: #292524; margin-bottom: 20px;">Emma's Journey:</h3>
            
            <div style="margin-bottom: 25px;">
              <h4 style="color: #f97316; margin-bottom: 10px;">📉 Before Bakewise (Struggling):</h4>
              <ul style="color: #44403c; line-height: 1.8;">
                <li>Working 70+ hours per week</li>
                <li>$3,200 monthly revenue</li>
                <li>Lost orders due to poor organization</li>
                <li>Competing on price, not value</li>
                <li>Stressed and considering quitting</li>
              </ul>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h4 style="color: #16a34a; margin-bottom: 10px;">📈 After 6 Months with Professional Plan:</h4>
              <ul style="color: #44403c; line-height: 1.8;">
                <li>Working 45 hours per week</li>
                <li>$6,800 monthly revenue (+112%)</li>
                <li>Zero lost orders with automated tracking</li>
                <li>Premium pricing with professional quotes</li>
                <li>Planning expansion to a storefront</li>
              </ul>
            </div>
            
            <div style="background: #fef7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; margin-bottom: 25px;">
              <h4 style="color: #ea580c; margin-bottom: 10px;">Emma's Top 3 Game-Changing Features:</h4>
              <ol style="color: #78716c; line-height: 1.8; margin: 0;">
                <li><strong>Customer Database:</strong> "I never forget preferences or special dates anymore"</li>
                <li><strong>Professional Quotes:</strong> "Clients take me seriously and pay premium prices"</li>
                <li><strong>Analytics Dashboard:</strong> "I know exactly which products make the most money"</li>
              </ol>
            </div>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              <strong>The best part?</strong> Emma's transformation started within her first week of upgrading. The Professional features immediately organized her chaos and freed up time to focus on what she loves - creating beautiful cakes.
            </p>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 25px;">
              <p style="color: #166534; margin: 0; font-weight: bold;">
                "The $47/month investment pays for itself within the first week every single month. Best business decision I ever made."
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="{{upgradeUrl}}" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Start Your Success Story
            </a>
          </div>
          
          <div style="text-align: center; color: #78716c; font-size: 14px;">
            <p>Ready to transform your bakery like Emma did?</p>
            <p><a href="{{unsubscribeUrl}}" style="color: #78716c;">Unsubscribe</a></p>
          </div>
        </body>
      </html>
    `,
    cta: {
      text: "Start Your Success Story",
      url: "/pricing?utm_source=email&utm_campaign=free_to_paid&utm_content=step4"
    }
  },

  step5: {
    subject: "Time is running out: Special pricing ends soon ⏰",
    body: `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef7ed;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #fee2e2; color: #dc2626; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 20px;">⚠️ Limited Time Offer Ending Soon</h2>
            </div>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              Hi! I hope you've been getting value from the Bakewise emails I've been sending. 
            </p>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              I'm reaching out because the special pricing I mentioned expires in just <strong>48 hours</strong>, and I don't want you to miss out.
            </p>
            
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 25px; text-align: center;">
              <h3 style="color: #dc2626; margin-bottom: 15px;">⏰ Last Chance: 2 Months Free</h3>
              <p style="color: #7f1d1d; margin-bottom: 15px; font-size: 18px;">
                Professional Plan: <s>$47/month</s> → <strong>$39.17/month</strong><br>
                <small>(when paid annually)</small>
              </p>
              <p style="color: #7f1d1d; margin: 0;">
                <strong>You save $188 in your first year!</strong>
              </p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #292524; margin-bottom: 15px;">What you're missing by waiting:</h3>
              <div style="background: #fef7ed; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                <p style="color: #78716c; margin: 0;">💰 <strong>Revenue opportunities:</strong> Other bakers are using Pro features to increase sales while you wait</p>
              </div>
              <div style="background: #fef7ed; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                <p style="color: #78716c; margin: 0;">⏱️ <strong>Time savings:</strong> Every day you delay is more hours spent on manual tasks</p>
              </div>
              <div style="background: #fef7ed; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                <p style="color: #78716c; margin: 0;">🎯 <strong>Professional growth:</strong> Your competitors are using better tools to win clients</p>
              </div>
            </div>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 25px;">
              <h4 style="color: #166534; margin-bottom: 10px;">✅ Remember: 30-Day Money-Back Guarantee</h4>
              <p style="color: #166534; margin: 0;">
                If Bakewise doesn't improve your business within 30 days, I'll personally refund every penny. No questions asked.
              </p>
            </div>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              Don't let another month pass wondering "what if." Take action while the special pricing is still available.
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="{{upgradeUrl}}" style="background: #dc2626; color: white; padding: 18px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">
              Claim Special Pricing Now
            </a>
            <p style="color: #dc2626; font-size: 14px; margin: 10px 0 0 0;">⏰ Expires in 48 hours</p>
          </div>
          
          <div style="text-align: center; color: #78716c; font-size: 14px;">
            <p>Questions? Reply to this email for personal assistance</p>
            <p><a href="{{unsubscribeUrl}}" style="color: #78716c;">Unsubscribe</a></p>
          </div>
        </body>
      </html>
    `,
    cta: {
      text: "Claim Special Pricing Now",
      url: "/pricing?utm_source=email&utm_campaign=free_to_paid&utm_content=step5&urgency=true"
    }
  },

  step6: {
    subject: "Final hours: Your special pricing expires tonight 🚨",
    body: `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef7ed;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px;">🚨 FINAL NOTICE</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Special pricing expires at midnight tonight</p>
            </div>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              This is it - your last chance to get Bakewise Professional at the special introductory price.
            </p>
            
            <div style="background: #fee2e2; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
              <h2 style="color: #dc2626; margin-bottom: 15px;">At midnight tonight, this offer disappears forever</h2>
              <div style="font-size: 24px; color: #7f1d1d; margin-bottom: 15px;">
                <s>$47/month</s> → <strong style="color: #dc2626;">$39.17/month</strong>
              </div>
              <p style="color: #7f1d1d; margin: 0;">
                <strong>$188 savings + 2 months free</strong>
              </p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #292524; margin-bottom: 15px;">What happens if you wait?</h3>
              
              <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #dc2626;">
                <p style="color: #7f1d1d; margin: 0;">
                  ❌ <strong>Tomorrow:</strong> Price returns to regular $47/month (no savings)
                </p>
              </div>
              
              <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #dc2626;">
                <p style="color: #7f1d1d; margin: 0;">
                  ❌ <strong>Next week:</strong> You'll have lost another 40+ hours to manual work
                </p>
              </div>
              
              <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #dc2626;">
                <p style="color: #7f1d1d; margin: 0;">
                  ❌ <strong>Next month:</strong> Your competitors will be further ahead
                </p>
              </div>
            </div>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 25px;">
              <h4 style="color: #166534; margin-bottom: 10px;">🎯 What you get when you upgrade tonight:</h4>
              <ul style="color: #166534; line-height: 1.8; margin: 0;">
                <li>Instant access to all Professional features</li>
                <li>30-day money-back guarantee</li>
                <li>Personal onboarding session ($200 value)</li>
                <li>Priority customer support</li>
                <li>2 bonus months free</li>
              </ul>
            </div>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px; text-align: center; font-size: 18px;">
              <strong>Don't let another day pass wondering "what if."</strong>
            </p>
            
            <div style="text-align: center; background: #fef7ed; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <p style="color: #ea580c; margin: 0; font-style: italic;">
                "I almost didn't upgrade because I was 'thinking about it.' Thank goodness I pulled the trigger - it changed everything." - Maria S.
              </p>
            </div>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px; text-align: center;">
              <strong>Click below before midnight to secure your special pricing:</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="{{upgradeUrl}}" style="background: #dc2626; color: white; padding: 20px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 20px; display: inline-block; animation: pulse 2s infinite;">
              Upgrade Now - Final Hours
            </a>
            <p style="color: #dc2626; font-size: 16px; margin: 15px 0 0 0; font-weight: bold;">⏰ Expires at midnight tonight</p>
          </div>
          
          <div style="text-align: center; color: #78716c; font-size: 14px;">
            <p>Last chance - don't miss out!</p>
            <p><a href="{{unsubscribeUrl}}" style="color: #78716c;">Unsubscribe</a></p>
          </div>
        </body>
      </html>
    `,
    cta: {
      text: "Upgrade Now - Final Hours",
      url: "/pricing?utm_source=email&utm_campaign=free_to_paid&utm_content=step6&urgency=final"
    }
  },

  step7: {
    subject: "We'll miss you - here's what you're walking away from 💔",
    body: `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef7ed;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #78716c; font-size: 24px; margin-bottom: 10px;">We'll miss you...</h1>
            <p style="color: #a8a29e; font-size: 16px;">But let's make sure this is really the right decision</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              I noticed you didn't take advantage of our special Professional plan pricing. That's okay - not everyone is ready to make the leap.
            </p>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              But before you completely write off the idea, I want to share what you're walking away from:
            </p>
            
            <div style="background: #fef7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; margin-bottom: 25px;">
              <h3 style="color: #ea580c; margin-bottom: 15px;">💸 The Real Cost of "Free"</h3>
              <p style="color: #78716c; line-height: 1.8; margin: 0;">
                Based on our surveys, free users spend an average of <strong>23 extra hours per month</strong> on tasks that Professional users automate. At just $25/hour, that's <strong>$575 worth of your time</strong> - every month.
              </p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #292524; margin-bottom: 15px;">What our Professional users achieved in their first 90 days:</h3>
              
              <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                <p style="color: #1e3a8a; margin: 0;">📈 <strong>Average 32% revenue increase</strong> from better customer management</p>
              </div>
              
              <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                <p style="color: #1e3a8a; margin: 0;">⏱️ <strong>20+ hours saved monthly</strong> with automated workflows</p>
              </div>
              
              <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                <p style="color: #1e3a8a; margin: 0;">💰 <strong>$400+ average monthly ROI</strong> on their $47 investment</p>
              </div>
              
              <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                <p style="color: #1e3a8a; margin: 0;">😌 <strong>Dramatically reduced stress</strong> from better organization</p>
              </div>
            </div>
            
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 25px;">
              <h4 style="color: #dc2626; margin-bottom: 10px;">⚠️ The Opportunity Cost</h4>
              <p style="color: #7f1d1d; margin: 0; line-height: 1.6;">
                While you stay on the free plan, your competitors are using Professional tools to grow faster, serve customers better, and charge premium prices. Each month you wait, the gap widens.
              </p>
            </div>
            
            <div style="text-align: center; background: #dcfce7; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #16a34a; margin-bottom: 15px;">🎁 One Last Chance</h3>
              <p style="color: #166534; margin-bottom: 15px;">
                I rarely do this, but I'm extending the special pricing for <strong>you only</strong> - for the next 48 hours.
              </p>
              <p style="color: #166534; margin: 0; font-weight: bold;">
                Use code LASTCHANCE for 2 months free + $8/month discount
              </p>
            </div>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px; text-align: center;">
              <strong>This is truly the last time I'll make this offer.</strong>
            </p>
            
            <p style="color: #44403c; line-height: 1.6; margin-bottom: 25px;">
              If you're not ready now, that's okay. You'll stay on our free plan and continue getting basic features. But please don't let fear of investment hold back your bakery's potential.
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="{{upgradeUrl}}" style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin-bottom: 15px;">
              Use Code: LASTCHANCE
            </a>
            <p style="color: #16a34a; font-size: 14px; margin: 0;">Valid for 48 hours only</p>
          </div>
          
          <div style="text-align: center; color: #78716c; font-size: 14px;">
            <p>Whatever you decide, I'm rooting for your success.</p>
            <p>This is the final email in this series.</p>
            <p><a href="{{unsubscribeUrl}}" style="color: #78716c;">Unsubscribe</a></p>
          </div>
        </body>
      </html>
    `,
    cta: {
      text: "Use Code: LASTCHANCE",
      url: "/pricing?utm_source=email&utm_campaign=free_to_paid&utm_content=step7&discount=lastchance"
    }
  }
};

// Email template utility functions
export function getEmailTemplate(campaignKey: string, step: number): EmailTemplate | null {
  const campaign = FREE_TO_PAID_CAMPAIGN[`step${step}`];
  return campaign || null;
}

export function interpolateEmailTemplate(
  template: EmailTemplate, 
  variables: {
    upgradeUrl: string;
    unsubscribeUrl: string;
    userName?: string;
    bakeryName?: string;
  }
): EmailTemplate {
  let body = template.body;
  let subject = template.subject;
  
  // Replace common variables
  body = body.replace(/\{\{upgradeUrl\}\}/g, variables.upgradeUrl);
  body = body.replace(/\{\{unsubscribeUrl\}\}/g, variables.unsubscribeUrl);
  
  if (variables.userName) {
    body = body.replace(/Hi!/g, `Hi ${variables.userName}!`);
    body = body.replace(/Hi there!/g, `Hi ${variables.userName}!`);
  }
  
  if (variables.bakeryName) {
    body = body.replace(/your bakery/g, variables.bakeryName);
  }
  
  return {
    ...template,
    subject,
    body,
    cta: {
      ...template.cta,
      url: variables.upgradeUrl
    }
  };
}