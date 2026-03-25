# Carter's Care Platform - Full-Stack TypeScript Monorepo

A professional care worker management platform built with a modern full-stack JavaScript/TypeScript architecture.

## Project Structure

```
carter-s-care-platform/
├── packages/
│   ├── frontend/          # React 18 + TypeScript + Vite
│   ├── backend/           # Express.js + TypeScript + MongoDB
│   └── shared/            # Shared TypeScript type definitions
├── package.json           # Root workspace configuration
├── pnpm-workspace.yaml    # pnpm monorepo setup
└── tsconfig.base.json     # Shared TypeScript configuration
```

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm 8+
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment files
cp packages/backend/.env.example packages/backend/.env
cp frontend/.env.example frontend/.env
```

### Configuration

Update the environment files with your configuration:

**`packages/backend/.env`:**
```env
PORT=5000
NODE_ENV=development
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/
DB_NAME=carter_s_care
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
LOG_LEVEL=info
```

**`frontend/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Development

Start both frontend and backend with a single command:

```bash
# Run both services in parallel
pnpm dev

# Or run individually
pnpm backend    # Start backend on port 5000
pnpm frontend   # Start frontend on port 3000
```

The frontend will automatically proxy API requests to `http://localhost:5000/api`.

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm -F frontend build
pnpm -F backend build
```

## API Endpoints

### Status Checks
- `POST /api/status` - Create status check
- `GET /api/status` - Get all status checks
- `GET /api/status/:id` - Get specific status check

### Staff
- `POST /api/staff` - Create staff member
- `GET /api/staff` - Get all staff
- `GET /api/staff/:id` - Get specific staff member
- `PATCH /api/staff/:id` - Update staff member

### Clients
- `POST /api/clients` - Create client
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get specific client
- `PATCH /api/clients/:id` - Update client

## Shared Types

The `@shared/types` package provides TypeScript interfaces for type-safe API communication:

```typescript
import { 
  StatusCheck, 
  Staff, 
  Client,
  ApiResponse,
  createSuccessResponse,
  createErrorResponse 
} from '@shared/types';
```

## Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **State Management**: TanStack Query (React Query)
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS
- **Routing**: React Router 6

### Backend
- **Framework**: Express.js 4
- **Language**: TypeScript 5
- **Database**: MongoDB with native driver
- **Validation**: Zod for runtime validation
- **Error Handling**: Centralized error middleware with custom AppError class

### Shared
- **Purpose**: Centralized TypeScript type definitions
- **Exports**: API contracts, request/response types, domain models, error handling utilities

## Development Workflow

### Adding Dependencies

```bash
# Add to a specific package
pnpm -F frontend add lodash
pnpm -F backend add express-validator

# Add to root (workspace)
pnpm -W -D typescript@latest
```

### Running Tests

```bash
pnpm test              # Run all tests
pnpm test:watch       # Watch mode
```

### Linting

```bash
pnpm lint             # Lint all packages
pnpm -F frontend lint # Lint specific package
```

## Performance Optimizations

- **Code Splitting**: Automatic with Vite
- **TypeScript**: Strict mode enabled for type safety
- **Database**: MongoDB connection pooling
- **CORS**: Configured for development with proxy support
- **Hot Module Replacement**: Built-in with Vite

## Deployment

### Backend
```bash
# Build
pnpm -F backend build

# Start production server
pnpm -F backend start
```

### Frontend
```bash
# Build
pnpm -F frontend build

# Preview (production build)
pnpm -F frontend preview
```

## Environment Variables

### Backend
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production/test)
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `CORS_ORIGINS` - Comma-separated allowed origins
- `LOG_LEVEL` - Log level (debug/info/warn/error)

### Frontend
- `VITE_API_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Contributing

1. Create a feature branch
2. Make changes across packages as needed
3. Run `pnpm lint` and `pnpm test`
4. Commit with meaningful messages
5. Push and create a pull request

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti :5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti :3000 | xargs kill -9
```

### MongoDB Connection Issues
- Verify MongoDB is running
- Check connection string in `.env`
- Ensure IP whitelist includes your machine (MongoDB Atlas)

### Package Resolution Issues
```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

## License

Proprietary - Carter's Care Platform

## Support

For issues or questions, contact the development team.
