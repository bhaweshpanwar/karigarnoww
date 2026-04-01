# KarigarNow

KarigarNow is an Indian home labour booking platform.

Tagline: "Apna kaam, apna worker"

## What We Are Building

Customers book home repair services (plumbing, painting, electrical, carpentry, etc.) through the platform. A local Thekedar (contractor) accepts the job and dispatches workers from his team. Payment is held in escrow and released after job completion.

## Three Users

- **Consumer** - books a service via the website
- **Thekedar** - accepts jobs and manages his team of workers
- **Admin** - platform oversight (later phase)

## How It Works

1. Consumer selects a service, fills in address, and pays into escrow
2. Nearby thekedars get notified
3. Thekedar accepts and dispatches worker(s)
4. Workers arrive, consumer shares OTP to confirm arrival
5. Job is done, consumer marks complete, payment releases
6. Consumer rates the thekedar

## Tech Stack

- Backend: Java Spring Boot
- Database: PostgreSQL
- ORM: Spring Data JPA with Hibernate
- Authentication: JWT (Spring Security)
- Build tool: Maven
- Server runs on port 8080

## Database Tables

users, addresses, thekedars, workers, bookings, booking_workers, reviews, earnings

Full schema is available in schema.sql.

## Project Structure

```
com.karigarnow/
├── controller/     # REST API endpoints
├── service/        # Business logic
├── repository/     # Data access layer
├── model/          # JPA entities
├── dto/
│   ├── request/   # Incoming request DTOs
│   └── response/   # Outgoing response DTOs
├── exception/      # Custom exceptions and global handler
├── config/         # Security and app configuration
└── utils/          # Utility classes like ApiResponse
```

## Running the Project

```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## API Base URL

```
/api
```

## Important Notes

- All APIs return a wrapped response using `ApiResponse<T>`
- JWT authentication is used for securing endpoints
- Database schema auto-updates via Hibernate ddl-auto: update
- No raw SQL used anywhere - JPA only
