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

### Booking Module
- [ ] `POST /api/bookings` - Create new booking (consumer)
- [ ] `GET /api/bookings` - List bookings (filtered by role)
- [ ] `GET /api/bookings/{id}` - Get booking details
- [ ] `PUT /api/bookings/{id}/accept` - Accept booking (thekedar)
- [ ] `PUT /api/bookings/{id}/reject` - Reject booking (thekedar)
- [ ] `PUT /api/bookings/{id}/dispatch` - Dispatch workers
- [ ] `POST /api/bookings/{id}/verify-otp` - Verify OTP (confirm arrival)
- [ ] `PUT /api/bookings/{id}/complete` - Mark job complete
- [ ] `PUT /api/bookings/{id}/cancel` - Cancel booking

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
