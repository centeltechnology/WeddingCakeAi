# Wedding Cake Calculator

## Overview

A comprehensive web application designed for wedding cake pricing and baker discovery. The platform enables couples to calculate custom cake costs, maintain detailed wedding profiles, and connect with local bakers. Built as a full-stack TypeScript application with modern React frontend and Express backend, featuring real-time pricing calculations, baker search functionality, and PDF estimate generation.

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