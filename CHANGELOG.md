# Changelog

All notable changes to BakerIQ will be documented in this file.

## [Unreleased]

## [2025-10-04] - Backend Data Integrity Audit & Improvements

### Added
- **Server-Side Contract Template Renderer** (`server/contractRenderer.ts`):
  - Template variable replacement for baker/customer/event/payment details
  - Payment method resolution from baker.paymentLinks (Zelle, PayPal, CashApp, Venmo)
  - XSS sanitization for payment handles
  - Payment snapshot generation for audit trail
- **Database Schema Enhancements**:
  - `contracts.contract_origin` (text) - Tracks whether contract created from quote or directly
  - `contracts.payment_snapshot` (jsonb) - Freezes payment method info shown when contract sent
- **Transaction Wrappers** for atomic database operations:
  - Lead-to-customer conversion (prevents orphaned customers)
  - Contract creation with quote validation  
  - Contract signing (signature + status update)
- **Data Integrity Backfills**:
  - Linked 9 orphaned quotes to leads using signature-based matching
  - Populated 17 leads with signature field (`customerId_eventDate_eventType` pattern)
  - Tagged 3 existing contracts with `contract_origin='direct'`

### Changed
- **POST /api/leads/:id/convert-to-customer**: Now wrapped in database transaction
  - Returns 200 for existing customer, 201 for new customer
  - Atomic customer creation + lead status update
- **POST /api/contracts**: Enhanced with validation and server-side rendering
  - Validates quote existence when quoteId provided
  - Auto-populates contract data from linked quote
  - Generates payment snapshot at creation time
  - Sets contract_origin based on quote presence
  - Requires contract.content (prevents empty contracts)
- **POST /api/contracts/:id/sign**: Transaction-wrapped for consistency
  - Verifies contract exists before creating signature
  - Atomic signature creation + contract status update

### Fixed
- **Quote-Lead Linkage**: All quotes now properly linked to originating leads (except 2 test records with NULL customer_id)
- **Lead Signature Field**: All 17 missing signatures backfilled
- **Contract Data Consistency**: Signature and signed_at timestamp now updated atomically
- **Customer Creation Race Condition**: Lead conversion now checks for existing customer in transaction
- **Contract Creation "Customer not found" Error**: Fixed race condition where creating contract from newly created quote failed because customer wasn't in frontend cache
  - Added fallback to fetch customer from backend API if not found in cache
  - Prevents "Customer not found" errors when baker creates quote from lead then immediately creates contract
- **Cake Calculator Missing 4" Size & Decoration Categories**: Improved pricing configuration to use pre-population instead of runtime merging
  - **Better UX Approach**: PricingManager now pre-populates all empty arrays (sizes, flavors, decorations, shapes) with defaults when baker first saves pricing
  - **WYSIWYG Principle**: Bakers get complete starting point with all defaults, can customize/remove options, and calculator shows exactly what baker configured
  - **Cache Fix**: Save mutation now properly updates cache with server response (includes defaults), ensuring calculator always receives complete data
  - **Result**: All standard sizes (4", 6", 8", 10", 12", 14") and all decoration categories (Fresh Flowers, Design Elements, Cake Toppers, Extra Touches) guaranteed available on first save

### Security
- Added payment handle sanitization to prevent XSS in contract templates
- Email and URL format validation for payment methods
- PII logging prevention (sensitive values truncated in logs)

---

### Added
- **Overview Dashboard Tab**: New default landing page for bakers featuring:
  - Today's Activity card with new leads count, active leads, and conversion rate
  - Quick Actions card with one-click navigation to key sections (Leads, Quotes, Calendar, Pricing)
  - Recent Activity feed showing the last 5 leads with status indicators
- **Welcome Banner**: Onboarding guide for new bakers with three-step getting started flow:
  - Set up pricing → navigates to pricing management
  - Create template → navigates to quote templates
  - Customize branding → navigates to branding settings
- **Enhanced Empty States**: Improved UX for empty sections with:
  - Gradient background effects on icons
  - Friendly, helpful copy explaining each feature
  - Multiple clear call-to-action buttons
  - Applied to: QuoteBuilder, ContractManager, and PaymentManager
- **Product/UX Audit Report**: Comprehensive PDF audit (BakerIQ-Product-UX-Audit.pdf) with:
  - Complete project map of 100+ API endpoints and 30+ database tables
  - User journey analysis with friction point identification
  - Prioritized recommendations (quick wins, sprint projects, strategic initiatives)

### Fixed
- **Quote Builder Customer Display Bug**: Fixed race condition where quotes showed "Unknown Customer" instead of actual customer names
  - Implemented dual-update strategy: manual cache update + database verification
  - Added validation layer to prevent foreign key violations
  - Added comprehensive logging for debugging
  - Resolved conflicts between manual cache updates and automatic refetches

---

## Initial Release

### Added

#### Platform Core
- **Full-Stack TypeScript Application**: React frontend with Express.js backend
- **Modern UI System**: Shadcn/ui components built on Radix UI with Tailwind CSS
- **Database Infrastructure**: PostgreSQL with Drizzle ORM and Neon serverless integration
- **Session Management**: Express sessions with PostgreSQL session store
- **Dark Mode**: Complete theme support with Light/Dark/System options

#### Authentication & Authorization
- **User Registration & Login**: Secure authentication system for bakers
- **Password Reset Flow**: Token-based password reset with email notifications
- **Three-Tier Plan System**: Starter ($0), Professional ($19/mo), Enterprise ($39/mo)
- **Feature Gating**: Middleware for plan-based feature access control
- **Super Admin System**: Administrative dashboard with elevated permissions

#### Baker Features
- **Baker Dashboard**: Comprehensive business management hub with tabbed navigation:
  - Overview, Leads, About, Quotes, Templates, Contracts, Bookings
  - Payments, Pricing, Portfolio, Branding, Account, Domain
- **CRM (Customer Relationship Management)**:
  - Lead management with status tracking (new, contacted, quoted, booked, declined, converted)
  - Customer profiles with event details and preferences
  - Notes and activity tracking
  - Lead-to-customer conversion workflow
  - Bulk email capabilities (Enterprise plan)
  - CSV export for leads (Enterprise plan)
- **Quote Management**:
  - Quote Builder with customer selection and lead conversion
  - Quote templates for reusable pricing structures
  - PDF generation with jsPDF
  - Email delivery to customers
  - Quote approval system with secure tokenized links (30-day expiration)
  - Status tracking (draft, sent, viewed, approved, rejected)
  - Quick payment buttons integrated with Stripe
- **Contract Management**:
  - Digital contract creation and management
  - E-signature collection
  - Payment schedule integration
  - Template system for contract terms
- **Booking System**:
  - Consultation scheduling with availability management
  - Calendar integration
  - Booking status tracking
- **Payment Processing**:
  - Stripe integration for deposits and final payments
  - Payment links setup (Zelle, PayPal, Cash App, Venmo)
  - Payment plan management
  - Transaction history and tracking
- **Portfolio Management**:
  - Image upload and gallery system
  - Portfolio showcase on public baker profiles
- **Pricing Management**:
  - Customizable cake sizes with servings and pricing
  - Shape configurations with upcharges
  - Flavor options (standard and premium)
  - Decoration categories with cost tracking
  - Tax rate configuration
  - Delivery settings with distance-based pricing
  - Profit margin calculators
- **Branding Customization**:
  - Custom subdomain setup
  - Logo upload
  - Color scheme customization
  - Public profile customization

#### Customer-Facing Features
- **Dynamic Pricing Calculator**:
  - Real-time cake cost calculations
  - 8 decoration options: Piping & Borders, Edible Glitter, Hand-painted Design, Sugar Flowers, and more
  - Guest count-based sizing recommendations
  - Tier and shape selection
  - Flavor and filling customization
  - Delivery distance calculator
  - Special requests field
  - PDF estimate generation
  - Lead capture with automatic email confirmation
- **Baker Marketplace**:
  - Searchable directory with filtering
  - Location-based search with Google Maps integration
  - Baker profiles with ratings and reviews
  - Portfolio galleries
  - Distance-based results
- **Customer Portal**:
  - Quote viewing and approval
  - Order tracking
  - Payment management
  - Event details overview
- **Quote Approval System**:
  - Email notifications with secure links
  - One-click approve/decline actions
  - Quote details preview
  - 30-day link expiration

#### Super Admin Dashboard
- **Multi-Tenant Management**:
  - Tenant (baker) account creation and management
  - Subscription plan management
  - Account suspension and reactivation
  - Baker impersonation for support
- **Analytics & Reporting**:
  - Monthly Recurring Revenue (MRR) tracking
  - User growth metrics
  - Subscription lifecycle analytics
  - Active/churned subscriber counts
- **Email Campaign Management**:
  - Sendy integration for email marketing
  - Segmented campaigns by subscription plan
  - Automatic baker list synchronization
  - Campaign performance tracking
- **System Management**:
  - Audit logs for security and compliance
  - User management (activate, suspend, password reset)
  - System health monitoring
  - Announcement system
  - Maintenance mode scheduling
  - Data export capabilities

#### External Integrations
- **Stripe**: Payment processing and subscription management
  - Checkout flow integration
  - Test/live mode detection
  - Webhook handling for subscription events
  - Payment intent creation
  - Customer management
- **AWS SES**: Transactional and marketing email delivery
  - Quote notifications
  - Lead confirmations
  - Password reset emails
  - System announcements
- **Google Maps API**:
  - Places Autocomplete for address entry
  - Geocoding and reverse geocoding
  - Distance calculations
  - Interactive marketplace map
- **Sendy**:
  - Email list management
  - Automatic baker segmentation by plan
  - Calculator lead capture and syncing
  - Campaign automation
- **Replicate AI**: AI-powered cake image generation for design inspiration
- **jsPDF**: Professional PDF generation for quotes and estimates

#### Database Schema
- **Multi-Tenancy Support**: Tenant tables with configurations and baker networks
- **User Management**: Users, profiles, and role-based access control
- **Baker Data**: Comprehensive baker profiles with pricing, portfolio, and settings
- **Customer Data**: Customers with event details and preferences
- **Lead Management**: Lead tracking with source attribution and status
- **Quote System**: Quotes, quote items, and templates
- **Contract System**: Contracts with signatures and payment schedules
- **Booking System**: Consultations with availability rules
- **Payment Tracking**: Transactions with Stripe integration
- **Reviews**: Baker reviews with verification status
- **Email Automation**: Campaign tracking and scheduled emails
- **Subscription Management**: Plans, billing history, and credits
- **System Tables**: Audit logs, announcements, maintenance schedules

#### Development Features
- **Build System**: Vite for frontend, TSX for backend TypeScript
- **Type Safety**: Shared Zod schemas between client and server
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side navigation
- **Form Handling**: React Hook Form with Zod validation
- **PWA Support**: Service worker with offline capabilities
- **Asset Management**: Integrated asset handling with path aliases

#### Email Automation
- **Subscription Lifecycle Automation**: Automated emails for:
  - Trial warnings (3 days before expiration)
  - Trial expired notifications
  - Automatic free tier downgrades
  - Conversion campaigns for free users
- **Calculator Lead Automation**:
  - Automatic Sendy list subscription
  - Customer confirmation emails
  - Baker lead notifications
- **Quote Workflow Emails**:
  - Quote sent notifications
  - Approval/decline confirmations
  - Payment reminders

### Changed
- **Navigation Structure**: Grouped tabs into categories (Overview, Business, Revenue, Marketing, Account)
- **Subscription Plans**: Simplified from initial structure to three clear tiers:
  - Starter: Free with basic features
  - Professional: $19/month with advanced CRM and unlimited leads
  - Enterprise: $39/month with bulk email, CSV export, and priority support

### Security
- **CSRF Protection**: Token-based CSRF protection for all state-changing operations
- **Password Hashing**: bcryptjs for secure password storage
- **Session Security**: Secure session management with PostgreSQL backing
- **Token Expiration**: Time-limited tokens for password reset and quote approval
- **Role-Based Access**: Middleware for feature and route protection
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **Environment Variables**: Secure secret management for API keys and credentials
