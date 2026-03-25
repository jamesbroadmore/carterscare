# Testing Guide

## Overview

The monorepo includes comprehensive unit, integration, and end-to-end tests. All tests use **Vitest** as the test runner.

## Backend Testing

### Unit Tests

Located in `packages/backend/src/__tests__/`

**Staff Service Tests** (`staff.service.test.ts`):
- Tests CRUD operations in isolation
- Mocks database layer
- Validates error handling
- Tests pagination logic

```bash
pnpm test:backend  # Run all backend tests
pnpm test:backend -- --watch  # Watch mode
```

### Integration Tests

**Staff Routes Tests** (`staff.routes.test.ts`):
- Tests full HTTP request/response cycle
- Uses supertest for HTTP assertions
- Validates middleware pipeline
- Tests error responses

**Example:**
```typescript
await request(app)
  .get('/api/staff')
  .query({ page: 1, limit: 10 })
  .expect(200)
  .expect((res) => {
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });
```

## Frontend Testing

Located in `frontend/src/__tests__/`

### React Hooks Tests

**useStaff Hooks** (`hooks.test.ts`):
- Tests React Query integration
- Tests data fetching lifecycle
- Tests error handling
- Tests mutation operations

**Setup:**
```typescript
const wrapper = ({ children }) => (
  <QueryClientProvider client={testQueryClient}>
    {children}
  </QueryClientProvider>
);

const { result } = renderHook(() => useStaffList(), { wrapper });
```

## Running Tests

### All Tests
```bash
pnpm test  # Run all tests across monorepo
```

### Backend Only
```bash
pnpm test:backend
```

### Frontend Only
```bash
pnpm test:frontend
```

### Watch Mode
```bash
pnpm test --watch
```

### Coverage Report
```bash
pnpm test --coverage
```

## Test File Naming

- **Unit tests:** `*.test.ts`
- **Integration tests:** `*.integration.test.ts`
- **E2E tests:** `*.e2e.test.ts`

## Mocking

### Backend Mocking
- Use Vitest's `vi` for mocking functions
- Mock database calls in unit tests
- Use test database for integration tests

### Frontend Mocking
- Mock API responses with `vi.mock()`
- Use React Testing Library for component testing
- Mock fetch with MSW for realistic scenarios

## Test Configuration

### Vitest Config

Backend (`packages/backend/vitest.config.ts`):
```typescript
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
});
```

Frontend (`frontend/vitest.config.ts`):
```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

## Writing New Tests

### Backend Service Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { staffService } from '@/services/index.js';

describe('Staff Service', () => {
  it('should create staff member', async () => {
    const staff = await staffService.createStaff({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    expect(staff.id).toBeDefined();
  });
});
```

### Frontend Hook Test Example
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useStaffList } from '@/hooks/useStaff.js';

it('should fetch staff list', async () => {
  const { result } = renderHook(() => useStaffList());

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.data).toBeDefined();
});
```

## CI/CD Integration

Add to GitHub Actions (`.github/workflows/test.yml`):
```yaml
- name: Run Tests
  run: pnpm test

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

## Test Coverage Goals

- **Backend:** 80% coverage for services
- **Frontend:** 70% coverage for hooks
- **Critical paths:** 100% coverage

## Best Practices

1. **One assertion per test** - Easier to debug failures
2. **Descriptive names** - Tests should document behavior
3. **AAA Pattern** - Arrange, Act, Assert
4. **Mock external calls** - Don't hit real API/database in tests
5. **Test error cases** - Not just happy path
6. **Keep tests fast** - Use test database, not production
7. **Clean up after tests** - Clear mocks and state
