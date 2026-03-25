# Architecture Overview

## Project Structure

This is a full-stack TypeScript monorepo using pnpm workspaces with Express.js backend and React frontend.

```
carterscare/
├── packages/
│   ├── backend/          # Express.js API server
│   │   ├── src/
│   │   │   ├── config/   # Database & environment config
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── services/ # Business logic layer
│   │   │   ├── middleware/ # Request/response middleware
│   │   │   ├── utils/    # Shared utilities (logging, validation, errors)
│   │   │   └── __tests__/ # Test files
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── frontend/         # React SPA
│   │   ├── src/
│   │   │   ├── pages/    # Route pages
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── hooks/    # Custom React hooks (API integration)
│   │   │   ├── lib/      # Utilities and API client
│   │   │   └── __tests__/ # Test files
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/           # Shared TypeScript types
│       ├── src/
│       │   └── index.ts  # API types, interfaces, responses
│       ├── package.json
│       └── tsconfig.json
├── package.json          # Root workspace config
├── pnpm-workspace.yaml   # pnpm workspaces definition
├── tsconfig.base.json    # Shared TypeScript configuration
└── turbo.json           # Turbo build orchestration
```

## Technology Stack

**Backend:**
- Express.js - Web framework
- MongoDB - Database
- TypeScript - Type safety
- Zod - Schema validation
- Pino - Logging (optional upgrade from logger.ts)

**Frontend:**
- React - UI framework
- TypeScript - Type safety
- React Router - Client-side routing
- React Query - Data fetching & caching
- Tailwind CSS - Styling
- shadcn/ui - Component library

**Development & Testing:**
- Vitest - Unit & integration testing
- pnpm - Package manager
- Turbo - Build orchestration

## Core Patterns

### Backend Architecture

**Service Layer Pattern:**
- Routes handle HTTP concerns (request/response)
- Services contain business logic (CRUD operations)
- Database operations are isolated in services
- Consistent error handling via custom error classes

**Middleware Stack:**
1. Body parsing (JSON/URL-encoded)
2. CORS handling
3. Security headers
4. Rate limiting
5. Request logging
6. Error handling

**Error Handling:**
- Custom error classes (AppError, NotFoundError, etc.)
- Centralized error middleware formats responses
- All errors logged with context
- Graceful degradation on failures

### Frontend Architecture

**API Client Pattern:**
- Centralized ApiClient singleton for all HTTP calls
- Type-safe request/response handling
- Built-in timeout and error handling
- Request/response formatting

**React Query Hooks:**
- Generic hooks (useApiQuery, useApiMutation, etc.)
- Domain-specific hooks (useStaffList, useCreateStaff, etc.)
- Automatic cache management
- Optimistic updates support

### Shared Types

Located in `packages/shared/src/index.ts`:
- API response envelopes (ApiResponse<T>, ApiErrorResponse)
- Entity types (Staff, Client, etc.)
- Request/mutation input types
- Status enums and constants

## Data Flow

```
Frontend Request
    ↓
Vite Dev Server (proxies /api to backend)
    ↓
Express App (backend)
    ↓
Security Middleware (CORS, rate limit, headers)
    ↓
Route Handler (validates request)
    ↓
Service Layer (executes business logic)
    ↓
MongoDB (persists data)
    ↓
Response sent back to frontend
    ↓
React Query caches data
    ↓
UI updates with new data
```

## Development Workflow

1. **Run monorepo in development:**
   ```bash
   pnpm install  # Install all dependencies
   pnpm dev      # Start backend + frontend
   ```

2. **Frontend** runs on `http://localhost:3000`
3. **Backend** runs on `http://localhost:5000`
4. **API** requests are proxied through Vite

## Key Files to Know

- `packages/backend/src/index.ts` - Express app setup
- `packages/backend/src/services/*.ts` - Business logic
- `packages/backend/src/routes/*.ts` - API endpoints
- `packages/backend/src/middleware/*.ts` - Request handling
- `packages/backend/src/utils/*.ts` - Logging, validation, errors
- `frontend/src/hooks/*.ts` - Data fetching hooks
- `frontend/src/lib/api-client.ts` - HTTP client
- `packages/shared/src/index.ts` - Shared types

## Best Practices Applied

- TypeScript strict mode everywhere
- Comprehensive error handling
- Structured logging throughout
- Input validation (Zod)
- Service layer separation of concerns
- Type-safe API communication
- React Query for state management
- Unit and integration tests
- Security headers and rate limiting
- Graceful shutdown handling
- Request/response middleware pipeline
