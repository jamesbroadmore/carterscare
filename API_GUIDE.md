# API Documentation

## Base URL

- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-domain.com/api`

## Response Format

All API responses follow a consistent envelope format:

### Success Response
```json
{
  "success": true,
  "data": { /* resource data */ },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation failed",
    "details": [
      {
        "path": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid auth
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Pagination

Paginated endpoints support:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Example: `GET /staff?page=2&limit=10`

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Headers:**
  - `X-RateLimit-Limit` - Maximum requests
  - `X-RateLimit-Remaining` - Requests remaining
  - `X-RateLimit-Reset` - Unix timestamp of reset time

## Staff Endpoints

### List Staff
```
GET /staff?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "555-0100",
      "preferredName": "Johnny",
      "abn": "ABN123456789",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### Get Staff by ID
```
GET /staff/:id
```

### Create Staff
```
POST /staff
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "555-0101",
  "preferredName": "Jane",
  "abn": "ABN987654321"
}
```

**Validation:**
- `firstName` - Required, 1-100 characters
- `lastName` - Required, 1-100 characters
- `email` - Required, valid email format
- `phone` - Optional
- `preferredName` - Optional
- `abn` - Optional

### Update Staff
```
PATCH /staff/:id
```

**Request Body:**
```json
{
  "firstName": "Janet",
  "phone": "555-0102"
}
```

All fields are optional. Send only the fields to update.

### Delete Staff
```
DELETE /staff/:id
```

**Response:**
```json
{
  "success": true,
  "data": null
}
```

## Client Endpoints

### List Clients
```
GET /clients?page=1&limit=20
```

### Get Client by ID
```
GET /clients/:id
```

### Create Client
```
POST /clients
```

**Request Body:**
```json
{
  "firstName": "Bob",
  "lastName": "Johnson",
  "dateOfBirth": "1980-01-15T00:00:00Z",
  "address": "123 Main St, City, State 12345",
  "phone": "555-0103",
  "emergencyContact": "Alice Johnson"
}
```

**Validation:**
- `firstName` - Required, 1-100 characters
- `lastName` - Required, 1-100 characters
- `dateOfBirth` - Optional, ISO 8601 datetime
- `address` - Optional
- `phone` - Optional
- `emergencyContact` - Optional

### Update Client
```
PATCH /clients/:id
```

### Delete Client
```
DELETE /clients/:id
```

## Error Handling

### Validation Error
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation failed",
    "details": [
      {
        "path": "firstName",
        "message": "First name required"
      },
      {
        "path": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Not Found Error
```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "message": "Staff member not found"
  }
}
```

### Database Error
```json
{
  "success": false,
  "error": {
    "statusCode": 500,
    "message": "Database operation failed"
  }
}
```

## Request Headers

- `Content-Type: application/json` - Required for POST/PATCH requests
- `Authorization: Bearer <token>` - For authenticated endpoints (future)

## CORS

Cross-Origin Resource Sharing is enabled for:
- **Origin:** Configured in `CORS_ORIGIN` environment variable
- **Methods:** GET, POST, PATCH, DELETE, PUT, OPTIONS
- **Credentials:** Allowed
- **Max Age:** 24 hours

## Rate Limit Headers Example

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705315800
```

## Examples

### cURL Examples

**Get all staff:**
```bash
curl -X GET http://localhost:5000/api/staff
```

**Create staff:**
```bash
curl -X POST http://localhost:5000/api/staff \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }'
```

**Update staff:**
```bash
curl -X PATCH http://localhost:5000/api/staff/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"phone": "555-0100"}'
```

### JavaScript/Fetch Examples

**Using the provided API client:**
```typescript
import apiClient from '@/lib/api-client.js';

// List staff
const response = await apiClient.get('/staff?page=1&limit=20');

// Create staff
const newStaff = await apiClient.post('/staff', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
});

// Update staff
const updated = await apiClient.patch('/staff/:id', {
  phone: '555-0100',
});

// Delete staff
await apiClient.delete('/staff/:id');
```

## Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5
}
```
