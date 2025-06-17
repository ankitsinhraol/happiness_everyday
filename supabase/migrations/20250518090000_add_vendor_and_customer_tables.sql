-- Migration to add vendor_profiles, vendor_reviews, vendor_availability, messages, vendor_bookings tables

-- Vendor Profiles table
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  city text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  description text NOT NULL,
  logo_url text,
  website text,
  services text[] NOT NULL,
  price_range text,
  event_types_supported text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Vendor Reviews table
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendor_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Vendor Availability table
CREATE TABLE IF NOT EXISTS vendor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendor_profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('available', 'unavailable')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (vendor_id, date)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Vendor Bookings table
CREATE TABLE IF NOT EXISTS vendor_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vendor_id uuid REFERENCES vendor_profiles(id) ON DELETE CASCADE NOT NULL,
  service_type text NOT NULL,
  event_date date NOT NULL,
  event_type text NOT NULL,
  message text,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on new tables
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_profiles
CREATE POLICY "Public read access to vendor profiles" ON vendor_profiles
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their own profiles" ON vendor_profiles
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for vendor_reviews
CREATE POLICY "Public read access to vendor reviews" ON vendor_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON vendor_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON vendor_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON vendor_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for vendor_availability
CREATE POLICY "Public read access to vendor availability" ON vendor_availability
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their own availability" ON vendor_availability
  FOR ALL USING (auth.uid() = (SELECT user_id FROM vendor_profiles WHERE id = vendor_id));

-- RLS Policies for messages
CREATE POLICY "Users can read their own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (auth.uid() = sender_id);

-- RLS Policies for vendor_bookings
CREATE POLICY "Vendors can view bookings for their profile" ON vendor_bookings
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM vendor_profiles WHERE id = vendor_id));

CREATE POLICY "Customers can view their own bookings" ON vendor_bookings
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create bookings" ON vendor_bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Involved parties can update bookings" ON vendor_bookings
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = (SELECT user_id FROM vendor_profiles WHERE id = vendor_id));
