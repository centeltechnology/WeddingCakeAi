# BakerIQ

## Overview

A professional SaaS business platform for bakeries featuring modern design with clean white backgrounds, orange accent colors (#f97316), and comprehensive dark mode support. The platform emphasizes software business management capabilities including CRM, quotes, contracts, payments, and email automation features with streamlined baker-centric navigation.

**Domain**: bakeriq.app

## Recent Changes

**October 1, 2025** - Super Admin Dashboard Implementation
- Built comprehensive Super Admin Dashboard at /super-admin route with platform management capabilities
- Platform statistics: totalBakers, activeBakers, MRR, freeUsers, paidUsers, trialUsers, churnRate
- Baker management table with search, filtering (all/active/suspended/free/paid), and actions
- Detail modal for viewing baker information and updating subscription plans
- API endpoints: GET /api/super-admin/stats, GET /api/super-admin/tenants, PATCH /api/super-admin/tenants/:id/status, PATCH /api/super-admin/tenants/:id/plan
- JWT-based authentication with token stored in localStorage
- Plan taxonomy aligned with platform: 'starter' (free), 'professional' ($19/mo), 'enterprise' ($39/mo)
- Filter logic treats null/undefined subscriptionPlan as 'starter' (free) for consistency
- MRR calculation: professional=$19, enterprise=$39
- Authorization headers automatically added by queryClient for all /api/super-admin/ routes
- Super Admin credentials: username "bwadmin", password "@@leXander001"

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