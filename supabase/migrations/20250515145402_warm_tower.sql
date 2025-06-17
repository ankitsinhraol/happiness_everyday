/*
  # Initial Schema for AllInEvent Platform

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, unique, not null)
      - `role` (text, not null)
      - `created_at` (timestamptz, default now())
    - `vendors`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `business_name` (text, not null)
      - `city` (text, not null)
      - `phone` (text, not null)
      - `email` (text, not null)
      - `description` (text, not null)
      - `logo_url` (text)
      - `website` (text)
      - `created_at` (timestamptz, default now())
    - `services`
      - `id` (uuid, primary key)
      - `vendor_id` (uuid, foreign key to vendors.id)
      - `type` (text, not null)
      - `min_price` (integer, not null)
      - `max_price` (integer, not null)
      - `description` (text, not null)
      - `event_types_supported` (text[], not null)
      - `created_at` (timestamptz, default now())
    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `vendor_id` (uuid, foreign key to vendors.id)
      - `service_id` (uuid, foreign key to services.id)
      - `event_date` (date, not null)
      - `event_type` (text, not null)
      - `message` (text, not null)
      - `status` (text, not null)
      - `created_at` (timestamptz, default now())
    - `availability`
      - `id` (uuid, primary key)
      - `vendor_id` (uuid, foreign key to vendors.id)
      - `date` (date, not null)
      - `status` (text, not null)
      - `created_at` (timestamptz, default now())
    - `reviews`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `vendor_id` (uuid, foreign key to vendors.id)
      - `booking_id` (uuid, foreign key to bookings.id)
      - `rating` (integer, not null)
      - `review_text` (text, not null)
      - `created_at` (timestamptz, default now())
    - `vendor_images`
      - `id` (uuid, primary key)
      - `vendor_id` (uuid, foreign key to vendors.id)
      - `image_url` (text, not null)
      - `created_at` (timestamptz, default now())
    - `ai_query_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id, nullable)
      - `query_text` (text, not null)
      - `ai_parsed_data` (jsonb, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for CRUD operations
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('customer', 'vendor', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  city text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  description text NOT NULL,
  logo_url text,
  website text,
  created_at timestamptz DEFAULT now()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  min_price integer NOT NULL CHECK (min_price >= 0),
  max_price integer NOT NULL CHECK (max_price >= min_price),
  description text NOT NULL,
  event_types_supported text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  event_date date NOT NULL,
  event_type text NOT NULL,
  message text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Availability table
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('available', 'unavailable')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (vendor_id, date)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Vendor images table
CREATE TABLE IF NOT EXISTS vendor_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- AI query log table
CREATE TABLE IF NOT EXISTS ai_query_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  query_text text NOT NULL,
  ai_parsed_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_query_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for vendors
CREATE POLICY "Vendors are publicly readable" ON vendors
  FOR SELECT USING (true);

CREATE POLICY "Vendors can update own data" ON vendors
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for services
CREATE POLICY "Services are publicly readable" ON services
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their own services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Vendors can view bookings for their services" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Involved parties can update bookings" ON bookings
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- RLS Policies for availability
CREATE POLICY "Availability is publicly readable" ON availability
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their own availability" ON availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Reviews are publicly readable" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for vendor images
CREATE POLICY "Vendor images are publicly readable" ON vendor_images
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their own images" ON vendor_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- RLS Policies for AI query log
CREATE POLICY "Users can see their own query logs" ON ai_query_log
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create query logs" ON ai_query_log
  FOR INSERT WITH CHECK (true);