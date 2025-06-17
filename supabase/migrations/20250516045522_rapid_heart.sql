/*
  # Add user registration RLS policy

  1. Security Changes
    - Add RLS policy to allow user registration
    - Policy ensures users can only insert their own data during registration
    - Maintains security by checking that the inserted ID matches the authenticated user's ID

  Note: This policy complements existing policies for SELECT and UPDATE
*/

-- Add policy to allow users to insert their own data during registration
CREATE POLICY "Users can insert own data during registration"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);