# BakerIQ

## Overview

A professional SaaS business platform for bakeries featuring modern design with clean white backgrounds, orange accent colors (#f97316), and comprehensive dark mode support. The platform emphasizes software business management capabilities including CRM, quotes, contracts, payments, and email automation features with streamlined baker-centric navigation.

**Domain**: bakeriq.app

## Recent Changes

**October 2, 2025** - Sendy Integration & Data Export
- **CSV Data Export**: Added CSV export functionality for baker and lead data. Export endpoint GET /api/super-admin/export/bakers generates CSV file with proper escaping for quotes and special characters. Includes baker data (name, email, business, phone, location, plan, status) and lead data (customer name, email, phone, wedding date, message, status). Export button integrated into Super Admin Baker Management tab. Successfully tested with edge cases containing quotes and commas.
- **Sendy Email Marketing Integration**: Complete integration with Sendy self-hosted email platform for automated list management. Features include: (1) Sendy service wrapper (server/sendy.ts) with subscribe/unsubscribe/status methods, (2) Database schema for plan-to-list mappings (sendySettings table), (3) API endpoints: GET/POST /api/super-admin/sendy/settings, POST /api/super-admin/sendy/sync, (4) Configuration UI in Integrations tab with status indicator, plan mapping inputs, last sync display, and manual sync button, (5) Automatic baker segmentation by subscription plan with syncing to corresponding Sendy lists. Environment variables: SENDY_API_KEY and SENDY_BASE_URL. State management uses useEffect for fetching settings sync, controlled inputs with explicit null handling for cleared mappings. End-to-end tested and architect-approved.
- **Calculator Leads Capture**: Implemented automatic lead capture from pricing calculator for marketing purposes. When customers use the cake calculator (/calculator route), their contact information (name, email, phone), event details, cake configuration, and estimated price are automatically saved to the calculatorLeads database table. Features: (1) Database schema with calculatorLeads table (customer_name, customer_email, customer_phone, event_date, cake_configuration JSON, estimated_price, synced_to_sendy boolean, sendy_list_id), (2) API endpoint POST /api/calculator-leads with auto-sync to Sendy, (3) CakeCalculator component modified to save leads during quote submission, (4) Super Admin Integrations tab includes calculator_leads_list_id configuration field for Sendy list targeting, (5) Error handling ensures lead save failures don't block quote requests. Storage methods: createCalculatorLead, getCalculatorLeads, getUnsyncedCalculatorLeads, markCalculatorLeadSynced. End-to-end tested and architect-reviewed.

**October 1, 2025** - Super Admin Dashboard Rebuild (Multi-tenant Control & Revenue Tooling)
- **Analytics Dashboard**: Revenue charts (MRR/ARR over time), user growth visualization, conversion funnel, plan distribution, key metrics (ARPU, conversion rate, trial conversion rate). Fixed month-boundary filtering bug for accurate date-range analytics.
- **Subscription Management**: Full subscription CRUD with search/filters, plan changes, trial extensions, cancellation/reactivation, manual credits/discounts, and billing history view. MRR calculation handles 'pro' plan synonym correctly. Billing history displays subscription events chronologically.
- **Baker Impersonation**: Support tooling allowing super admins to impersonate bakers via JWT token generation (2-hour expiry). POST /api/super-admin/impersonate/:bakerId generates baker tokens with impersonatedBy tracking. Frontend stores admin_token_backup, baker_token, and impersonation_active flags in localStorage. Navigation opens new tab to baker dashboard. Known limitation: demo route expects business name slugs; bakers without businessName fall back to IDs which demo route doesn't handle (pre-existing routing behavior).
- **Platform Overview**: Dashboard displays totalBakers, activeBakers, MRR, freeUsers, paidUsers, trialUsers, churnRate
- **Baker Management**: Table with search, filtering (all/active/suspended/free/paid), status changes, and plan updates
- **API Endpoints**: GET /api/super-admin/stats, GET /api/super-admin/analytics, GET /api/super-admin/tenants, PATCH /api/super-admin/tenants/:id/status, PATCH /api/super-admin/tenants/:id/plan, POST /api/super-admin/impersonate/:bakerId
- **Authentication**: JWT-based authentication with tokens stored in localStorage. Authorization headers automatically added by queryClient for all /api/super-admin/ routes
- **Plan Taxonomy**: 'starter' (free), 'professional' ($19/mo), 'enterprise' ($39/mo). 'pro' treated as synonym for 'professional'. Filter logic treats null/undefined subscriptionPlan as 'starter'.
- **Email Campaign Manager**: Complete email marketing system for super admins to communicate with bakers. Features include campaign creation with rich text content, plan-based segmentation (target specific subscription tiers), campaign sending with recipient tracking, and comprehensive statistics dashboard showing delivery metrics, open rates, click rates, and bounce rates. Database schema includes superAdminCampaigns and superAdminCampaignSends tables. API endpoints: GET/POST/PATCH/DELETE /api/super-admin/campaigns, POST /api/super-admin/campaigns/:id/send. Campaign status flow: draft → sent. Stats dialog displays total recipients, sent count, delivered/failed counts, and engagement metrics with percentages. End-to-end tested with plan segmentation.
- **Super Admin Credentials**: username "bwadmin", password "@@leXander001"

**October 1, 2025** - Baker Password Reset Implementation
- Added complete password reset flow for baker accounts
- Database schema updated with reset token fields (resetTokenHash, resetTokenExpiresAt, resetTokenUsedAt)
- Implemented secure token generation with SHA-256 hashing and 15-minute expiry
- Created baker-specific storage methods: createBakerResetToken, findBakerByResetTokenHash, consumeBakerResetToken
- Added API endpoints: POST /api/bakers/forgot-password and POST /api/bakers/reset-password
- Integrated email template for password reset notifications with branded design
- Added frontend routes: /baker/forgot-password and /baker-reset-password
- Security features: single-use tokens, email enumeration prevention, proper error handling
- End-to-end tested and verified

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI System**: Shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom wedding-themed color palette (pastels and warm tones)
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for profiles, estimates, and baker operations
- **Validation**: Zod schemas shared between client and server for consistent validation
- **Storage**: In-memory storage implementation with interface for future database integration

### Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe queries
- **Database**: PostgreSQL with Neon serverless database integration
- **Schema**: Comprehensive data models for users, profiles, estimates, and bakers
- **Migrations**: Drizzle Kit for database schema management and migrations

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **User System**: Basic user registration and authentication framework in place
- **Profile Association**: User profiles linked to individual wedding planning accounts
- **Password Reset**: Secure password reset flow for bakers with token-based email verification (15-minute expiry, single-use tokens, SHA-256 hashing)

### External Service Integrations
- **PDF Generation**: jsPDF for creating professional estimate documents
- **Location Services**: Browser geolocation API for baker proximity searches
- **Maps Integration**: Coordinate-based baker location system with radius filtering
- **Email Capabilities**: Framework prepared for estimate sharing and baker notifications

### Key Features
- **Dynamic Pricing Calculator**: Real-time cake cost calculations based on tiers, size, flavors, and decorations
- **Baker Directory**: Searchable database with location-based filtering and specialization tags
- **Profile Management**: Comprehensive wedding planning profiles with dietary restrictions and preferences
- **Estimate Management**: Save, edit, and share detailed cake estimates with line-item breakdowns
- **PDF Export**: Professional estimate generation for sharing with vendors and partners

### Development Architecture
- **Build System**: Vite for frontend with hot module replacement and TypeScript support
- **Development Tools**: TSX for server-side TypeScript execution in development
- **Code Quality**: Shared TypeScript configuration across frontend, backend, and shared modules
- **Asset Management**: Integrated asset handling with path resolution aliases

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18 with TypeScript, TanStack Query for data fetching
- **UI Components**: Radix UI primitives, Shadcn/ui component library, Lucide React icons
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer for cross-browser compatibility

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript support
- **Database**: Drizzle ORM with PostgreSQL dialect, Neon serverless database
- **Session Management**: Express sessions with PostgreSQL store integration
- **Validation**: Zod for runtime type checking and schema validation

### Development and Build Tools
- **Build Tools**: Vite for frontend bundling, ESBuild for server compilation
- **TypeScript**: Shared configuration across all modules with path mapping
- **Development**: TSX for TypeScript execution, Replit-specific development plugins

### Utility Libraries
- **PDF Generation**: jsPDF for estimate document creation
- **Date Handling**: date-fns for date manipulation and formatting
- **Styling Utilities**: clsx and tailwind-merge for conditional CSS classes
- **Form Handling**: React Hook Form with Hookform resolvers for validation integration