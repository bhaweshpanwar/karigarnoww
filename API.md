# KarigarNow API Documentation

Base URL: `http://localhost:8080/api`

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Description of what happened",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "fieldName": "Error message"
  }
}
```

---

## Authentication

All protected endpoints require:
```
Header: Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Health Check

**GET** `/api/test`

Check if API is running.

**Auth:** No

**Response:**
```json
{
  "success": true,
  "message": "KarigarNow API is running",
  "data": null
}
```

---

### 2. Register User

**POST** `/api/auth/register`

Register a new consumer or thekedar.

**Auth:** No

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "password": "password123",
  "mobile": "+919876543210",
  "role": "consumer"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name (not blank) |
| email | string | Yes | Valid email format |
| password | string | Yes | Password (not blank) |
| mobile | string | No | Mobile number |
| role | string | Yes | Must be `consumer` or `thekedar` |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "id": "1d3e4bb3-2ee5-44bd-9ecf-efdc4e5dac41",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "role": "consumer"
  }
}
```

**Error (409 Conflict - Email exists):**
```json
{
  "success": false,
  "message": "Email already registered",
  "data": null
}
```

**Error (400 Bad Request - Validation):**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Invalid email format",
    "role": "Role must be 'consumer' or 'thekedar'"
  }
}
```

---

### 3. Login

**POST** `/api/auth/login`

Login with email and password.

**Auth:** No

**Request Body:**
```json
{
  "email": "rajesh@example.com",
  "password": "password123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Password (not blank) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "id": "1d3e4bb3-2ee5-44bd-9ecf-efdc4e5dac41",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "role": "consumer"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null
}
```

---

### 4. Google Auth

**POST** `/api/auth/google`

Authenticate using Google OAuth token.

**Auth:** No

**Request Body:**
```json
{
  "googleToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "consumer"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| googleToken | string | Yes | Google OAuth ID token |
| role | string | Yes | Must be `consumer` or `thekedar` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "id": "2f4a5b6c-3de6-45cf-8abc-def012345678",
    "name": "Google User",
    "email": "user@gmail.com",
    "role": "consumer"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid Google token",
  "data": null
}
```

---

## Consumer Services

### 5. List Services

**GET** `/api/services`

Returns all active service categories available for booking.

**Auth:** No

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Services fetched successfully",
  "data": [
    {
      "id": "uuid",
      "slug": "plumbing",
      "name": "Plumbing",
      "description": "Pipe fitting, leakage repair, tap, drain cleaning"
    }
  ]
}
```

---

### 6. Get Service by Slug

**GET** `/api/services/{slug}`

Returns service details with a paginated list of online thekedars offering this service.

**Auth:** No

**Path Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| slug | string | Service slug (e.g. `plumbing`, `electrical`) |

**Query Parameters:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| search | string | — | Search by thekedar name or location |
| page | int | 0 | Page number (0-indexed) |
| size | int | 10 | Page size |
| sort | string | `rating` | Sort by `rating` or `price` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Service fetched successfully",
  "data": {
    "service": {
      "id": "uuid",
      "slug": "plumbing",
      "name": "Plumbing",
      "description": "Pipe fitting, leakage repair, tap, drain cleaning"
    },
    "thekedars": {
      "content": [
        {
          "id": "uuid",
          "name": "Ramesh Plumber",
          "photo": "https://...",
          "rating_average": 4.50,
          "custom_rate": 500.00,
          "experience": "10 years",
          "total_jobs": 120,
          "location": "Sector 15, Noida",
          "is_online": true
        }
      ],
      "totalPages": 2,
      "totalElements": 14,
      "currentPage": 0
    }
  }
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Service not found",
  "data": null
}
```

---

### 7. Get Thekedar Profile

**GET** `/api/thekedars/{id}`

Returns the full profile of a thekedar including services offered and recent reviews.

**Auth:** No

**Path Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Thekedar ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Thekedar profile fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Ramesh Plumber",
    "photo": "https://...",
    "bio": "Expert plumber with 10 years of experience",
    "experience": "10 years",
    "rating_average": 4.50,
    "total_jobs": 120,
    "location": "Sector 15, Noida",
    "services": [
      {
        "id": "uuid",
        "slug": "plumbing",
        "name": "Plumbing",
        "custom_rate": 500.00
      }
    ],
    "reviews": [
      {
        "id": "uuid",
        "consumer_name": "Amit S.",
        "rating": 5,
        "comment": "Excellent work, very professional",
        "created_at": "2026-03-15T10:30:00"
      }
    ]
  }
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Thekedar not found",
  "data": null
}
```

---

## Booking Module

### 8. Create Booking

**POST** `/api/bookings`

Create a new service booking.

**Auth:** Yes — Consumer only

**Request Body:**
```json
{
  "thekedar_id": "uuid",
  "service_id": "uuid",
  "address_id": "uuid",
  "workers_needed": 2,
  "job_description": "Need 2 painters for hall",
  "scheduled_at": "2025-06-15T10:00:00"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| thekedar_id | UUID | Yes | Thekedar ID |
| service_id | UUID | Yes | Service ID |
| address_id | UUID | Yes | Consumer's address ID |
| workers_needed | int | Yes | Number of workers (min 1) |
| job_description | string | Yes | Description of job |
| scheduled_at | datetime | No | Preferred schedule time |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "uuid",
    "service": { "id": "uuid", "slug": "painting", "name": "Wall Painting" },
    "consumer_name": "Amit S.",
    "thekedar_name": "Ramesh Painter",
    "workers_needed": 2,
    "address": { "id": "uuid", "address_line1": "...", "city": "Indore", "state": "MP", "postal_code": "452001" },
    "job_description": "Need 2 painters for hall",
    "scheduled_at": "2025-06-15T10:00:00",
    "otp": "4821",
    "otp_verified": false,
    "booking_status": "pending",
    "payment_status": "held",
    "total_amount": 1200.00,
    "platform_fee": 132.00,
    "thekedar_payout": 1068.00,
    "assigned_workers": null,
    "created_at": "2026-04-02T10:00:00"
  }
}
```

**Errors:**
- `400` — Thekedar does not offer requested service
- `403` — Only consumers can create bookings
- `404` — Thekedar or address not found

---

### 9. List Bookings

**GET** `/api/bookings`

Returns bookings for the authenticated user. Consumers see their bookings, thekedars see assigned bookings.

**Auth:** Yes — Consumer or Thekedar

**Query Parameters:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | — | Filter by booking_status |
| page | int | 0 | Page number (0-indexed) |
| size | int | 10 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bookings fetched successfully",
  "data": {
    "content": [
      {
        "id": "uuid",
        "service_name": "Plumbing",
        "thekedar_name": "Ramesh Plumber",
        "consumer_name": "Amit S.",
        "booking_status": "pending",
        "payment_status": "held",
        "total_amount": 500.00,
        "scheduled_at": "2025-06-15T10:00:00",
        "created_at": "2026-04-02T10:00:00"
      }
    ],
    "totalPages": 1,
    "totalElements": 1,
    "currentPage": 0
  }
}
```

---

### 10. Get Booking Details

**GET** `/api/bookings/{id}`

Returns full booking details. Consumers see their own bookings, thekedars see assigned bookings.

**Auth:** Yes — Consumer or Thekedar

**Path Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Booking ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking fetched successfully",
  "data": {
    "id": "uuid",
    "service": { "id": "uuid", "slug": "plumbing", "name": "Plumbing" },
    "consumer_name": "Amit S.",
    "thekedar_name": "Ramesh Plumber",
    "workers_needed": 1,
    "address": { "id": "uuid", "address_line1": "123 Main St", "city": "Indore", "state": "MP", "postal_code": "452001" },
    "job_description": "Tap repair",
    "scheduled_at": "2025-06-15T10:00:00",
    "otp": null,
    "otp_verified": false,
    "booking_status": "dispatched",
    "payment_status": "held",
    "total_amount": 500.00,
    "platform_fee": 55.00,
    "thekedar_payout": 445.00,
    "assigned_workers": [
      {
        "id": "uuid",
        "name": "Worker Name",
        "mobile": "+919876543210",
        "skills": "plumbing",
        "daily_rate": 250.00,
        "assigned_at": "2026-04-02T12:00:00"
      }
    ],
    "created_at": "2026-04-02T10:00:00"
  }
}
```

**Errors:**
- `403` — Not authorized to view this booking
- `404` — Booking not found

---

### 11. Accept Booking

**PUT** `/api/bookings/{id}/accept`

Thekedar accepts a pending booking and generates OTP.

**Auth:** Yes — Thekedar only

**Path Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Booking ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking accepted successfully",
  "data": {
    "id": "uuid",
    "service": { "id": "uuid", "slug": "plumbing", "name": "Plumbing" },
    "consumer_name": "Amit S.",
    "thekedar_name": "Ramesh Plumber",
    "workers_needed": 1,
    "address": { ... },
    "job_description": "Tap repair",
    "scheduled_at": "2025-06-15T10:00:00",
    "otp": "4821",
    "otp_verified": false,
    "booking_status": "accepted",
    "payment_status": "held",
    "total_amount": 500.00,
    "platform_fee": 55.00,
    "thekedar_payout": 445.00,
    "assigned_workers": null,
    "created_at": "2026-04-02T10:00:00"
  }
}
```

**Errors:**
- `400` — Booking cannot be accepted (not in pending status)
- `403` — Only thekedar assigned to this booking can accept
- `404` — Booking not found

---

### 12. Reject Booking

**PUT** `/api/bookings/{id}/reject`

Thekedar rejects a pending booking. Payment is refunded.

**Auth:** Yes — Thekedar only

**Path Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Booking ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking rejected successfully",
  "data": {
    "id": "uuid",
    "booking_status": "cancelled",
    "payment_status": "refunded",
    ...
  }
}
```

**Errors:**
- `400` — Booking cannot be rejected (not in pending status)
- `403` — Only thekedar assigned to this booking can reject
- `404` — Booking not found

---

### 13. Dispatch Workers

**PUT** `/api/bookings/{id}/dispatch`

Thekedar dispatches workers to the job site.

**Auth:** Yes — Thekedar only

**Path Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Booking ID |

**Request Body:**
```json
{
  "worker_ids": ["uuid1", "uuid2"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Workers dispatched successfully",
  "data": {
    "id": "uuid",
    "booking_status": "dispatched",
    "assigned_workers": [
      {
        "id": "uuid",
        "name": "Worker 1",
        "mobile": "+919876543210",
        "skills": "plumbing",
        "daily_rate": 250.00,
        "assigned_at": "2026-04-02T12:00:00"
      }
    ],
    ...
  }
}
```

**Errors:**
- `400` — Worker count mismatch, or worker does not belong to thekedar
- `400` — Booking cannot be dispatched (not in accepted status)
- `403` — Only thekedar assigned to this booking can dispatch
- `404` — Booking not found

---

### 14. Verify OTP

**POST** `/api/bookings/{id}/verify-otp`

Consumer verifies the OTP when workers arrive at the site. Moves booking to in_progress.

**Auth:** Yes — Consumer only

**Path Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Booking ID |

**Request Body:**
```json
{
  "otp": "4821"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "id": "uuid",
    "otp_verified": true,
    "booking_status": "in_progress",
    ...
  }
}
```

**Errors:**
- `400` — Invalid OTP
- `400` — OTP can only be verified when booking is dispatched
- `403` — Only the consumer of this booking can verify OTP
- `404` — Booking not found

---

### 15. Complete Booking

**PUT** `/api/bookings/{id}/complete`

Consumer marks the job as complete after work is done. Payment is released to thekedar.

**Auth:** Yes — Consumer only

**Path Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Booking ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking completed successfully",
  "data": {
    "id": "uuid",
    "booking_status": "completed",
    "payment_status": "released",
    ...
  }
}
```

**Side effects:**
- Earnings record created for thekedar
- Thekedar total_jobs incremented by 1

**Errors:**
- `400` — Booking cannot be completed (not in in_progress status)
- `403` — Only the consumer of this booking can complete
- `404` — Booking not found

---

### 16. Cancel Booking

**PUT** `/api/bookings/{id}/cancel`

Cancel a booking. Only allowed from pending or accepted status.

**Auth:** Yes — Consumer or Thekedar

**Path Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Booking ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": "uuid",
    "booking_status": "cancelled",
    "payment_status": "refunded",
    ...
  }
}
```

**Errors:**
- `400` — Booking cannot be cancelled at current status
- `403` — Not authorized to cancel this booking
- `404` — Booking not found

---

## Future Endpoints (To Be Implemented)

### Auth Module
- [ ] `POST /api/auth/logout` - Invalidate token
- [ ] `POST /api/auth/refresh` - Refresh token
- [ ] `POST /api/auth/forgot-password` - Send reset email
- [ ] `POST /api/auth/reset-password` - Reset password with token

### User Module
- [ ] `GET /api/users/me` - Get current user profile
- [ ] `PUT /api/users/me` - Update current user profile
- [ ] `PUT /api/users/me/password` - Change password

### Address Module
- [ ] `GET /api/addresses` - List user addresses
- [ ] `POST /api/addresses` - Add new address
- [ ] `PUT /api/addresses/{id}` - Update address
- [ ] `DELETE /api/addresses/{id}` - Delete address

### Thekedar Module
- [ ] `GET /api/thekedars` - List all thekedars (with filters)
- [ ] `GET /api/thekedars/{id}` - Get thekedar profile
- [ ] `PUT /api/thekedars/profile` - Update thekedar profile (bio, skills, rate)

### Booking Module ✅ (Implemented in Section 8-16 above)

### Worker Module
- [ ] `GET /api/workers` - List workers (thekedar's team)
- [ ] `POST /api/workers` - Add worker to team
- [ ] `PUT /api/workers/{id}` - Update worker
- [ ] `DELETE /api/workers/{id}` - Remove worker

### Review Module
- [ ] `POST /api/reviews` - Create review (consumer)
- [ ] `GET /api/reviews/thekedar/{id}` - Get reviews for thekedar

### Payment Module (Future)
- [ ] `POST /api/payments/initiate` - Initiate payment
- [ ] `GET /api/payments/{id}` - Get payment status

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., email already exists) |
| 500 | Internal Server Error |
