# KarigarNow - Complete Setup Guide

This guide walks through setting up the entire KarigarNow project from scratch.

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+
- Node.js 18+

---

## Step 1: PostgreSQL Database Setup

### 1.1 Install PostgreSQL

If not already installed:

**Windows:**
```bash
# Download and install from https://postgresql.org/download/
# Or use winget
winget install PostgreSQL.PostgreSQL.14
```

**Mac:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 1.2 Create Database and User

Open `psql` as postgres user:

**Windows:**
```bash
psql -U postgres
```

**Mac/Linux:**
```bash
sudo -u postgres psql
```

Create database and user:
```sql
-- Create database
CREATE DATABASE karigarnow;

-- Create user (or use existing postgres user)
CREATE USER karigaruser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE karigarnow TO karigaruser;

-- Exit psql
\q
```

---

## Step 2: Configure Application Properties

Edit `src/main/resources/application.properties`:

```bash
# Windows
notepad src/main/resources/application.properties

# Mac/Linux
nano src/main/resources/application.properties
```

Update the database credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/karigarnow
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8080

jwt.secret=karigarnow-secret-key-for-jwt-token-generation-must-be-at-least-256-bits-long
jwt.expiration=86400000
```

> **Note:** Change `YOUR_POSTGRES_PASSWORD` to your actual PostgreSQL password.

---

## Step 3: Initialize Database Schema

### 3.1 Run schema.sql in PostgreSQL

**Option A: Using psql command line**
```bash
# Navigate to project directory first
cd D:\project-labour    # Windows
cd ~/project-labour     # Mac/Linux

# Run schema.sql
psql -U postgres -d karigarnow -f schema.sql
```

**Option B: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Select `karigarnow` database
4. Right-click → Query Tool
5. Open `schema.sql` file (File → Open)
6. Execute (F5 or click Execute button)

**Option C: Using psql interactive**
```bash
psql -U postgres -d karigarnow
```

Then inside psql:
```sql
\i schema.sql
```

### 3.2 Verify Schema Creation

```sql
-- List all tables
\dt

-- Should show: addresses, app_services, booking_workers, bookings, earnings, reviews, thekedar_services, thekedars, users, workers

-- Check app_services seeded data
SELECT * FROM app_services;
```

---

## Step 4: Seed Dummy Data

### 4.1 Compile the DataSeeder

First, download Maven dependencies:

```bash
cd D:\project-labour    # or your project path

# Download dependencies
mvn dependency:copy-dependencies -DoutputDirectory=target/lib -q
```

Compile the DataSeeder:

**Windows:**
```bash
javac -encoding UTF-8 -cp "target/lib/*;src/main/resources" dev/DataSeeder.java
```

**Mac/Linux:**
```bash
javac -encoding UTF-8 -cp "target/lib/*:src/main/resources" dev/DataSeeder.java
```

### 4.2 Run the DataSeeder

**Windows:**
```bash
# Seed all data
java -cp "target/lib/*;src/main/resources;." dev.DataSeeder --import

# Or delete and re-import fresh
java -cp "target/lib/*;src/main/resources;." dev.DataSeeder --reimport
```

**Mac/Linux:**
```bash
# Seed all data
java -cp "target/lib/*:src/main/resources:." dev.DataSeeder --import

# Or delete and re-import fresh
java -cp "target/lib/*:src/main/resources:." dev.DataSeeder --reimport
```

### 4.3 Verify Seeded Data

```bash
psql -U postgres -d karigarnow -c "SELECT COUNT(*) FROM users;"
psql -U postgres -d karigarnow -c "SELECT COUNT(*) FROM thekedars;"
psql -U postgres -d karigarnow -c "SELECT COUNT(*) FROM workers;"
```

Expected counts:
- app_services: 8
- users: 60 (30 consumers + 30 thekedars)
- addresses: 15
- thekedars: 30
- thekedar_services: 65
- workers: 65
- reviews: 35

---

## Step 5: Build and Run Backend (Spring Boot)

### 5.1 Compile and Run

```bash
cd D:\project-labour

# Clean and compile
mvn clean compile

# Run Spring Boot application
mvn spring-boot:run
```

The API will be available at: `http://localhost:8080`

### 5.2 Test the API

Open a new terminal and test:

```bash
# Health check
curl http://localhost:8080/api/test

# Should return:
# {"success":true,"message":"KarigarNow API is running","data":null}
```

Test login with seeded data:
```bash
# Consumer login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amit.sharma@email.com","password":"test1234"}'

# Thekedar login  
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ramesh.plumber@email.com","password":"test1234"}'
```

---

## Step 6: Setup and Run Frontend (React)

Open a **new terminal** (keep backend running in first terminal):

### 6.1 Navigate to Client Directory

```bash
cd D:\project-labour\client    # Windows
cd ~/project-labour/client      # Mac/Linux
```

### 6.2 Install Dependencies

```bash
npm install
```

### 6.3 Run React Development Server

```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`

---

## Quick Reference Commands

### Database Operations

```bash
# Connect to database
psql -U postgres -d karigarnow

# Reset database (delete all tables and re-run schema)
psql -U postgres -d karigarnow -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -U postgres -d karigarnow -f schema.sql

# Seed data
java -cp "target/lib/*;src/main/resources;." dev.DataSeeder --reimport

# Check table row counts
psql -U postgres -d karigarnow -c "SELECT 'users' as table, COUNT(*) FROM users UNION ALL SELECT 'bookings', COUNT(*) FROM bookings;"
```

### Backend Operations

```bash
# Run tests
mvn test

# Build JAR
mvn clean package

# Run JAR
java -jar target/karigarnow-0.0.1-SNAPSHOT.jar

# Debug mode
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

### Frontend Operations

```bash
cd client

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Troubleshooting

### PostgreSQL Connection Issues

**Error:** `Connection refused`
- Verify PostgreSQL service is running
- Check `application.properties` credentials match your PostgreSQL setup

**Error:** `FATAL: database "karigarnow" does not exist`
- Run: `psql -U postgres -c "CREATE DATABASE karigarnow;"`

### DataSeeder Issues

**Error:** `Could not read application.properties`
- Ensure you're running from the project root directory
- Verify the file exists: `src/main/resources/application.properties`

**Error:** `ClassNotFoundException`
- Ensure Maven dependencies are downloaded: `mvn dependency:copy-dependencies -DoutputDirectory=target/lib`

### Backend Won't Start

**Error:** `Port 8080 already in use`
- Kill existing process or change port in `application.properties`: `server.port=8081`

### Frontend Issues

**Error:** `Cannot find module`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

## Project Structure Overview

```
karigarnow/
├── src/main/java/com/karigarnow/    # Java source
│   ├── controller/                   # REST APIs
│   ├── service/                      # Business logic
│   ├── repository/                   # Data access
│   ├── model/                        # JPA entities
│   ├── dto/                          # Request/Response DTOs
│   ├── config/                       # Security, JWT config
│   └── exception/                    # Global exception handler
├── src/main/resources/
│   └── application.properties        # DB config
├── dev/
│   ├── DataSeeder.java               # Database seeder
│   └── data/                         # JSON seed data
├── client/                           # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── schema.sql                        # Database schema
├── SETUP.md                          # This file
└── pom.xml                           # Maven config
```

---

## Default Test Accounts (from seeded data)

All seeded users have password: `test1234`

| Email | Role |
|-------|------|
| amit.sharma@email.com | consumer |
| priya.patel@email.com | consumer |
| ramesh.plumber@email.com | thekedar |
| sunil.carpenter@email.com | thekedar |

---

## Next Steps

1. Access frontend at `http://localhost:5173`
2. Login with test credentials
3. Explore as consumer (book services) or thekedar (manage workers)
4. Check API docs in `API.md`
