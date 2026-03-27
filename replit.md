# Frontend React Dashboard

## Overview
A modern React-based dashboard/admin frontend boilerplate with authentication, internationalization, and a robust UI component library. Built as a SPA (Single Page Application) with no backend component.

## Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix UI primitives)
- **State Management**: Zustand
- **Routing**: React Router v7
- **Data Fetching**: Axios + SWR
- **Animations**: Framer Motion
- **i18n**: i18next / react-i18next
- **Validation**: Zod
- **Package Manager**: pnpm

## Project Structure
- `src/core/` - API clients and global state (Zustand store)
- `src/pages/` - Route components (private/ and public/)
- `src/components/ui/` - Reusable UI components (Shadcn)
- `src/lib/` - Shared utilities
- `src/config/` - App configuration and environment variable handling
- `src/assets/` - Static assets

## Key Features
- JWT authentication with auto token refresh (access + refresh tokens in localStorage)
- Light/dark theme support via next-themes + Zustand
- Lazy-loaded routes for performance
- Error pages (403, 404, 500)
- Alias `@/` maps to `src/`

## Development
- Workflow: `pnpm run dev` on port 5000
- The Vite dev server is configured with `host: "0.0.0.0"` and `allowedHosts: true` for Replit proxy support

## Deployment
- Configured as a **static** deployment
- Build command: `pnpm run build`
- Public directory: `dist`
