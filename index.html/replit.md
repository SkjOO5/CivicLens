# Overview

Civic Lens is a comprehensive civic issue reporting platform designed to facilitate communication between citizens and municipal authorities across India. The system enables citizens to report local issues through a mobile-friendly interface while providing government staff with administrative tools to track, categorize, and respond to these reports. The platform supports multimedia reporting with photos, automatic geolocation, voice input, and AI-powered categorization to streamline the issue management process.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built using React with TypeScript, implementing a component-based architecture with the following design patterns:
- **UI Framework**: shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The server follows a RESTful API design using Express.js with TypeScript:
- **Framework**: Express.js with middleware for JSON parsing, file uploads, and error handling
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **File Storage**: Local file system with multer for handling image uploads and Sharp for image processing
- **API Structure**: Modular route handlers with centralized error handling and request logging

## Data Storage Solutions
- **Primary Database**: PostgreSQL using Neon serverless for scalability
- **ORM**: Drizzle ORM providing type-safe database queries and schema management
- **File Storage**: Local filesystem for uploaded images with URL-based access
- **Schema Design**: Normalized structure with separate tables for users, issues, and comments

## Authentication and Authorization
Currently implements a basic role-based system with:
- **User Roles**: citizen, admin, department_staff
- **Session Management**: Prepared for implementation with connect-pg-simple for PostgreSQL-backed sessions
- **Access Control**: Role-based permissions for different functionalities

## External Dependencies

### Third-party Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **OpenAI API**: GPT-5 integration for automatic issue categorization and confidence scoring
- **Web APIs**: Browser geolocation API for automatic location detection
- **Speech Recognition**: Browser-native speech-to-text for voice input functionality

### Key Libraries and Frameworks
- **Backend**: Express.js, Drizzle ORM, multer for file uploads, Sharp for image processing
- **Frontend**: React, React Query, React Hook Form, Zod validation, Tailwind CSS
- **UI Components**: Radix UI primitives, shadcn/ui component system
- **Development Tools**: Vite, TypeScript, ESBuild for production bundling

### Location Data
- **Geographic Coverage**: Complete Indian states and districts data structure
- **Data Source**: Static JSON configuration for offline state/district selection
- **Coordinate System**: Standard GPS coordinates (latitude/longitude) for precise location mapping

The system is designed for high scalability with serverless database architecture and modular component structure, enabling easy feature additions and maintenance.