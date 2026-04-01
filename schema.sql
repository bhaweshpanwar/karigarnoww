-- =====================================================
-- KarigarNow Database Schema
-- =====================================================

-- extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ADDRESSES FIRST (no dependencies)
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- USERS SECOND (no address_id yet)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NULL,
  photo TEXT,
  auth_provider TEXT CHECK (auth_provider IN ('local', 'google', 'facebook')) DEFAULT 'local',
  auth_provider_id TEXT UNIQUE NULL,
  mobile TEXT UNIQUE,
  role TEXT CHECK (role IN ('consumer', 'thekedar')) NOT NULL,
  password_changed_at TIMESTAMP NULL,
  password_reset_token TEXT NULL,
  password_reset_expires TIMESTAMP NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NOW add foreign keys both ways
ALTER TABLE addresses ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN address_id UUID REFERENCES addresses(id);

-- SERVICES
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  base_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- THEKEDARS
CREATE TABLE thekedars (
  id UUID PRIMARY KEY REFERENCES users(id),
  bio TEXT,
  experience TEXT,
  skills TEXT[],
  team_size INT DEFAULT 1,
  rate_per_hour DECIMAL(10,2),
  is_online BOOLEAN DEFAULT FALSE,
  rating_average DECIMAL(3,2) DEFAULT 0.0,
  total_jobs INT DEFAULT 0,
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- WORKERS
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thekedar_id UUID REFERENCES thekedars(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mobile TEXT,
  skills TEXT[],
  daily_rate DECIMAL(10,2),
  is_available BOOLEAN DEFAULT TRUE,
  total_jobs INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- BOOKINGS
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  thekedar_id UUID REFERENCES thekedars(id),
  service_id UUID REFERENCES services(id),
  workers_needed INT DEFAULT 1,
  address_id UUID REFERENCES addresses(id),
  job_description TEXT,
  scheduled_at TIMESTAMP,
  otp TEXT,
  otp_verified BOOLEAN DEFAULT FALSE,
  booking_status TEXT CHECK (booking_status IN (
    'pending', 'accepted', 'dispatched',
    'in_progress', 'completed', 'cancelled'
  )) DEFAULT 'pending',
  payment_status TEXT CHECK (payment_status IN (
    'pending', 'held', 'released', 'refunded'
  )) DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  thekedar_payout DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- BOOKING WORKERS
CREATE TABLE booking_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id),
  assigned_at TIMESTAMP DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  consumer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  thekedar_id UUID REFERENCES thekedars(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- EARNINGS
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thekedar_id UUID REFERENCES thekedars(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  net_amount DECIMAL(10,2),
  paid_at TIMESTAMP DEFAULT NOW()
);