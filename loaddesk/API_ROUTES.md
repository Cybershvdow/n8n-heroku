# LoadDesk API Routes

## Overview

All API routes are RESTful and return JSON. Protected routes require authentication via secure httpOnly cookies.

---

## Authentication

### Rate Limits
- `/api/auth/*`: 5 requests per minute per IP (login/register)
- `/api/auth/request-password-reset`: 3 requests per hour per email

### Endpoints

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| POST | `/api/auth/register` | Create new account + org | No | 5/min |
| POST | `/api/auth/login` | Authenticate user | No | 5/min |
| POST | `/api/auth/logout` | End session | Yes | - |
| GET | `/api/auth/me` | Get current user | Yes | - |
| POST | `/api/auth/request-password-reset` | Request reset email | No | 3/hr |
| POST | `/api/auth/reset-password` | Reset with token | No | 5/min |

### Request/Response Examples

#### POST /api/auth/register
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "organizationName": "My Trucking Co"
}

// Response 201
{
  "user": {
    "id": "cuid...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "organization": {
    "id": "cuid...",
    "name": "My Trucking Co",
    "mode": "PERSONAL"
  }
}
```

#### POST /api/auth/login
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

// Response 200
{
  "user": {
    "id": "cuid...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
// Sets httpOnly cookie: loaddesk_session
```

---

## Loads

### Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/loads` | List loads with filters | Yes | All |
| GET | `/api/loads/:id` | Get load details | Yes | All |
| POST | `/api/loads/:id/decide` | Accept/deny load | Yes | Owner, Dispatcher |

### Query Parameters for GET /api/loads

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by: PENDING, ACCEPTED, DENIED |
| `source` | string | Filter by: EMAIL, CALL, MANUAL |
| `dateFrom` | ISO date | Created after |
| `dateTo` | ISO date | Created before |
| `broker` | string | Search broker/carrier name |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |

### Request/Response Examples

#### GET /api/loads
```json
// Response 200
{
  "loads": [
    {
      "id": "cuid...",
      "source": "EMAIL",
      "status": "PENDING",
      "brokerCarrierName": "ABC Logistics",
      "pickupLocation": "Los Angeles, CA",
      "pickupDateTime": "2024-01-15T08:00:00Z",
      "dropoffLocation": "Phoenix, AZ",
      "dropoffDateTime": "2024-01-15T16:00:00Z",
      "rate": 2500.00,
      "commodity": "Electronics",
      "referenceNumber": "REF-123456",
      "aiSummary": "• 500 mile haul from LA to Phoenix\n• Electronics shipment\n• Same-day delivery required",
      "confidenceScore": 0.92,
      "missingFields": ["weight"],
      "createdAt": "2024-01-14T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### POST /api/loads/:id/decide
```json
// Request
{
  "decision": "ACCEPTED", // or "DENIED"
  "reason": "Good rate for the lane" // optional
}

// Response 200
{
  "load": {
    "id": "cuid...",
    "status": "ACCEPTED"
  },
  "decision": {
    "id": "cuid...",
    "decision": "ACCEPTED",
    "decidedBy": { "id": "...", "name": "John Doe" },
    "createdAt": "2024-01-14T11:00:00Z"
  },
  "replyStatus": "SENT" // or "QUEUED", "FAILED", "FALLBACK_COPY"
}
```

---

## Email Integrations

### Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/integrations/email` | List connected accounts | Yes | Owner |
| POST | `/api/integrations/email/connect` | Start OAuth flow | Yes | Owner |
| GET | `/api/integrations/email/callback` | OAuth callback | - | - |
| POST | `/api/integrations/email/disconnect` | Disconnect account | Yes | Owner |
| POST | `/api/integrations/email/sync` | Force sync | Yes | Owner |

### Request/Response Examples

#### POST /api/integrations/email/connect
```json
// Request
{
  "provider": "GMAIL" // or "O365"
}

// Response 200
{
  "authUrl": "https://accounts.google.com/o/oauth2/auth?..."
}
```

#### GET /api/integrations/email
```json
// Response 200
{
  "accounts": [
    {
      "id": "cuid...",
      "provider": "GMAIL",
      "emailAddress": "dispatch@company.com",
      "status": "ACTIVE",
      "lastSyncAt": "2024-01-14T10:00:00Z",
      "scopes": ["gmail.readonly", "gmail.send"]
    }
  ]
}
```

---

## Email Messages

### Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/emails` | List email messages | Yes | All |
| GET | `/api/emails/:id` | Get email details | Yes | All |

### Query Parameters for GET /api/emails

| Param | Type | Description |
|-------|------|-------------|
| `classification` | string | LOAD_REQUEST, NOT_LOAD, UNCERTAIN |
| `isProcessed` | boolean | Filter by processed status |
| `dateFrom` | ISO date | Received after |
| `dateTo` | ISO date | Received before |
| `search` | string | Search subject/from |

---

## GPS & Trips

### Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/drivers` | List drivers (Fleet mode) | Yes | Owner, Dispatcher |
| GET | `/api/drivers/:id` | Get driver details | Yes | Owner, Dispatcher, Self |
| PATCH | `/api/drivers/:id/consent` | Update GPS consent | Yes | Owner, Self |
| GET | `/api/trips` | List trips | Yes | All (scoped) |
| GET | `/api/trips/:id` | Get trip details | Yes | Owner, Dispatcher, Self |
| POST | `/api/trips/start` | Start new trip | Yes | Driver |
| POST | `/api/trips/:id/end` | End trip | Yes | Driver |
| POST | `/api/trips/:id/point` | Add route point | Yes | Driver |

### Request/Response Examples

#### POST /api/trips/start
```json
// Request
{
  "purpose": "Delivery to Phoenix",
  "notes": "Load #12345",
  "startLatitude": 34.0522,
  "startLongitude": -118.2437
}

// Response 201
{
  "trip": {
    "id": "cuid...",
    "status": "IN_PROGRESS",
    "startedAt": "2024-01-14T08:00:00Z",
    "purpose": "Delivery to Phoenix"
  }
}
```

#### POST /api/trips/:id/end
```json
// Request
{
  "endLatitude": 33.4484,
  "endLongitude": -112.0740,
  "notes": "Delivered on time"
}

// Response 200
{
  "trip": {
    "id": "cuid...",
    "status": "COMPLETED",
    "startedAt": "2024-01-14T08:00:00Z",
    "endedAt": "2024-01-14T14:30:00Z",
    "durationMinutes": 390,
    "totalMiles": 372.5
  }
}
```

---

## Exports

### Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/exports/loads.csv` | Export loads CSV | Yes | Owner, Dispatcher |
| GET | `/api/exports/mileage.csv` | Export mileage CSV | Yes | Owner |

### Query Parameters

#### /api/exports/loads.csv
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status |
| `dateFrom` | ISO date | Created after |
| `dateTo` | ISO date | Created before |

#### /api/exports/mileage.csv
| Param | Type | Description |
|-------|------|-------------|
| `driverId` | string | Filter by driver (Fleet mode) |
| `dateFrom` | ISO date | Trips after |
| `dateTo` | ISO date | Trips before |

### CSV Format - Mileage Export
```csv
driver_name,driver_email,date,start_time,end_time,duration_minutes,miles,purpose,notes
"John Doe","john@company.com","2024-01-14","08:00","14:30",390,372.5,"Delivery to Phoenix","Load #12345"
```

---

## Notifications

### Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/notifications` | List notifications | Yes | All |
| GET | `/api/notifications/unread-count` | Get unread count | Yes | All |
| POST | `/api/notifications/:id/read` | Mark as read | Yes | All |
| POST | `/api/notifications/read-all` | Mark all as read | Yes | All |

### Response Example

#### GET /api/notifications
```json
{
  "notifications": [
    {
      "id": "cuid...",
      "type": "LOAD_CREATED",
      "title": "New Load Request",
      "message": "Load from ABC Logistics: LA to Phoenix",
      "isRead": false,
      "createdAt": "2024-01-14T10:30:00Z",
      "data": {
        "loadId": "cuid..."
      }
    }
  ],
  "pagination": { ... }
}
```

---

## Organization & Settings

### Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/organization` | Get org details | Yes | All |
| PATCH | `/api/organization` | Update org settings | Yes | Owner |
| GET | `/api/organization/members` | List members | Yes | Owner |
| POST | `/api/organization/members/invite` | Invite member | Yes | Owner |
| PATCH | `/api/organization/members/:id/role` | Update role | Yes | Owner |
| DELETE | `/api/organization/members/:id` | Remove member | Yes | Owner |

### Request Examples

#### PATCH /api/organization
```json
// Request
{
  "name": "Updated Company Name",
  "mode": "FLEET" // Switch to fleet mode
}
```

#### POST /api/organization/members/invite
```json
// Request
{
  "email": "dispatcher@company.com",
  "role": "DISPATCHER",
  "name": "Jane Smith"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": { ... } // Optional additional context
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized for action |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `TENANT_MISMATCH` | 403 | Resource belongs to different org |

---

## Webhook Endpoints (Internal)

For email provider webhooks:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/gmail` | Gmail push notifications |
| POST | `/api/webhooks/o365` | Microsoft Graph notifications |

These endpoints verify provider signatures and are not publicly documented.
