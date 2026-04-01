# KarigarNow — CLAUDE.md

## What We Are Building
KarigarNow is an Indian home labour booking platform.
Tagline: "Apna kaam, apna worker"

Customers book home repair services (plumbing, painting, 
electrical, carpentry etc). A local Thekedar (contractor) 
accepts the job and dispatches workers from his team.
Payment is held in escrow and released after job completion.

## The Three Users
- Consumer: books a service via website
- Thekedar: accepts jobs, manages his team of workers
- Admin: platform oversight (later phase)

## Core Flow
1. Consumer selects service, fills address, pays into escrow
2. Nearby thekedars get notified
3. Thekedar accepts, dispatches worker(s)
4. Workers arrive, consumer shares OTP to confirm arrival
5. Job done, consumer marks complete, payment releases
6. Consumer rates the thekedar

## Tech Stack
- Backend: Java Spring Boot
- Database: PostgreSQL
- ORM: Spring Data JPA with Hibernate
- Auth: JWT (Spring Security)
- Build tool: Maven
- Port: 8080

## Database Tables
users, addresses, thekedars, workers, 
bookings, booking_workers, reviews, earnings
(full schema in schema.sql)

## Project Structure
com.karigarnow/
├── controller/
├── service/
├── repository/
├── model/
├── dto/
│   ├── request/
│   └── response/
├── exception/
├── config/
└── utils/

## Rules — Always Follow These
- Use Lombok (@Data, @Builder, @RequiredArgsConstructor)
- All APIs return ApiResponse<T> wrapper
- Use DTOs — never expose model directly in response
- Handle exceptions via GlobalExceptionHandler
- Follow REST conventions strictly
- No raw SQL — use JPA only
- Every endpoint must have proper HTTP status codes