# WorldWeaver Gemini Context

## Project Overview

This is a Next.js 15 project called WorldWeaver. It's a worldbuilding and campaign management application that uses Supabase for the backend and is written in TypeScript. The application features a dynamic card system, a global template library, hierarchical organization, and a modern dark UI.

## Building and Running

### Prerequisites

*   Node.js 18+
*   Docker Desktop
*   Git

### Key Commands

*   `npm install`: Install dependencies.
*   `npx supabase start`: Start the local Supabase development environment.
*   `npm run dev`: Start the development server.
*   `npm run build`: Build the application for production.
*   `npm run start`: Start the production server.
*   `npm run lint`: Run ESLint to check for code quality issues.
*   `npm run format`: Format code with Prettier.
*   `npm run type-check`: Run the TypeScript compiler to check for type errors.
*   `npx supabase db reset`: Reset the local database.
*   `npx supabase migration new <name>`: Create a new database migration.
*   `npx supabase gen types typescript --local > src/types/supabase.ts`: Generate TypeScript types from the database schema.

## Development Conventions

*   **Framework**: Next.js 15 with App Router
*   **Styling**: Tailwind CSS v4 with a dark mode theme.
*   **State Management**: React Context for authentication and toast notifications.
*   **Database**: Supabase with PostgreSQL, using Row Level Security (RLS) for data protection.
*   **Code Style**: ESLint and Prettier are used for code quality and formatting. TypeScript is used for type safety.
*   **Components**: Reusable components are located in `src/components`.
*   **Types**: TypeScript types are defined in `src/types`.
*   **Database Migrations**: Supabase migrations are located in `supabase/migrations`.
