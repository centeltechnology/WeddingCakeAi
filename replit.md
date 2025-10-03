# BakerIQ

## Overview

BakerIQ is a professional SaaS business platform designed for bakeries, offering a modern user experience with a clean design, orange accents, and comprehensive dark mode support. The platform aims to streamline business management for bakers, providing features such as CRM, quotes, contracts, payments, and email automation, all with baker-centric navigation. It envisions becoming the go-to platform for bakery business management, enhancing efficiency and customer engagement.

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

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful endpoints.
- **Validation**: Zod schemas shared between client and server.
- **Storage**: In-memory storage with an interface for future database integration.

### Data Storage Solutions
- **ORM**: Drizzle ORM for PostgreSQL.
- **Database**: PostgreSQL with Neon serverless integration.
- **Schema**: Comprehensive data models for users, profiles, estimates, and bakers.
- **Migrations**: Drizzle Kit for schema management.

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store.
- **User System**: Basic user registration and authentication.
- **Profile Association**: User profiles linked to wedding planning accounts.
- **Password Reset**: Secure token-based password reset flow for bakers.
- **Feature Gating**: Three-tier plan system (Starter, Professional, Enterprise) with middleware for feature access control (e.g., bulk email, CSV export for Enterprise).

### External Service Integrations
- **PDF Generation**: jsPDF for estimate documents.
- **Location Services**: Browser geolocation API.
- **Maps Integration**: Google Maps API with Places Autocomplete for location-based features.
- **Email Capabilities**: Framework for estimate sharing and notifications.
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
- **Dark Mode**: ThemeToggle component with Light/Dark/System options.
- **Email Campaign Management**: Super admin system for sending segmented email campaigns to bakers.
- **Calculator Leads Capture**: Automatic lead capture from the pricing calculator with customer confirmation emails, integrated with Sendy.
- **Super Admin Dashboard**: Multi-tenant control, analytics (MRR, user growth), subscription management, baker impersonation, and baker management.
- **Password Reset**: Complete password reset flow for baker accounts.

### Development Architecture
- **Build System**: Vite for frontend, ESBuild for server compilation.
- **Development Tools**: TSX for server-side TypeScript.
- **Code Quality**: Shared TypeScript configuration.
- **Asset Management**: Integrated asset handling with path resolution aliases.

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