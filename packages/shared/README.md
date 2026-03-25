# Shared Types Package

Centralized TypeScript type definitions for the Carter's Care platform.

## Usage

Import types from `@shared/types`:

```typescript
import {
  StatusCheck,
  Staff,
  Client,
  Timesheet,
  Invoice,
  ApiResponse,
  createSuccessResponse,
  createErrorResponse,
  AppError,
  ErrorCodes,
} from '@shared/types';
```

## Available Types

### API Response Types
- `ApiResponse<T>` - Generic API response wrapper
- `PaginatedResponse<T>` - Paginated list response
- `createSuccessResponse(data)` - Create success response
- `createErrorResponse(code, message, details)` - Create error response

### Domain Types
- `StatusCheck` - Status check record
- `Staff` - Staff member record
- `Client` - Client/recipient record
- `Timesheet` - Timesheet entry
- `Invoice` - Invoice record

### Request Types
- `CreateStatusCheckRequest` - Create status check payload
- `CreateStaffRequest` - Create staff member payload
- `CreateClientRequest` - Create client payload
- `CreateTimesheetRequest` - Create timesheet payload
- `CreateInvoiceRequest` - Create invoice payload

### Error Types
- `AppError` - Custom error class with code, message, status code
- `ErrorCodes` - Enum of standard error codes

## Example Usage

### Frontend
```typescript
import { StatusCheck, ApiResponse } from '@shared/types';

async function fetchStatusChecks(): Promise<StatusCheck[]> {
  const response = await fetch('/api/status');
  const data: ApiResponse<StatusCheck[]> = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message);
  }
  
  return data.data || [];
}
```

### Backend
```typescript
import { 
  StatusCheck, 
  createSuccessResponse, 
  AppError, 
  ErrorCodes 
} from '@shared/types';

router.get('/', async (req: Request, res: Response) => {
  try {
    const checks = await db.collection('status_checks').find({}).toArray();
    res.json(createSuccessResponse(checks));
  } catch (error) {
    throw new AppError(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch status checks',
      500
    );
  }
});
```

## Type Safety

All types are fully exported from this package. Using these types ensures:

- Type-safe API contracts
- Consistent request/response shapes
- Automatic validation in IDEs
- Better error messages at compile time

## Adding New Types

When adding new domain models:

1. Define the entity interface (e.g., `NewEntity`)
2. Define the create request interface (e.g., `CreateNewEntityRequest`)
3. Add helper functions if needed
4. Export from `src/index.ts`

Example:
```typescript
export interface NewEntity {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewEntityRequest {
  name: string;
}
```

## Building

```bash
pnpm -F @shared/types build
```

Output goes to `dist/` directory.

## Publishing

This is a private workspace package. To use in other packages:

```json
{
  "dependencies": {
    "@shared/types": "*"
  }
}
```

The `*` version reference ensures you always use the local workspace version.
