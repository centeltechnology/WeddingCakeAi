# BakerIQ

## Overview
BakerIQ is a professional SaaS platform for bakeries, designed to modernize business management with a cohesive, high-contrast UI featuring a brand dark header and slate-based design system. It provides features like CRM, quotes, contracts, payments, and email automation, all tailored for bakers. The platform aims to be the leading solution for bakery business management, enhancing efficiency and customer engagement.

## Recent Changes (Mega-Fix Pack - Oct 2025)
- **Navigation Overhaul**: Implemented left sidebar with config-driven nav tree (`config/nav.ts` with NavNode type), nested Customers menu (Leads/Quotes/Contracts/Invoices), responsive mobile drawer, sticky sidebar on desktop
- **Logout Fix**: Added proper POST /logout endpoint that clears sid cookie, updated client logout() to call correct endpoint and redirect to /login
- **Sample Data Loader**: Added GET /api/leads/sample endpoint for idempotent demo lead seeding (creates 3 sample leads if tenant has none)
- **AI Lab Enhancement**: Replaced stub endpoints with real demo responses - suggest-items returns cake/cupcake suggestions, summarize-quote provides quote summary, generate-contract returns contract clauses
- **Booking UX**: Replaced timezone text input with US timezone dropdown (7 zones: ET, CT, MT, AZ, PT, AK, HI)
- **Header & Sidebar UX Polish**: Animated mobile drawer with focus trap and ARIA semantics (role="dialog", aria-modal, ESC to close, backdrop click), tooltips on header icons (300ms delay, keyboard accessible), enhanced ARIA navigation (aria-expanded, aria-current, aria-controls), proper focus management (saves/restores focus, first element focus on open)
- **Observability & Testing**: Health check (/healthz), structured logging, metrics tracking, smoke test script (scripts/smoke.ts), Playwright E2E/API test suites
- **CSV Importer**: Customer/lead and catalog item CSV import with validation, preview, and bulk insert (Settings → Import Data)

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Frameworks**: React, TypeScript, Vite.
- **UI**: Shadcn/ui (built on Radix UI), Tailwind CSS with slate-based design tokens.
- **Design System**: Token-based theming (`styles/tokens.css`) with slate-900 brand dark header, tinted slate-50 page backgrounds, and accessible color palette. Unified Button component with 7 variants (primary, secondary, outline, outline-light, ghost, danger, success) ensuring AAA contrast. Reusable Card component for consistent surfaces.
- **State Management**: TanStack Query.
- **Routing**: Wouter.
- **Forms**: React Hook Form with Zod validation.
- **Navigation**: Brand dark header with white text and active pills. Centralized system with `config/nav.ts` (MAIN_NAV array, featureOn utility), responsive `AppHeader` component with mobile hamburger drawer, `AppLayout`, and `PageHeader` components. Features: mobile-first responsive design, scroll-locking drawer, active route highlighting, feature flag filtering, unified logout flow. QuickActions component provides tenant-aware preview links and credits top-up in both compact (header) and full (dashboard) modes.
- **Layout Separation**: Clean architecture separating public marketing pages from admin pages. PublicLayout (NavigationHeader + Footer) for public pages; AppLayout (admin nav with brand header) for authenticated pages. Anti-nest CSS protection prevents marketing headers in admin contexts. Guard script (`scripts/guard-admin-clean.sh`) validates separation.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript (ES modules).
- **API**: RESTful endpoints with Zod shared schemas for validation.
- **Security**: Helmet middleware with environment-aware CSP.

### Data Storage Solutions
- **ORM**: Drizzle ORM for PostgreSQL.
- **Database**: PostgreSQL with Neon serverless integration.
- **Schema**: Comprehensive models for users, profiles, estimates, and bakers.
- **Migrations**: Drizzle Kit.

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL store, environment-aware cookies.
- **User System**: Basic registration, authentication, and token-based password reset.
- **Feature Gating**: Three-tier plan system (Starter, Professional, Enterprise) with middleware.
- **Session Persistence**: `RootGate` component and `/api/session` endpoint with `Cache-Control: no-store`.

### Key Features
- **Dynamic Pricing Calculator**: Real-time cake cost calculations with decoration options.
- **Baker Directory**: Searchable directory with filtering.
- **Profile & Estimate Management**: Comprehensive profiles, creation, editing, and sharing of cake estimates.
- **PDF Export**: Professional estimate generation.
- **CRM**: Bulk email, CSV export, one-click quote approval.
- **Quote Management**: UI for creating/managing templates, secure token-based approval links (30-day expiry), and full transactional flow from quote to customer.
- **Contract Management**: Server-side rendering with variable replacement, payment snapshots, full workflow UI, and secure token-based public approval.
- **Invoice Management**: Tracking invoices, payment status, Stripe integration.
- **Public Shortlinks**: SEO-friendly short URLs for quotes (`/q/:id`) and contracts (`/c/:id`).
- **Transaction-Wrapped Mutations**: Atomic database operations for data consistency.
- **Dark Mode**: ThemeToggle component.
- **Email Campaign Management**: Super admin system for segmented email campaigns.
- **Calculator Leads Capture**: Automatic lead capture with Sendy integration.
- **Advertiser Network**: Lead rental system with advertiser accounts, credit management, targeted campaigns, and tracking.
- **Super Admin Dashboard**: Multi-tenant control, analytics, subscription management, baker impersonation.
- **Dashboard Widgets**: Tenant-aware components (PipelineChart, RevenueStat, TaskList).
- **Timeline & Event Tracking**: Comprehensive audit systems for quotes, contracts, and invoices with visual timelines and API access.
- **AI Lab**: Testing interface for AI features (suggest items, summarize, generate contract) with stub endpoints.
- **Baker Calculator**: Authenticated business pricing calculator with feature flags (VITE_CALCULATOR_ENABLED, CALCULATOR_ENABLED), custom line items, complexity pricing ($3.5-$7.5 per serving), rush fees (25%), delivery charges ($2/mile), and smart routing (unauthenticated → V1 demo, authenticated → business calculator).
- **Business Profile**: Tenant-scoped profile management with display name, contact info, about section, specialties (CSV → chips), and image URLs. Accessible via Settings tab navigation with GET/POST /api/me/profile endpoints.
- **Social Links & Payment Options**: Extended Settings with social media links (Facebook, Instagram, TikTok, YouTube, Pinterest) and payment methods (Cash App, Venmo, PayPal, Zelle, Stripe). JSONB columns in tenant_profiles with partial-update merge logic to preserve unrelated fields during saves.
- **Media Library**: Tenant-scoped image upload and management system with local disk storage (dev) and pluggable S3 adapter (production). Features include: multipart file upload via multer, thumbnail grid UI, delete functionality, set-as-logo action, and set-as-cover action. Security: 10MB file size limit, image MIME type validation, tenant isolation via directory structure (/uploads/<tenant>/), asset ownership validation before logo/cover updates. Endpoints: POST /api/uploads/presign, GET /api/media, DELETE /api/media/:id, POST /api/media/logo, POST /api/media/cover. Static serving in dev mode; production should use S3 signed URLs.
- **Booking System**: Consultation booking system with feature flags (VITE_BOOKING_ENABLED, BOOKING_ENABLED). Admin features: booking settings configuration (timezone, slot duration, services), booking list management (confirm/cancel). Public features: booking form with customer info and availability. Database: bookingSettings table for tenant configuration, reuses existing bookings table. Endpoints: GET/POST /api/booking/settings, GET /api/booking/list, POST /api/booking/confirm/:id, POST /api/booking/cancel/:id, GET /api/booking/availability, POST /api/booking/create. UI: BookingSettings, BookingList (admin pages), BookingPublic (public page), integrated into Settings Hub with tab navigation. Navigation: Bookings link appears in top nav when feature flag enabled.
- **Auto-Reply System**: Tenant-scoped automated email response system with feature flags (VITE_AUTO_REPLY_ENABLED, AUTO_REPLY_ENABLED). Features: template management with variable substitution ({{customer_name}}, {{event_date}}, etc.), rule engine with triggers (new_lead, after_hours, no_response), condition-based sending (min budget, sources, hours since message), quiet hours support, email/SMS channels (email active, SMS stub). Database: autoReplySettings, autoReplyTemplates, autoReplyRules, autoReplyLogs tables. Rate limiting: 1 auto-reply per lead per 12 hours, 50 sends per tenant per day. Endpoints: GET/POST /api/auto-reply/settings, GET/POST/DELETE /api/auto-reply/templates, GET/POST /api/auto-reply/rules, POST /api/auto-reply/rules/:id/toggle, POST /api/auto-reply/test, POST /api/auto-reply/trigger/{new-lead|no-response|after-hours}/:leadId. UI: AutoReplySettings, AutoReplyTemplates (with test send), AutoReplyRules components, integrated into Settings Hub. Email sending: stub mode (logs to console) when no provider configured, ready for integration with SES/Resend/SendGrid.
- **Customer Portal**: Secure tokenized public access system for quotes, contracts, and invoices. Features: 32-byte secure random tokens with 30-day TTL, tenant-isolated token validation, template snapshot rendering, public pages without authentication. Database: public_tokens table with unique tokens and expiration tracking. Token management: issuePublicToken() helper with reuse of valid existing tokens. Public routes: GET /portal/q/:token (quote view), POST /portal/q/:token/approve (quote approval with event logging), GET /portal/c/:token (contract view), POST /portal/c/:token/sign (contract signing with automatic deposit invoice creation), GET /portal/i/:token (invoice view). Admin API: POST /api/portal/token/issue (generates shareable customer links). UI components: PortalQuote.tsx, PortalContract.tsx, PortalInvoice.tsx (public pages), CopyCustomerLinkButton (admin reusable component). Security: token validation before access, tenant ID verification, expired token rejection, no authentication required on public portal.
- **Lead Inbox**: Comprehensive lead communication and management system with feature flag (VITE_LEAD_SCORING_ENABLED, LEAD_SCORING_ENABLED). Features: thread view combining messages and notes chronologically, email sending interface (stub mode - logs only), internal note creation, lead detail panel with contact info and metadata. Database: lead_messages table (direction, channel, subject, body) and lead_notes table (body, author) linked to leads. UI: LeadInbox page with 2-column layout (thread panel left, details panel right), color-coded message types (blue=incoming, green=outgoing, orange=notes), comprehensive error handling with retry affordances for both lead and thread fetch failures. Endpoints: GET /api/leads/:id/thread (combined messages + notes), POST /api/leads/:id/messages (send email stub), POST /api/leads/:id/notes (add internal note). Integration: Auto-recalculates lead scores after messages/notes via upsertLeadScore() for real-time engagement tracking. Route: /leads/:id with tenant isolation and authentication.
- **Public Marketplace Listing**: SEO-optimized public bakery profile page accessible via /p/:slug. Features: hero section with bakery name and location, about section, specialties displayed as chips, image gallery with logo and cover photo, social media links, lead-gen CTA button (booking or calculator based on feature flags with UTM tracking for source attribution). Uses react-helmet-async for dynamic SEO meta tags (title, description, Open Graph). Endpoint: GET /api/public/profile/:slug for unauthenticated public access. Graceful handling of missing data with default fallbacks.

### Development Architecture
- **Build System**: Vite (frontend), ESBuild (server).
- **Development Tools**: TSX for server-side TypeScript.
- **Code Quality**: Shared TypeScript configuration.

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, TypeScript, TanStack Query.
- **UI Components**: Radix UI, Shadcn/ui, Lucide React.
- **Styling**: Tailwind CSS.

### Backend Dependencies
- **Server Framework**: Express.js.
- **Database**: Drizzle ORM, PostgreSQL, Neon.
- **Session Management**: Express sessions, connect-pg-simple.
- **Validation**: Zod.

### Utility Libraries & Services
- **PDF Generation**: jsPDF.
- **Date Handling**: date-fns.
- **Mapping**: Google Maps API (Places Autocomplete).
- **Email System**: AWS SES, Sendy (for email marketing and list management).
- **Payment Processing**: Stripe (for invoice management).