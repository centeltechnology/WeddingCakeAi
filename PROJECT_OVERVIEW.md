# BakerIQ Platform - Project Overview

**Last Updated:** November 10, 2025  
**Status:** Active Development - Pre-Production  
**Architecture:** Monorepo (3 services: main app, marketplace, OAuth accounts)

---

## 🎯 Project Vision

BakerIQ is a comprehensive SaaS platform designed to help bakeries manage their entire business operations, from lead generation and pricing to quotes, contracts, and payments. The platform features multi-tenancy support, email automation, subscription billing, and a dynamic pricing calculator.

---

## 📂 Directory Structure

```
apps/
├── app/                    # Main BakerIQ application (port 5000)
│   ├── client/            # React frontend (Vite)
│   ├── server/            # Express backend
│   └── shared/            # Shared TypeScript schemas
├── market/                # Consumer marketplace service (port 3001) - Skeletal
└── accounts/              # OAuth token broker service (port 3002) - Skeletal

packages/
└── shared/                # Shared workspace package (@bakeriq/shared)
```

---

## ✅ Completed Features

### 🔐 Authentication & User Management

- **✅ Baker Authentication**
  - Email/password login (`/baker-login`)
  - JWT-based session management
  - Password reset flow (email-based tokens)
  - Email verification system
  - Test credentials: `live@test.com` / `password123`

- **✅ Super Admin System**
  - Dedicated admin login (`/super-admin-login`)
  - Password reset flow
  - Super admin setup page
  - Multi-tenant control dashboard
  - Test credentials: `bwadmin` / `password`

- **✅ Customer Portal**
  - Customer login/authentication
  - Quote approval system with tokenized links

### 🎨 Frontend Pages & Routes (35+ pages)

**Public Pages:**
- ✅ Home page with hero, features, testimonials
- ✅ Features showcase
- ✅ About page
- ✅ Pricing tiers display
- ✅ Baker signup flow
- ✅ Baker directory (`/bakers`)
- ✅ Baker public profiles (`/baker/:slug`)
- ✅ Marketplace interface
- ✅ Legal pages (Terms, Privacy, Cookies, Acceptable Use)

**Help Center (20+ articles):**
- ✅ Subdomain setup guide
- ✅ Quote templates help
- ✅ Custom cake ordering
- ✅ Quotes and contracts
- ✅ Payment processing
- ✅ Analytics and insights
- ✅ Marketing your bakery
- ✅ SEO optimization
- ✅ And 12 more help articles...

**Baker Dashboard Features:**
- ✅ CRM/Leads management
- ✅ Quote builder & templates
- ✅ Contract management
- ✅ Customer database
- ✅ Calendar/scheduling system
- ✅ Team management
- ✅ Billing & subscriptions
- ✅ Analytics dashboard
- ✅ Pricing manager (with toggle controls for options)
- ✅ Portfolio gallery with image uploads
- ✅ Branding customization
- ✅ Account settings
- ✅ Domain settings (subdomain + custom domain)

**Quote & Contract System:**
- ✅ Quote template manager with reusable templates
- ✅ Advanced quote builder with line items
- ✅ Quote approval system (`/quote-approval/:token`)
- ✅ Secure tokenized links (30-day expiration)
- ✅ Contract rendering with variable replacement
- ✅ Digital signature capture
- ✅ Payment snapshot storage in contracts
- ✅ Quote-Lead-Customer linkage workflow

**Payment Processing:**
- ✅ Manual payment system (Zelle, PayPal, CashApp, Venmo)
- ✅ Payment links manager
- ✅ Payment plans & schedules
- ✅ Invoice generation
- ✅ Transaction history

### 🧮 Cake Calculator

- ✅ Dynamic pricing calculator with 8 decoration options
- ✅ Toggle controls (isActive switches) for bakers
- ✅ Real-time cost calculations
- ✅ Embeddable widget functionality
- ✅ Calculator theme selector
- ✅ Lead capture from calculator
- ✅ Customer confirmation emails integrated with Sendy
- ✅ Standalone calculator page (`/calculator`)
- ✅ Baker-specific calculator (`/baker/:slug/calculator`)

### 💳 Stripe Integration

- ✅ Stripe initialization (TEST mode)
- ✅ Platform subscriptions (3 tiers: Starter, Professional, Enterprise)
- ✅ Price IDs configured for Professional and Enterprise
- ✅ Subscription management dashboard
- ✅ Invoice history
- ✅ Stripe Connect onboarding UI
- ✅ Webhook secret configuration
- ⚙️ **In Progress:** Full webhook verification & payment flow completion

### 📧 Email & Marketing Automation

- ✅ Sendy integration for email marketing
- ✅ Automated list management with baker segmentation
- ✅ Trial warning emails (3 days before expiration)
- ✅ Trial expired notifications
- ✅ Automatic tier downgrade on trial expiration
- ✅ Conversion campaign enrollment for free users
- ✅ Calculator lead capture emails
- ✅ Email campaign scheduler (runs every 4 hours)
- ✅ Super admin mass email campaigns
- ✅ Email job queue system

### 🔧 Super Admin Dashboard

- ✅ Multi-tenant analytics (MRR, user growth)
- ✅ Subscription management interface
- ✅ Baker impersonation feature
- ✅ Baker management (view, edit, suspend)
- ✅ Campaign management for segmented emails
- ✅ System health metrics display
- ✅ Audit logs tracking
- ✅ Data export jobs
- ✅ Maintenance scheduling

### 🏢 Multi-Tenancy

- ✅ Tenant database schema (tenants, configurations, baker networks)
- ✅ Subdomain routing support
- ✅ Custom domain support
- ✅ Tenant branding system (logo, colors, custom CSS)
- ✅ Revenue sharing tracking
- ✅ Tenant middleware (partial implementation)
- ⚠️ **Needs Work:** Consistent enforcement across all routes

### 🎨 Design System

- ✅ Shadcn/UI component library
- ✅ Tailwind CSS with custom color palette
- ✅ Dark mode support with ThemeToggle
- ✅ Responsive design across all pages
- ✅ Orange accent brand colors
- ✅ Professional wedding/bakery aesthetic

### 📊 Database Schema (PostgreSQL via Drizzle ORM)

**37+ Database Tables Defined:**
- ✅ Users, profiles, bakers
- ✅ Leads, customers, calculator_leads
- ✅ Quotes, quote_templates, quote_items
- ✅ Contracts, contract_templates, contract_signatures
- ✅ Payment_plans, payment_schedule, invoices
- ✅ Transactions, bookings
- ✅ Team_members, team_invitations
- ✅ Reviews, messages, conversations
- ✅ Availability, consultations
- ✅ Analytics, activity_logs
- ✅ Email_jobs, email_campaign_enrollments
- ✅ Super_admin_campaigns, sendy_settings
- ✅ Tenants, tenant_configurations, tenant_baker_networks
- ✅ And 15+ more specialized tables...

### 🔌 External Integrations

- ✅ **Stripe** (payments & subscriptions)
- ✅ **Sendy** (email marketing & automation)
- ✅ **Google Maps API** (location services, Places Autocomplete)
- ✅ **Replicate API** (AI image generation capability)
- ✅ **Object Storage** (AWS S3-compatible, configured)
- ✅ **jsPDF** (PDF generation for estimates/contracts)
- ✅ **Mailjet** (email delivery, configured)

---

## ⚙️ In Progress / Partially Complete

### 🏗️ Architecture

- ⚙️ **Storage Layer Migration:** Schema defined in Drizzle, but backend still uses in-memory storage (storage.ts). Database exists but not fully utilized.
- ⚙️ **Cross-Service Auth:** Accounts and Market services lack shared session wiring with main app
- ⚙️ **Tenant Isolation:** Middleware exists but inconsistently applied across routes

### 🔐 Security Hardening

- ⚙️ **Password Hashing:** Some flows still store unhashed passwords
- ⚙️ **JWT Secrets:** Falls back to weak dev value (`'dev-only-fake'`)
- ⚙️ **CSRF Protection:** CSRF library exists but not fully enforced
- ⚙️ **Rate Limiting:** Not implemented
- ⚙️ **Audit Logging:** Schema exists but minimal usage

### 💰 Payment Workflows

- ⚙️ **Stripe Webhooks:** Configured but verification incomplete
- ⚙️ **Payment Status Transitions:** Manual tracking, needs automation
- ⚙️ **Automated Billing:** Subscription lifecycle partially automated

### 📦 Additional Services

- ⚙️ **Market Service:** Skeletal implementation (vendor profiles, checkout endpoint)
- ⚙️ **Accounts Service:** OAuth broker with mock JWT tokens, not production-ready

---

## 🧩 Planned / Not Started

### Critical for Production

- 🧩 **Database Migration:** Full migration from in-memory to PostgreSQL persistence
- 🧩 **Production Auth System:** Strong secrets, refresh tokens, session management
- 🧩 **Webhook Verification:** Complete Stripe webhook handler with retry logic
- 🧩 **Background Job Queue:** Replace cron-style scheduler with robust worker system
- 🧩 **Error Monitoring:** Global error tracking (e.g., Sentry integration)
- 🧩 **End-to-End Testing:** Comprehensive test suite for critical workflows
- 🧩 **API Rate Limiting:** Protect against abuse
- 🧩 **Data Backups:** Automated backup strategy
- 🧩 **Deployment Strategy:** Multi-Repl deployment for 3 services with environment configs

### Feature Enhancements

- 🧩 **Mobile App:** Mentioned in help center but not built
- 🧩 **Advanced Analytics:** Deeper insights, revenue forecasting
- 🧩 **SMS Notifications:** Twilio integration for order updates
- 🧩 **Inventory Management:** Track supplies and ingredients
- 🧩 **Customer Loyalty Program:** Rewards and referral system
- 🧩 **Advanced SEO Tools:** Meta tag manager, sitemap generation

---

## 🔧 Technical Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** Wouter
- **State Management:** TanStack Query v5
- **Forms:** React Hook Form + Zod validation
- **UI Components:** Shadcn/UI (Radix UI primitives)
- **Styling:** Tailwind CSS with custom theme
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript with ES modules
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Drizzle ORM
- **Validation:** Zod schemas
- **Session:** Express sessions with pg-simple
- **PDF Generation:** jsPDF

### DevOps & Tooling
- **Package Manager:** npm workspaces (monorepo)
- **Development:** TSX for server-side TypeScript
- **Database Migrations:** Drizzle Kit
- **Environment:** Replit-hosted development
- **Version Control:** Git + GitHub (https://github.com/centeltechnology/WeddingCakeAi)

### External Services
- Stripe (payments)
- Sendy (email marketing)
- Google Maps API (location)
- Replicate (AI)
- AWS S3 (object storage)
- Mailjet (transactional email)

---

## 🚨 Known Issues & Blockers

### Critical
1. **In-Memory Storage:** All data lost on server restart. Database exists but not connected.
2. **Weak Auth Secrets:** Development fallback values in production-ready code
3. **Tenant Isolation Gaps:** Risk of data leakage between tenants
4. **No Webhook Verification:** Stripe webhooks not secure
5. **Incomplete Payment Flows:** Quote → Contract → Payment pipeline has gaps

### High Priority
1. **Missing Validation:** Many write paths accept partial payloads without schema checks
2. **No Transaction Safety:** Database operations lack atomic transaction wrappers
3. **Incomplete Error Handling:** Minimal global error monitoring
4. **Monorepo Deployment:** Replit doesn't support monorepo publishing (requires 3 separate Repls)

### Medium Priority
1. **Incomplete Market/Accounts Services:** Skeletal implementations not production-ready
2. **Manual Email Campaigns:** No automated retry or delivery confirmation
3. **Limited Test Coverage:** No end-to-end test suite
4. **Performance Optimization:** No caching, query optimization, or CDN

---

## 📈 Production Readiness Assessment

### Overall Score: **40% Production Ready**

| Category | Status | Score | Notes |
|----------|--------|-------|-------|
| **Core Features** | 🟡 Partial | 70% | Most UI complete, backend needs hardening |
| **Authentication** | 🔴 Incomplete | 30% | Weak secrets, no refresh tokens |
| **Data Persistence** | 🔴 Incomplete | 20% | In-memory only, database unused |
| **Security** | 🔴 Critical | 25% | Multiple security gaps |
| **Integrations** | 🟡 Partial | 50% | Stripe/Sendy connected but incomplete |
| **Multi-Tenancy** | 🟡 Partial | 45% | Schema ready, enforcement inconsistent |
| **Testing** | 🔴 Minimal | 10% | No automated test suite |
| **Documentation** | 🟢 Good | 80% | Extensive help center, clear README |

---

## 🎯 Next Recommended Steps

### Phase 1: Production Hardening (2-3 weeks)
**Goal:** Make the platform secure and stable for real users

1. **Database Migration** (Priority: CRITICAL)
   - Migrate all storage.ts methods to use Drizzle ORM
   - Test data persistence across server restarts
   - Implement proper foreign key relationships
   - Add database indexes for performance

2. **Security Lockdown** (Priority: CRITICAL)
   - Generate strong JWT secrets (use environment variables)
   - Implement bcrypt password hashing everywhere
   - Add CSRF protection to all mutation endpoints
   - Implement rate limiting (express-rate-limit)
   - Add audit logging for sensitive operations

3. **Authentication Overhaul** (Priority: CRITICAL)
   - Implement refresh token rotation
   - Add session invalidation on logout
   - Secure cookie settings (httpOnly, secure, sameSite)
   - Implement proper token expiration handling

4. **Tenant Isolation** (Priority: HIGH)
   - Apply tenant middleware to ALL routes
   - Add tenant_id validation to every database query
   - Implement tenant-scoped data access layer
   - Add integration tests for tenant isolation

### Phase 2: Payment & Workflow Completion (1-2 weeks)

5. **Stripe Integration Completion**
   - Implement webhook verification with signature validation
   - Add webhook retry logic and idempotency
   - Complete subscription lifecycle automation
   - Add payment failure handling and retry

6. **Quote → Contract → Payment Pipeline**
   - Add status transition validation
   - Implement background jobs for email notifications
   - Add automated payment reminders
   - Complete invoice generation workflow

### Phase 3: Deployment & Monitoring (1 week)

7. **Multi-Service Deployment**
   - Create 3 separate Repls (app, market, accounts)
   - Configure environment variables for each
   - Set up custom domain routing
   - Test cross-service communication

8. **Monitoring & Logging**
   - Integrate error tracking (Sentry or similar)
   - Add application performance monitoring
   - Set up automated alerts for critical errors
   - Implement structured logging

### Phase 4: Testing & Polish (1-2 weeks)

9. **Testing Suite**
   - Add end-to-end tests for critical user flows
   - Add integration tests for payment processing
   - Add unit tests for business logic
   - Test multi-tenancy isolation

10. **Performance Optimization**
    - Add database query optimization
    - Implement Redis caching for frequently accessed data
    - Add CDN for static assets
    - Optimize image loading

---

## 🤖 AI Integration Opportunities

### High-Value AI Features (Recommended)

#### 1. **AI-Powered Cake Design Assistant** 🎂✨
**Value:** Help customers visualize custom cakes, reduce back-and-forth
- **Implementation:** Integrate Replicate (already configured) or DALL-E 3
- **Use Case:** Customer describes cake → AI generates visual mockup
- **Technical:** 
  - Add text-to-image prompt builder in calculator
  - Store generated images in object storage
  - Attach to quotes for customer approval
- **ROI:** Reduces baker design time, increases quote conversion

#### 2. **Smart Quote Generator** 💡
**Value:** Auto-generate detailed quotes from customer conversations
- **Implementation:** OpenAI GPT-4 or Claude API
- **Use Case:** Baker pastes customer email/chat → AI extracts requirements → Pre-fills quote
- **Technical:**
  - NLP extraction of: cake size, flavor, date, dietary needs, budget
  - Map to existing quote template fields
  - Suggest pricing based on historical data
- **ROI:** Saves 10-15 minutes per quote, improves accuracy

#### 3. **Intelligent Lead Scoring** 📊
**Value:** Help bakers prioritize high-value opportunities
- **Implementation:** ML model (scikit-learn or simple rules engine)
- **Use Case:** Analyze lead data → Score probability of conversion
- **Technical:**
  - Train on: budget, event date proximity, response time, cake complexity
  - Display score in CRM dashboard
  - Auto-tag "hot leads"
- **ROI:** Increases conversion rate by focusing on best prospects

#### 4. **Automated Customer Support Chatbot** 🤖💬
**Value:** Answer common questions 24/7, qualify leads
- **Implementation:** OpenAI Assistant API or custom RAG system
- **Use Case:** Customer asks about pricing/flavors/availability → AI responds
- **Technical:**
  - Train on baker's FAQ, pricing, portfolio
  - Escalate to human for complex questions
  - Capture lead info during conversation
- **ROI:** Reduces support workload, captures after-hours leads

#### 5. **Dynamic Pricing Optimizer** 💰
**Value:** Suggest optimal pricing based on market data and costs
- **Implementation:** Simple ML regression or rules-based system
- **Use Case:** Baker enters costs → AI suggests competitive pricing
- **Technical:**
  - Analyze: baker's costs, local market rates, seasonal demand
  - Factor in: complexity, delivery distance, customer budget
  - Show pricing confidence range
- **ROI:** Maximizes profit margins while staying competitive

#### 6. **Email Content Generator** ✉️
**Value:** Create personalized customer emails instantly
- **Implementation:** OpenAI GPT-4 with baker's brand voice
- **Use Case:** Generate follow-ups, thank you notes, quote presentations
- **Technical:**
  - Templates: inquiry response, quote follow-up, contract reminder
  - Personalize with: customer name, cake details, event date
  - One-click send or edit
- **ROI:** Improves customer engagement, saves 5-10 min per email

### Medium-Value AI Features

7. **Recipe Suggestion Engine:** Recommend cake/filling pairings based on season, theme
8. **Inventory Forecasting:** Predict ingredient needs based on upcoming orders
9. **Social Media Content Generator:** Auto-create Instagram captions and hashtags
10. **Customer Sentiment Analysis:** Analyze reviews and messages for trends

### Implementation Priority

**Phase 1 (MVP - 1-2 weeks):**
- AI Cake Design Assistant (biggest wow factor)
- Email Content Generator (immediate time savings)

**Phase 2 (3-4 weeks):**
- Smart Quote Generator (high ROI)
- Intelligent Lead Scoring (competitive advantage)

**Phase 3 (Later):**
- Automated Customer Support Chatbot
- Dynamic Pricing Optimizer

### Technical Requirements for AI Features

**APIs Needed:**
- OpenAI API (GPT-4 for text, DALL-E for images) - Estimated $50-200/month
- Replicate API (already configured) - $0.002-0.02 per generation
- Optional: Anthropic Claude (alternative to OpenAI)

**Infrastructure:**
- Background job queue for async AI processing
- Object storage for generated images (already configured)
- Caching layer to avoid redundant API calls
- Rate limiting to control costs

**Cost Estimates:**
- Low usage (10-50 bakers): $50-150/month
- Medium usage (50-200 bakers): $150-500/month
- High usage (200+ bakers): $500-2000/month

---

## 📝 Recent Changes (Last Build Phase)

### November 10, 2025
- ✅ Fixed pricing manager validation schema (cakeSizes, flavors, decorations)
- ✅ Added `isActive` toggle support across all pricing options
- ✅ Added `costToMake` field to decorations
- ✅ Updated bakerPricingSchema to match frontend payload
- ✅ Verified schema changes with architect review

### Previous Updates
- ✅ Implemented quote approval system with tokenized links
- ✅ Added contract rendering with payment snapshots
- ✅ Built super admin campaign management
- ✅ Integrated Sendy for email automation
- ✅ Created comprehensive help center (20+ articles)

---

## 📞 Getting Started

### Development Setup
```bash
# Install dependencies
npm install

# Start development server (port 5000)
npm run dev

# Access services
# - Main app: http://localhost:5000
# - Market: http://localhost:3001
# - Accounts: http://localhost:3002
```

### Test Credentials
```
Baker Login:
  Email: live@test.com or test@test.com
  Password: password123

Super Admin:
  Username: bwadmin
  Password: password
```

### Key Environment Variables
- `STRIPE_SECRET_KEY` - Stripe API key
- `DATABASE_URL` - PostgreSQL connection
- `SENDY_API_KEY` - Email marketing
- `REPLICATE_API_TOKEN` - AI image generation
- `VITE_GOOGLE_MAPS_API_KEY` - Maps integration

---

## 🎉 Conclusion

BakerIQ has a **solid foundation** with extensive frontend features, comprehensive database schema, and multiple integrations configured. The platform demonstrates clear product vision and user-focused design.

**Primary Blockers to Production:**
1. In-memory storage (data not persisted)
2. Security vulnerabilities (weak auth, no CSRF, unhashed passwords)
3. Incomplete payment workflows
4. Missing webhook verification
5. Inconsistent tenant isolation

**Estimated Time to Production:**
- **With focused effort:** 4-6 weeks
- **With testing & polish:** 6-8 weeks

**Recommended Approach:**
Start with Phase 1 (Production Hardening) to build a secure, stable foundation. Then complete critical payment workflows in Phase 2. Finally, deploy and monitor in Phase 3 before adding AI features as differentiators.

The architecture is sound, the features are thoughtfully designed, and the codebase is well-organized. With systematic execution of the roadmap above, BakerIQ can become a production-ready SaaS platform serving real bakery businesses.

---

*For questions or contributions, see: https://github.com/centeltechnology/WeddingCakeAi*
