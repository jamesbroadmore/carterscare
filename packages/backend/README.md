# Backend README

Express.js backend for Carter's Care platform with MongoDB integration.

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

Server runs on `http://localhost:5000`

## API Documentation

### Status Checks

#### Create Status Check
```bash
curl -X POST http://localhost:5000/api/status \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "John Doe",
    "staffName": "Jane Smith",
    "location": "Home",
    "notes": "First check-in"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "clientName": "John Doe",
    "staffName": "Jane Smith",
    "checkInTime": "2024-01-15T10:30:00.000Z",
    "status": "checked_in",
    "location": "Home",
    "notes": "First check-in",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

#### Get All Status Checks
```bash
curl http://localhost:5000/api/status
```

#### Get Specific Status Check
```bash
curl http://localhost:5000/api/status/{id}
```

### Staff Management

#### Create Staff
```bash
curl -X POST http://localhost:5000/api/staff \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "0412345678",
    "abn": "12345678901"
  }'
```

#### Get All Staff
```bash
curl http://localhost:5000/api/staff
```

#### Get Specific Staff
```bash
curl http://localhost:5000/api/staff/{id}
```

#### Update Staff
```bash
curl -X PATCH http://localhost:5000/api/staff/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0487654321"
  }'
```

### Client Management

#### Create Client
```bash
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-15",
    "address": "123 Main St",
    "phone": "0298765432",
    "emergencyContact": "Jane Doe"
  }'
```

#### Get All Clients
```bash
curl http://localhost:5000/api/clients
```

#### Get Specific Client
```bash
curl http://localhost:5000/api/clients/{id}
```

#### Update Client
```bash
curl -X PATCH http://localhost:5000/api/clients/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0287654321"
  }'
```

## Error Handling

All errors return a standardized format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "firstName and lastName are required",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

### Error Codes
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid request data
- `DUPLICATE_ENTRY` (409) - Duplicate entry in database
- `INTERNAL_ERROR` (500) - Server error
- `UNAUTHORIZED` (401) - Missing authentication
- `FORBIDDEN` (403) - Insufficient permissions

## Development

### Project Structure
```
src/
├── index.ts              # Express app setup
├── config/
│   ├── env.ts           # Environment variables
│   └── database.ts      # MongoDB connection
├── middleware/
│   └── error-handler.ts # Error handling middleware
├── routes/
│   ├── index.ts         # Route aggregator
│   ├── status.ts        # Status check routes
│   ├── staff.ts         # Staff routes
│   └── clients.ts       # Client routes
└── types/
    └── index.ts         # TypeScript types
```

### Adding New Routes

1. Create route file in `src/routes/`
2. Import and add to `src/routes/index.ts`
3. Add types to `@shared/types`

### Database Collections

- `status_checks` - Status check records
- `staff` - Staff member records
- `clients` - Client records

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch
```

## Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure MongoDB Atlas or hosted MongoDB
3. Set appropriate CORS origins
4. Update all environment variables

### Build
```bash
pnpm build
```

### Start
```bash
pnpm start
```

Server will run on the configured PORT (default: 5000)

## Performance Tips

- Keep MongoDB indexes optimized
- Use connection pooling (built-in)
- Implement request pagination for large datasets
- Add caching layer for frequently accessed data

## Contributing

- Follow TypeScript best practices
- Add proper error handling
- Document new endpoints
- Test before committing

## Support

For issues, check the main project README or contact the development team.
