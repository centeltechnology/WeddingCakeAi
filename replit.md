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

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript (ES modules).
- **API**: RESTful endpoints using Zod shared schemas for validation.
- **Security**: Helmet middleware with environment-aware CSP.

### Data Storage Solutions
- **ORM**: Drizzle ORM for PostgreSQL.
- **Database**: PostgreSQL with Neon serverless integration.
- **Schema**: Comprehensive models for users, profiles, estimates, and bakers.
- **Migrations**: Drizzle Kit.

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL store and environment-aware cookies.
- **User System**: Basic registration, authentication, and token-based password reset.
- **Feature Gating**: Three-tier plan system (Starter, Professional, Enterprise) with middleware.
- **Session Persistence**: `RootGate` component and `/api/session` endpoint with `Cache-Control: no-store`.

### Key Features
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
- **Observability**: Health checks (`/healthz`), structured logging, and metrics tracking.

### Development Architecture
- **Build System**: Vite (frontend), ESBuild (server).
- **Development Tools**: TSX for server-side TypeScript.
- **Code Quality**: Shared TypeScript configuration, smoke tests, and Playwright E2E/API tests.

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