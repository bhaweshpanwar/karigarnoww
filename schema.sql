-- =====================================================
-- KarigarNow Database Schema
-- PostgreSQL
-- =====================================================

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY,
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
  address_id UUID REFERENCES addresses(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ADDRESSES
CREATE TABLE addresses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key from users to addresses after addresses table exists
ALTER TABLE users ADD CONSTRAINT fk_users_address_id FOREIGN KEY (address_id) REFERENCES addresses(id);

-- THEKEDARS
CREATE TABLE thekedars (
  id UUID PRIMARY KEY REFERENCES users(id),
  bio TEXT,
  experience TEXT,
  skills TEXT[],               -- ['plumbing', 'painting', 'electrical']
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
  id UUID PRIMARY KEY,
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
  id UUID PRIMARY KEY,
  consumer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  thekedar_id UUID REFERENCES thekedars(id),
  service TEXT NOT NULL,                -- 'plumbing', 'painting' etc.
  workers_needed INT DEFAULT 1,
  address_id UUID REFERENCES addresses(id),
  job_description TEXT,
  scheduled_at TIMESTAMP,
  otp TEXT,                    -- 4 digit OTP for arrival confirmation
  otp_verified BOOLEAN DEFAULT FALSE,
  booking_status TEXT CHECK (booking_status IN (
    'pending', 'accepted', 'dispatched',
    'in_progress', 'completed', 'cancelled'
  )) DEFAULT 'pending',
  payment_status TEXT CHECK (payment_status IN (
    'pending', 'held', 'released', 'refunded'
  )) DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  platform_fee DECIMAL(10,2),  -- 10-12% commission
  thekedar_payout DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- BOOKING WORKERS
CREATE TABLE booking_workers (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id),
  assigned_at TIMESTAMP DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  consumer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  thekedar_id UUID REFERENCES thekedars(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- EARNINGS
CREATE TABLE earnings (
  id UUID PRIMARY KEY,
  thekedar_id UUID REFERENCES thekedars(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  net_amount DECIMAL(10,2),
  paid_at TIMESTAMP DEFAULT NOW()
);
