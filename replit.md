# BakerIQ

## Overview

BakerIQ is a professional SaaS business platform designed for bakeries, offering a modern user experience with a clean design, orange accents, and comprehensive dark mode support. The platform aims to streamline business management for bakers, providing features such as CRM, quotes, contracts, payments, and email automation, all with baker-centric navigation. It envisions becoming the go-to platform for bakery business management, enhancing efficiency and customer engagement.

## Recent Changes

### Navigation Standardization (October 2025)
- Implemented centralized navigation infrastructure with AppLayout, navConfig, and PageHeader components
- Created automated code-mod script (enforceAppLayout.ts) using ts-morph for AST manipulation to enforce consistent layout
- Successfully migrated 18 authenticated pages to AppLayout: Admin (5), Core App (7), Features (6)
- Script features: config-based filtering, default export scoping, multi-return support, reverse-order AST modification
- All authenticated pages now share centralized navigation with role-based visibility

### Timeline Event System Fix (October 2025)
- Fixed missing contract/invoice timeline events using backfillContractInvoiceEvents.ts script
- Resolved tenant_id null constraint issue: 1 contract had null tenant_id (bypassed tenant scoping during creation)
- Backfilled 6 contract events (3 created + 3 signed) and 3 invoice events (3 created)
- Root cause: Public contract signing route bypassed tenant context; fixed by linking to quote's tenantId
- Future prevention: Add NOT NULL constraint to contracts.tenant_id and strengthen validation in creation endpoints

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite.
- **UI System**: Shadcn/ui components built on Radix UI.
- **Styling**: Tailwind CSS with a custom wedding-themed color palette.
- **State Management**: TanStack Query for server state management.
- **Routing**: Wouter for client-side routing.
- **Forms**: React Hook Form with Zod validation.
- **Navigation System**: Centralized navigation infrastructure with:
  - `navConfig.ts`: Centralized navigation configuration with demo mode support (VITE_DEMO_MODE env var)
  - `AppLayout` component: Shared layout with top nav bar, responsive design, dark mode support, and user menu
  - `PageHeader` component: Consistent page headers with back button functionality
  - Demo mode filtering: Navigation items marked with `demoOnly: true` are hidden when VITE_DEMO_MODE is false
  - Active state tracking: Nav links highlight based on current route using wouter's location hook
  - Core pages using AppLayout: QuoteList, InvoiceList, ContractsList, AILab, NotFound

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful endpoints.
- **Validation**: Zod schemas shared between client and server.
- **Storage**: In-memory storage with an interface for future database integration.
- **Security**: Helmet middleware with environment-aware CSP (disabled in development for Vite HMR, strict in production).

### Data Storage Solutions
- **ORM**: Drizzle ORM for PostgreSQL.
- **Database**: PostgreSQL with Neon serverless integration.
- **Schema**: Comprehensive data models for users, profiles, estimates, and bakers.
- **Migrations**: Drizzle Kit for schema management.

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store, environment-aware cookie configuration (sameSite/secure based on CROSS_SITE_COOKIES env).
- **User System**: Basic user registration and authentication.
- **Profile Association**: User profiles linked to wedding planning accounts.
- **Password Reset**: Secure token-based password reset flow for bakers.
- **Feature Gating**: Three-tier plan system (Starter, Professional, Enterprise) with middleware for feature access control (e.g., bulk email, CSV export for Enterprise).
- **Session Persistence**: RootGate component with smart root redirect, /api/session endpoint with Cache-Control: no-store prevents logout on browser Back button, Vite dev proxy for same-origin API calls.

### External Service Integrations
- **PDF Generation**: jsPDF for estimate documents.
- **Location Services**: Browser geolocation API.
- **Maps Integration**: Google Maps API with Places Autocomplete for location-based features.
- **Email System**: AWS SES integration with modular template architecture. Email templates (`contractEmail.ts`, `invoiceEmail.ts`) use shared layout/partials pattern. Send functions are thin wrappers that load data and call `sendEmail()` helper.
- **Email Marketing**: Sendy integration for automated list management and baker segmentation.

### Key Features
- **Dynamic Pricing Calculator**: Real-time cake cost calculations with 8 decoration options including Piping & Borders, Edible Glitter, Hand-painted Design, and Sugar Flowers.
- **Baker Directory**: Searchable directory with filtering.
- **Profile Management**: Comprehensive wedding planning profiles.
- **Estimate Management**: Save, edit, and share detailed cake estimates.
- **PDF Export**: Professional estimate generation.
- **CRM Features**: Bulk email for leads, CSV export for leads, one-click quote approval system with secure tokenized links.
- **Quote Template Management**: UI for creating and managing reusable quote templates.
- **Quote Approval System**: Customers receive email with secure approval link (/quote-approval/:token) to view, approve, or decline quotes. Links expire after 30 days.
- **Quote-Lead-Customer Linkage**: Complete transactional flow with idempotent upserts ensuring quotes.lead_id and leads.signature are properly populated. Client stores customer details in form state to prevent race conditions. Quote creation stays on dashboard and opens quote details modal.
- **Server-Side Contract Rendering**: Template system with variable replacement for baker/customer/payment info. Payment snapshots stored in contracts.payment_snapshot (jsonb) for audit trail. Supports Zelle, PayPal, CashApp, Venmo with XSS sanitization.
- **Contract Management UI**: Complete contract workflow with ContractsList and ContractEdit pages for bakers. Public contract approval flow with secure token-based access (GET /c/:id shortlinks → /contract-approval/:token). Token validation with 30-day expiry, status gating, and sanitized public endpoints. Transaction-wrapped signature creation for data consistency.
- **Invoice Management UI**: InvoicesList and InvoiceDetail pages for tracking invoices, payment status, and amounts. Integrated with Stripe payment processing.
- **Public Shortlinks**: SEO-friendly short URLs for quotes (GET /q/:id) and contracts (GET /c/:id) that redirect to secure approval pages with auto-generated tokens.
- **Transaction-Wrapped Mutations**: Atomic database operations for lead conversion, contract creation/signing preventing data inconsistencies.
- **Dark Mode**: ThemeToggle component with Light/Dark/System options.
- **Email Campaign Management**: Super admin system for sending segmented email campaigns to bakers.
- **Calculator Leads Capture**: Automatic lead capture from the pricing calculator with customer confirmation emails, integrated with Sendy.
- **Advertiser Network**: Complete lead rental system with advertiser accounts, credit management, campaign creation with advanced targeting (geo, dates, budgets, interests), and automated sending via AWS SES. Includes preflight audience counting, credit ledger, frequency caps (7-day network-wide, 30-day per-advertiser), tracking (opens/clicks), and secure unsubscribe with SHA-256 token hashing.
- **Super Admin Dashboard**: Multi-tenant control, analytics (MRR, user growth), subscription management, baker impersonation, and baker management.
- **Password Reset**: Complete password reset flow for baker accounts with rate limiting (20 req/10min) and daily cleanup job (2 AM) for expired tokens.
- **Role-Based Navigation**: Dynamic navigation system with centralized AppLayout and navConfig. Shows role-specific links (baker: Quotes/Invoices/Contracts/Customers, admin: Tenants/Users). Features demo mode filtering via VITE_DEMO_MODE env var, active state tracking, user menu with theme toggle, and consistent page headers with back navigation. Legacy AppShell component being phased out as pages migrate to AppLayout.
- **Dashboard Widgets**: Tenant-aware dashboard components using TanStack Query and Recharts, including PipelineChart (quotes by status), RevenueStat (MTD revenue with month-over-month comparison), and TaskList (task management with create/complete). All widgets filter by tenant_id for multi-tenancy isolation.
- **Quote Timeline & Event Tracking**: Comprehensive audit system with quote_events table tracking all lifecycle events (created, updated, sent, viewed, approved, declined). QuoteTimeline React component displays visual timeline with event history, metadata (email subjects, field changes, customer info), and timestamp tracking. Fully integrated into QuoteBuilder dialog with proper authentication and tenant filtering.
- **Contract & Invoice Timeline UI**: Event history visualization with ContractTimeline and InvoiceTimeline components. API endpoints (`GET /api/contracts/:id/events`, `GET /api/invoices/:id/events`) provide secured, role-based access to event logs. Integrated into ContractEdit and InvoiceDetail pages for complete audit trail visibility.
- **Quote Management System**: Complete quote workflow with QuoteList page for viewing all quotes, "New Quote" button for creation, and one-click approve functionality that triggers automatic contract generation. Routes: `/quotes` (list), `/quotes/new` (create), `/quotes/:id` (edit). Server endpoints: `GET /api/quotes` (tenant-filtered list), `POST /api/quotes/:id/approve` (approve and create contract).
- **Contract Management System**: Minimal contracts module with ContractsList and ContractEdit pages. Routes: `/contracts` (list), `/contracts/:id` (detail). Server endpoints: `GET /api/contracts` (tenant-scoped list), `POST /api/contracts/:id/sign` (sign contract and auto-create deposit invoice).
- **Invoice Management System**: Fully testable invoices with InvoiceList and InvoiceDetail pages. Routes: `/invoices` (list), `/invoices/:id` (detail). Server endpoints: `GET /api/invoices` (tenant-scoped list), `POST /api/invoices` (create with createSimpleInvoice helper), `POST /api/invoices/:id/paid` (mark as paid). Includes "Create Invoice" and "Mark Paid" buttons with proper loading states.
- **AI Lab**: Testing interface for AI-powered features at `/ai-lab`. Three stub endpoints for testers: `POST /api/ai/suggest-items` (suggest quote items), `POST /api/ai/summarize-quote` (generate quote summary), `POST /api/ai/generate-contract` (draft contract from quote). All endpoints protected with authentication and return `{ ok: true }` stub responses with success/failure alerts in UI.

### Development Architecture
- **Build System**: Vite for frontend, ESBuild for server compilation.
- **Development Tools**: TSX for server-side TypeScript.
- **Code Quality**: Shared TypeScript configuration.
- **Asset Management**: Integrated asset handling with path resolution aliases.

## UAT Testing & Quality Assurance

### Testing Framework
- **UAT Tests**: Comprehensive end-to-end testing framework validating customer journey from quote to payment.
- **Test Coverage**: Quote creation/approval, contract generation/signing, invoice creation, and payment processing.
- **Documentation**: UAT_TEST_SUMMARY.md contains detailed test results and findings.

### Known Issues & Automation Gaps

#### High Priority
1. **Missing Contract Auto-Creation**: Contracts are NOT automatically created when quotes are approved. Manual intervention required.
2. **Missing Invoice Auto-Creation**: Invoices are NOT automatically created when contracts are signed. Manual intervention required.

#### Medium Priority
3. **API Parameter Inconsistency**: Contract signing endpoint uses `signerName`/`signerEmail` while other endpoints may use `customerName`/`customerEmail`.

#### Verified Working
- ✅ Quote timeline event tracking (sent, viewed, approved, declined)
- ✅ Multi-tenant data isolation across all entities
- ✅ Quote-to-contract-to-invoice data linkage
- ✅ Secure token-based approval flows
- ✅ Transaction-wrapped database operations

### Recommendations
- Implement event-driven architecture for automated workflow transitions
- Add webhook support for external integrations
- Extend timeline tracking to contracts and invoices
- Add automated email notifications for all status changes

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, TypeScript, TanStack Query.
- **UI Components**: Radix UI, Shadcn/ui, Lucide React.
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer.

### Backend Dependencies
- **Server Framework**: Express.js.
- **Database**: Drizzle ORM, PostgreSQL, Neon (serverless).
- **Session Management**: Express sessions, connect-pg-simple.
- **Validation**: Zod.

### Development and Build Tools
- **Build Tools**: Vite, ESBuild.
- **TypeScript**: Shared configuration.
- **Development**: TSX.

### Utility Libraries
- **PDF Generation**: jsPDF.
- **Date Handling**: date-fns.
- **Styling Utilities**: clsx, tailwind-merge.
- **Form Handling**: React Hook Form, Hookform resolvers.
- **Mapping**: Google Maps API.
- **Email Marketing**: Sendy (self-hosted).