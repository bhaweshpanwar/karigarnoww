# KarigarNow Database Seeder

Standalone Java seeder that populates PostgreSQL with realistic dev data using plain JDBC.

## Prerequisites

- PostgreSQL database running and accessible
- Database `karigarnow` created
- Schema applied (`schema.sql`)
- Maven dependencies downloaded (for BCrypt library)

## Data Files

| File | Description |
|------|-------------|
| `data/users.json` | 30 consumers + 30 thekedars |
| `data/thekedars.json` | 30 thekedar profiles |
| `data/thekedar_services.json` | Services offered per thekedar |
| `data/workers.json` | Workers under each thekedar |
| `data/addresses.json` | 15 consumer addresses |
| `data/reviews.json` | 35 reviews |

## Compile

```bash
cd D:/project-labour

# Download dependencies to target/lib/
mvn dependency:copy-dependencies -DoutputDirectory=target/lib -q

# Compile the seeder
javac -encoding UTF-8 -cp "target/lib/*;src/main/resources" dev/DataSeeder.java
```

This produces `dev/DataSeeder.class` and uses the jBCrypt library for proper BCrypt hashing.

## Run

```bash
# Seed all data
java -cp "target/lib/*;src/main/resources;." dev.DataSeeder --import

# Delete all seeded data
java -cp "target/lib/*;src/main/resources;." dev.DataSeeder --delete

# Delete then re-import fresh
java -cp "target/lib/*;src/main/resources;." dev.DataSeeder --reimport
```

## Test Login

All seeded users have password: `test1234`

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amit.sharma@email.com","password":"test1234"}'

curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ramesh.plumber@email.com","password":"test1234"}'
```

## What Gets Seeded

| Table | Rows |
|-------|------|
| app_services | 8 |
| users | 60 |
| addresses | 15 |
| thekedars | 30 |
| thekedar_services | 65 |
| workers | 65 |
| reviews | 35 |

## Notes

- Users table is NOT deleted during `--delete` (preserves auth data)
- app_services is skipped if already seeded (safe to re-run)
- `thekedar_services` uses `ON CONFLICT DO NOTHING` for safe re-runs
- BCrypt hashes are generated at seed time using the `jBCrypt` library
