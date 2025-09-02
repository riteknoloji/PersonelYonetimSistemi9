# Personnel Management System

## Overview

This is a comprehensive personnel management system built with React and Node.js, designed to handle employee information, leave management, shift scheduling, and attendance tracking. The application features a modern web interface with authentication, dashboard analytics, and complete CRUD operations for personnel management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for API routes and middleware
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL storage
- **Development**: Hot module replacement with Vite integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM Schema**: Drizzle with type-safe migrations
- **Session Storage**: PostgreSQL table for authentication sessions
- **Schema Structure**: Comprehensive employee data model including:
  - Users and authentication
  - Departments and branches
  - Personnel with relationships
  - Leave management system
  - Shift scheduling and assignments
  - Attendance tracking

### Authentication and Authorization
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: Secure PostgreSQL-backed sessions
- **Role-Based Access**: User roles (personnel, admin, hr, manager, super_admin)
- **Security Features**: HTTP-only cookies, CSRF protection, secure session management

### API Design
- **Architecture**: RESTful API with Express routes
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error middleware
- **Logging**: Request/response logging with duration tracking
- **CORS**: Configured for secure cross-origin requests

### Component Architecture
- **Layout System**: Responsive sidebar navigation with mobile support
- **Component Library**: Custom UI components extending Radix primitives
- **Dashboard**: Real-time statistics and activity monitoring
- **Personnel Management**: Full CRUD operations with modal forms
- **Responsive Design**: Mobile-first approach with breakpoint considerations

### Development Workflow
- **Monorepo Structure**: Shared types and schemas between frontend/backend
- **Hot Reload**: Vite development server with Express integration
- **Type Safety**: End-to-end TypeScript with shared schema definitions
- **Path Aliases**: Configured imports for clean code organization

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth OIDC provider
- **Hosting**: Replit development and deployment platform

### UI and Design System
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts integration (Inter, Geist Mono, DM Sans)

### Development Tools
- **Bundler**: Vite for fast development builds
- **Database Tools**: Drizzle Kit for migrations and schema management
- **Form Validation**: Zod for runtime type validation
- **Date Handling**: date-fns for date manipulation utilities

### Monitoring and Development
- **Error Tracking**: Replit runtime error overlay for development
- **Code Analysis**: Replit Cartographer for code insights
- **Session Management**: connect-pg-simple for PostgreSQL session storage