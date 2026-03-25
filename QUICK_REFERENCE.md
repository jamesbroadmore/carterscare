# Quick Reference

## Commands

```bash
# Development
pnpm install      # Install all dependencies
pnpm dev         # Start both backend and frontend
pnpm dev:backend # Start just backend
pnpm dev:frontend # Start just frontend

# Testing
pnpm test        # Run all tests
pnpm test --watch # Watch mode

# Building
pnpm build       # Build for production
pnpm start       # Start production server

# Type checking
pnpm type-check  # Type check all packages

# Linting
pnpm lint        # Lint all files
pnpm lint:fix    # Fix linting issues
```

## Project URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API Base: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/health`

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
HOST=localhost
MONGODB_URI=mongodb://localhost:27017/carterscare
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Key Files

| File | Purpose |
|------|---------|
| `packages/backend/src/index.ts` | Express app setup |
| `packages/backend/src/services/*.ts` | Business logic |
| `packages/backend/src/routes/*.ts` | API endpoints |
| `packages/backend/src/utils/logger.ts` | Logging |
| `packages/backend/src/utils/validation.ts` | Input validation |
| `packages/backend/src/utils/error-handler.ts` | Error classes |
| `packages/backend/src/middleware/*.ts` | Request handling |
| `frontend/src/hooks/useApi.ts` | Generic API hooks |
| `frontend/src/hooks/useStaff.ts` | Staff-specific hooks |
| `frontend/src/lib/api-client.ts` | HTTP client |
| `packages/shared/src/index.ts` | Shared types |

## Common Tasks

### Add a New API Endpoint

1. Create service in `packages/backend/src/services/`
2. Add route in `packages/backend/src/routes/`
3. Add validation schemas in route
4. Add types to `packages/shared/src/index.ts`

### Add Frontend Data Fetching

1. Create hook in `frontend/src/hooks/`
2. Use `useApiQuery` or `useApiMutation`
3. Export from `frontend/src/hooks/index.ts`
4. Use hook in component

### Write Tests

**Backend:**
```typescript
import { describe, it, expect } from 'vitest';
import { staffService } from '@/services/index.js';

describe('Staff Service', () => {
  it('should fetch staff', async () => {
    const staff = await staffService.getAllStaff(0, 20);
    expect(Array.isArray(staff)).toBe(true);
  });
});
```

**Frontend:**
```typescript
import { renderHook } from '@testing-library/react';
import { useStaffList } from '@/hooks/useStaff.js';

it('should fetch staff list', async () => {
  const { result } = renderHook(() => useStaffList());
  expect(result.current).toBeDefined();
});
```

## Error Handling

### Backend Error
```typescript
import { NotFoundError } from '@/utils/error-handler.js';

if (!staff) {
  throw new NotFoundError('Staff not found');
}
```

### Frontend Error
```typescript
try {
  await createStaff(data);
} catch (error) {
  // Error toast shown automatically
  console.error(error);
}
```

## API Client Usage

```typescript
import apiClient from '@/lib/api-client.js';

// GET request
const data = await apiClient.get('/staff');

// POST request
const created = await apiClient.post('/staff', staffData);

// PATCH request
const updated = await apiClient.patch('/staff/:id', updates);

// DELETE request
await apiClient.delete('/staff/:id');
```

## React Query Hooks

```typescript
import { useStaffList, useCreateStaff, useUpdateStaff, useDeleteStaff } from '@/hooks';

// Fetch data
const { data, isLoading, error } = useStaffList(1, 20);

// Create mutation
const { mutate, isPending } = useCreateStaff();
mutate({ firstName: 'John', lastName: 'Doe', email: 'john@example.com' });

// Update mutation
const { mutate: updateStaff } = useUpdateStaff(id);
updateStaff({ firstName: 'Jane' });

// Delete mutation
const { mutate: deleteStaff } = useDeleteStaff(id);
deleteStaff();
```

## Debugging

### Backend Logs
```typescript
import { logger } from '@/utils/logger.js';

logger.info('Message', { context: 'data' });
logger.error('Error', { context: 'data' }, error);
logger.warn('Warning', { context: 'data' });
logger.debug('Debug', { context: 'data' }); // Dev only
```

### Frontend Console
```typescript
console.log('[v0]', 'message'); // Use [v0] prefix for clarity
```

## MongoDB

### Connection
```typescript
import { connectDatabase } from '@/config/database.js';
await connectDatabase();
```

### Collections
- `staff` - Staff members
- `clients` - Clients

### Query Example
```typescript
const collection = db.collection('staff');
const staff = await collection.findOne({ _id: new ObjectId(id) });
```

## Validation with Zod

```typescript
import { z } from 'zod';

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().email(),
  age: z.number().optional(),
});

const validated = schema.parse(data);
```

## Useful Links

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev/)
- [Vitest Documentation](https://vitest.dev/)
