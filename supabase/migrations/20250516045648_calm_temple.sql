/*
  # Fix Users Table RLS Policy

  1. Changes
    - Add policy to allow public users to insert their own data during registration
    - Ensure policy checks that inserted user ID matches authenticated user ID

  2. Security
    - Policy is limited to INSERT operations only
    - Maintains data integrity by enforcing user ID match
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Users can insert own data during registration'
  ) THEN
    DROP POLICY "Users can insert own data during registration" ON users;
  END IF;
END $$;

-- Add new policy for user registration
CREATE POLICY "Users can insert own data during registration"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (
    -- For new registrations, auth.uid() will match the id being inserted
    auth.uid() = id
  );