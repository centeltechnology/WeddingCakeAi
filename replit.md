# BakerIQ

## Overview
BakerIQ is a professional SaaS platform designed for bakeries to modernize business management. It offers a cohesive, high-contrast UI with a brand dark header and slate-based design system. Key capabilities include CRM, quotes, contracts, payments, and email automation, all tailored to enhance efficiency and customer engagement for bakers. The platform aims to be the leading solution in the bakery business management sector.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Frameworks**: React, TypeScript, Vite.
- **UI**: Shadcn/ui (built on Radix UI), Tailwind CSS with a slate-based design system. Features include token-based theming, accessible color palettes, and reusable components like Button (7 variants) and Card.
- **State Management**: TanStack Query.
- **Routing**: Wouter.
- **Forms**: React Hook Form with Zod validation.
- **Navigation**: Config-driven (`config/nav.ts`), responsive mobile drawer with ARIA semantics and focus management, sticky sidebar, active route highlighting, and feature flag filtering. Separated `PublicLayout` for marketing and `AppLayout` for authenticated admin pages.
- **UI/UX Decisions**: High-contrast UI with brand dark header and slate-based design. Animated mobile drawer, tooltips on header icons, enhanced ARIA navigation.
- **Header Quick Actions**: QuickActions component provides header icon shortcuts that check `isPublished` state and baker slug to enable/disable public preview links. Uses semantic `<a>` tags with proper href attributes for calculator (`/calculator?tenant=:slug`), booking (`/b/:slug/book`), and listing (`/p/:slug`) preview icons. URL builders in `lib/publicLinks.ts` provide explicit, encoded tenant-aware public URLs.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript (ES modules).
- **API**: RESTful endpoints using Zod shared schemas for validation.
- **Security**: Helmet middleware with environment-aware CSP.
- **Slug-Based Routing**: Baker slugs (e.g., "sweet-treats-bakery") serve as primary public identifiers for SEO-friendly URLs. Tenant resolver utility (`lib/tenantResolver.ts`) resolves tenants by baker slug with fallback to tenant subdomain for backwards compatibility.

### Data Storage Solutions
- **ORM**: Drizzle ORM for PostgreSQL.
- **Database**: PostgreSQL with Neon serverless integration.
- **Schema**: Comprehensive models for users, profiles, estimates, and bakers. Profile schema includes `isPublished` boolean field (default false) for controlling public profile visibility.
- **Migrations**: Drizzle Kit.

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL store and environment-aware cookies.
- **User System**: Basic registration, authentication, and token-based password reset.
- **Canonical Auth Routes**: `/login` is the primary auth route with 301 redirects from legacy paths (`/baker-login`, `/signin`, `/auth/login`). Legacy calculator route `/baker/:slug/calculator` redirects to `/calculator?tenant=:slug`.
- **Dev Mode Email Verification**: When `DEMO_MODE=true` and `EMAIL_TRANSPORT=log`, email verification tokens are logged to console and `/api/auth/dev-verify` endpoint provides instant email verification for development.
- **Feature Gating**: Three-tier plan system (Starter, Professional, Enterprise) with middleware.
- **Session Persistence**: `RootGate` component and `/api/session` endpoint with `Cache-Control: no-store`.

### Key Features
- **Baker Calculator**: Internal admin-only estimate builder at `/baker/calculator` with editable line items table (item, qty, unit price, notes), customer picker/creation, computed totals (subtotal, discount, tax, deposit), and save-as-quote functionality. Includes atomic customer upsert and quote creation with proper transaction handling. Accessible via sidebar navigation (under Customers) and header quick actions (SquareStack icon).
- **Dynamic Pricing Calculator**: Real-time cake cost calculations with customizable options, server-backed defaults, and theme customization.
- **CRM**: Bulk email, CSV export, one-click quote approval, lead capture, and management including a Lead Inbox for communication.
- **Quote & Contract Management**: Creation, editing, templating, secure token-based approval links, server-side rendering with variable replacement, and full workflow UI.
- **Invoice Management**: Tracking, payment status, and Stripe integration.
- **AI Lab**: Deterministic AI testing interface for suggesting items, summarizing quotes, and generating contracts, requiring explicit quote or lead context.
- **Interactive AI Dashboard**: Quick-action tiles for AI features with loading states, success navigation, and error handling:
  - Price Suggestion: Runs AI suggest-items on most recent quote, navigates to quote detail
  - Lead Scoring: Triggers lead rescore, navigates to leads page sorted by score
  - Auto-Reply Test: Sends test email, provides configuration link
  - Context-aware hooks (`useAiContext`) for recent quote detection and feature flags
- **Booking System**: Consultation booking with configurable settings, availability management, and public booking forms.
- **Auto-Reply System**: Automated email response system with template management, variable substitution, and rule-based triggers.
- **Customer Portal**: Secure, tokenized public access for customers to view and approve quotes, sign contracts, and view invoices.
- **Media Library**: Tenant-scoped image upload and management with local disk storage (dev) and S3 adapter (production).
- **Public Marketplace Listing**: SEO-optimized public bakery profile pages (`/p/:slug`) with lead-gen CTAs and dynamic SEO meta tags.
- **Profile Publishing Control**: Business Profile settings (`/settings/profile`) include publish toggle with `isPublished` field to control public profile visibility. Features include:
  - Toggle switch to publish/unpublish profile
  - Slug editing with automatic URL-safe formatting
  - Preview button to view public profile (`/p/:slug`) in new tab
  - Visual indicators for published vs unpublished state
- **Observability**: Health checks (`/healthz`), structured logging, and metrics tracking.

### Development Architecture
- **Build System**: Vite (frontend), ESBuild (server).
- **Development Tools**: TSX for server-side TypeScript.
- **Code Quality**: Shared TypeScript configuration, smoke tests, and Playwright E2E/API tests.
- **Demo Environment**: 
  - Demo tenant seed script (`server/scripts/seedDemoTenant.ts`) creates `demo@bakeriq.app` user with `sweet-treats-bakery` slug
  - Smoke test suite (`server/scripts/smokeTest.ts`) verifies auth flow, email verification, public routing, and legacy redirects (9 test cases)
  - Run with: `tsx apps/app/server/scripts/seedDemoTenant.ts` and `tsx apps/app/server/scripts/smokeTest.ts`

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
- **Email System**: AWS SES, Sendy.
- **Payment Processing**: Stripe.