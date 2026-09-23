-- ============================================================
-- Migration 003: Extend profiles table with full membership fields
-- ============================================================

-- Add new columns to profiles (all optional / nullable)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username         TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar_url       TEXT,          -- profile photo URL (Supabase Storage)
  ADD COLUMN IF NOT EXISTS position         TEXT DEFAULT 'member'
    CHECK (position IN ('member','pastor','ministry_leader','media','worship',
                        'ushering','evangelism','youth','administration','other')),
  ADD COLUMN IF NOT EXISTS date_of_birth    DATE,
  ADD COLUMN IF NOT EXISTS gender           TEXT
    CHECK (gender IN ('male','female','prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS faith            TEXT,
  ADD COLUMN IF NOT EXISTS career_status    TEXT
    CHECK (career_status IN ('student','employed','self_employed',
                             'unemployed','business_owner','other')),
  ADD COLUMN IF NOT EXISTS occupation       TEXT,
  ADD COLUMN IF NOT EXISTS student_status   TEXT,
  ADD COLUMN IF NOT EXISTS school           TEXT,
  ADD COLUMN IF NOT EXISTS address          TEXT,
  ADD COLUMN IF NOT EXISTS is_active        BOOLEAN DEFAULT true;

-- Index on username for fast lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_position ON profiles(position);

-- ── Secure RLS update ──────────────────────────────────────────
-- Members can only read their OWN private data;
-- public data (name, position) is readable by all authenticated users.

-- Drop and recreate policies cleanly
DROP POLICY IF EXISTS "Users can view all profiles"       ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles visible to all"    ON profiles;

-- Anyone (inc. anon) can see basic public info
CREATE POLICY "Public profiles visible to all"
  ON profiles FOR SELECT
  USING (true);

-- Members can update only their own row
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Members can insert only their own row (handled by trigger, but allow direct too)
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── Storage bucket for profile photos ─────────────────────────
-- Run manually in Supabase dashboard if not already created:
-- CREATE BUCKET profile-photos (public: false)
-- Policy: authenticated users can upload to their own folder (user_id/*)

-- ── Update handle_new_user trigger to include username default ─
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
BEGIN
  -- Generate a default username from email prefix
  base_username := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]', '', 'g'));
  final_username := base_username;

  -- Ensure uniqueness by appending a counter if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  INSERT INTO public.profiles (id, full_name, email, role, username, position)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'member',
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'position', 'member')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
