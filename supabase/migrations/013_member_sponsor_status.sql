-- ============================================================
-- Migration 013: Member & Sponsor Status
--
-- Adds explicit status text fields:
--   profiles.member_status  — 'current' | 'former'   (default 'current')
--   sponsors.sponsor_status — 'pending' | 'current' | 'former'
--
-- The existing is_active booleans are kept for backward compat
-- but the status fields are the source of truth going forward.
-- ============================================================

-- ── 1. profiles.member_status ────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS member_status TEXT NOT NULL DEFAULT 'current'
    CHECK (member_status IN ('current', 'former'));

-- Sync existing is_active values to the new field
UPDATE profiles SET member_status = 'former' WHERE is_active = false;

CREATE INDEX IF NOT EXISTS idx_profiles_member_status ON profiles(member_status);

-- ── 2. sponsors.sponsor_status ───────────────────────────────
ALTER TABLE sponsors
  ADD COLUMN IF NOT EXISTS sponsor_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (sponsor_status IN ('pending', 'current', 'former'));

-- Sync existing is_active values
-- is_active=false means former, is_active=true means current
-- (new submissions via SponsorRegistration start as pending)
UPDATE sponsors SET sponsor_status = CASE
  WHEN is_active = true  THEN 'current'
  WHEN is_active = false THEN 'former'
  ELSE 'pending'
END;

CREATE INDEX IF NOT EXISTS idx_sponsors_sponsor_status ON sponsors(sponsor_status);

-- ── 3. RLS: admins can update member_status on profiles ──────
-- The existing profiles_update_own policy only allows a member to
-- update their own row. Admins need to update member_status on any row.
-- We add a separate policy for that specific action.
DROP POLICY IF EXISTS "admins_update_member_status" ON profiles;
CREATE POLICY "admins_update_member_status"
  ON profiles FOR UPDATE
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (p.role = 'admin' OR p.is_super_admin = true)
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (p.role = 'admin' OR p.is_super_admin = true)
    )
  );

-- ── 4. RLS: admins can update sponsor_status on sponsors ──────
DROP POLICY IF EXISTS "admins_update_sponsor_status" ON sponsors;
CREATE POLICY "admins_update_sponsor_status"
  ON sponsors FOR UPDATE
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR is_super_admin = true)
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR is_super_admin = true)
    )
  );
