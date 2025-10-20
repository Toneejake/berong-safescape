# BFP Berong - E-Learning Platform Architecture

## Project Overview

**BFP Berong** is an educational platform for fire safety training and awareness developed for the Bureau of Fire Protection Sta. Cruz, Laguna, Philippines. The application serves multiple user types (kids, adults, professionals) with appropriate content and features for each audience.

## Technology Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **Database**: Prisma ORM with SQLite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Custom cookie-based authentication with localStorage fallback
- **State Management**: React Context API
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Icons**: Lucide React
- **Type Safety**: TypeScript

## System Architecture Layers

### 1. Presentation Layer (Frontend)

The presentation layer handles user interface rendering and interactions:

- **Next.js App Router**: Modern React framework with server-side rendering capabilities
- **Client Components**: Interactive UI elements using React hooks and state management
- **UI Components**: Reusable components built with shadcn/ui and Radix UI primitives
- **Navigation System**: Role-aware navigation with dynamic menu items based on user permissions
- **Responsive Design**: Mobile-first approach with responsive layouts for all devices

### 2. Application Logic Layer (Business Logic)

This layer contains the core business logic and application services:

- **Authentication Context**: Custom React Context for managing user sessions, roles, and permissions
- **Authorization Middleware**: Next.js middleware for route protection and role-based access control
- **State Management**: React Context API for managing application state across components
- **Business Logic**: User permission determination, progress tracking, content categorization
- **Client-Side Routing**: Next.js navigation with role-based route protection

### 3. Data Access Layer

The data access layer handles communication between the application and the database:

- **Prisma ORM**: Type-safe database access with SQL injection protection
- **Database Models**: Comprehensive schema defining relationships between entities
- **API Routes**: Server-side endpoints for data operations with proper validation
- **Data Validation**: Input sanitization and validation at API layer

### 4. Data Layer (Database)

The data layer manages data persistence and storage:

- **SQLite Database**: Local database using SQLite with Prisma schema
- **Database Schema**: Well-structured models with proper relationships and constraints
- **Data Storage**: User information, content management, progress tracking, and notifications
- **Migrations**: Prisma-based database migration system

### 5. Integration Layer

This layer handles external integrations and communication:

- **API Endpoints**: RESTful API routes for client-server communication
- **External Services**: Facebook Page Plugin integration, YouTube video embedding
- **File Storage**: Image upload functionality with local storage
- **Cookie Management**: HTTP cookie handling for session persistence

### 6. Security Layer

The security layer implements authentication and authorization mechanisms:

- **Authentication System**: Multi-role authentication with secure session management
- **Authorization System**: Role-based access control with permission checking
- **Route Protection**: Middleware-based protection for sensitive routes
- **Input Validation**: Client and server-side validation for all user inputs
- **Session Management**: Cookie and localStorage-based session handling

### 7. Content Management Layer

This layer provides tools for content creation and management:

- **Admin Dashboard**: Comprehensive content management system for administrators
- **Content CRUD Operations**: Full create, read, update, delete operations for various content types
- **User Management**: Admin tools for managing user accounts and permissions
- **Media Management**: Image upload and management system

### 8. User Experience Layer

The UX layer focuses on the learning experience:

- **Learning Modules**: Interactive educational content for different user types
- **Progress Tracking**: System to monitor user learning progress
- **Quiz System**: Assessment functionality with scoring
- **Notification System**: User alerts and updates
- **Chatbot Integration**: Quick question handling for user support

### 9. Infrastructure Layer

The infrastructure layer provides the underlying platform services:

- **Next.js Framework**: Provides server-side rendering, routing, and optimization
- **Build System**: Automated build and optimization pipeline
- **Static Asset Serving**: Public directory for images and other assets
- **Development Tools**: TypeScript, Tailwind CSS, and development server

## Project Structure

```
bfp-berong/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── admin/         # Admin API routes
│   │   ├── auth/          # Authentication routes
│   │   ├── content/       # Content management routes
│   │   ├── kids/          # Kids-specific routes
│   │   └── notifications/ # Notification routes
│   ├── admin/             # Admin dashboard
│   ├── adult/             # Adult learning section
│   ├── auth/              # Authentication pages
│   ├── kids/              # Kids learning section
│   ├── professional/      # Professional training
│   ├── profile/           # User profile
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui components
│   └── chatbot.tsx        # Chatbot component
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and context providers
│   ├── auth-context.tsx   # Authentication context
│   ├── mock-data.tsx      # Mock data
│   └── prisma.ts          # Prisma client
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── public/                # Static assets
│   ├── bfp logo.png       # BFP logo
│   ├── uploads/           # Uploaded images
│   └── ...                # Other static assets
├── middleware.ts          # Next.js middleware
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
└── ...                    # Other configuration files
```

## Database Schema

The application uses a comprehensive database schema with the following main models:

### User Model
- `id`: Unique identifier
- `email`: User email address
- `password`: Encrypted password
- `name`: User's name
- `age`: User's age
- `role`: User role (guest, kid, adult, professional, admin)
- `isActive`: Account status
- `permissions`: Role-based permissions

### QuickQuestion Model
- `id`: Unique identifier
- `category`: Question category (emergency, prevention, equipment, general)
- `questionText`: The question
- `responseText`: The answer
- `order`: Display order
- `isActive`: Status flag

### CarouselImage Model
- `id`: Unique identifier
- `title`: Image title
- `altText`: Alternative text
- `imageUrl`: Path to the image
- `order`: Display order
- `isActive`: Status flag

### BlogPost Model
- `id`: Unique identifier
- `title`: Blog title
- `excerpt`: Short description
- `content`: Full content
- `imageUrl`: Featured image
- `category`: Content category (kids, adult, professional)
- `authorId`: Foreign key to User
- `isPublished`: Publication status

### Video Model
- `id`: Unique identifier
- `title`: Video title
- `description`: Video description
- `youtubeId`: YouTube video ID
- `category`: Content category
- `duration`: Video duration
- `isActive`: Status flag

### KidsModule Model
- `id`: Unique identifier
- `title`: Module title
- `description`: Module description
- `dayNumber`: Sequential day number
- `content`: Module content
- `isActive`: Status flag

### UserProgress Model
- `id`: Unique identifier
- `userId`: Foreign key to User
- `moduleId`: Foreign key to KidsModule
- `completed`: Completion status
- `score`: Quiz score
- `completedAt`: Completion timestamp

## Authentication Flow

1. User registers or logs in through the authentication page
2. Credentials are validated against the database
3. If successful, a session is created using both cookies and localStorage
4. User permissions are determined based on their role
5. Middleware protects routes based on user permissions
6. Session is maintained throughout the user's interaction

## Security Measures

- **Route Protection**: Middleware-based protection for sensitive routes
- **Role-Based Access Control**: Different access levels based on user roles
- **Input Validation**: Client and server-side validation for all inputs
- **Session Management**: Secure cookie and localStorage handling
- **SQL Injection Prevention**: Prisma ORM protects against SQL injection
- **Password Security**: Passwords are hashed before storage (though implementation details not visible)

## Content Management

The platform provides comprehensive content management capabilities:

- **Admin Dashboard**: Centralized interface for content management
- **Multi-Content Types**: Support for blog posts, videos, carousel images, and quick questions
- **User Management**: Admins can manage user accounts and permissions
- **Media Upload**: Image upload functionality for content creators
- **Content Categorization**: Different content types for different user groups

## Learning Features

- **Role-Specific Content**: Different content areas for kids, adults, and professionals
- **Progress Tracking**: System to monitor learning progress
- **Interactive Quizzes**: Assessment functionality with scoring
- **Gamification**: Learning modules with completion tracking
- **Notification System**: Updates for new content and achievements

## API Structure

The application follows a RESTful API design:

- **Authentication Routes**: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`
- **Content Routes**: `/api/content/blogs`, `/api/content/videos`, `/api/content/carousel`
- **Kids Routes**: `/api/kids/modules`, `/api/kids/progress`, `/api/kids/quiz`
- **Admin Routes**: `/api/admin/blogs`, `/api/admin/videos`, `/api/admin/users`, etc.
- **Notification Routes**: `/api/notifications`

## Deployment Considerations

- **Database**: SQLite for development, but may need PostgreSQL/MySQL for production
- **Static Assets**: Images and other media files stored in public directory
- **Environment Configuration**: Proper environment variable management for sensitive data
- **Caching**: Potential for caching strategies to improve performance
- **Monitoring**: Logging and error tracking for production environments
