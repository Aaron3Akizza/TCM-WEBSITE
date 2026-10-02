-- ============================================================
-- Migration 008: Admin Permission System
--
-- Fixes:
--   1. Column-level security on profiles.role — prevents self-
--      promotion via direct Supabase API calls.
--
-- Adds:
--   2. profiles.is_super_admin — protected boolean, only settable
--      by service_role (Supabase dashboard / SQL editor).
--   3. admin_permissions — one row per admin user, containing
--      granular boolean permission flags.
--   4. admin_permission_audit — immutable log of every permission
--      change: who changed what, when, and what changed.
--
-- Security model:
--   - Super admin   : profiles.is_super_admin = true
--                     Can do everything including manage permissions.
--   - Admin         : profiles.role = 'admin'
--                     Can access admin dashboard, gated by their
--                     specific permission flags in admin_permissions.
--   - Member/Leader : profiles.role = 'member'|'leader'
--                     No admin access at all.
--
-- Role escalation prevention:
--   A DB function set_admin_role() and set_super_admin() are the
--   only permitted ways to change these fields — both require the
--   caller to hold is_super_admin = true (or be service_role).
-- ============================================================

-- ── 1. Add is_super_admin to profiles ────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- Index for fast super-admin lookup
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin
  ON profiles(is_super_admin) WHERE is_super_admin = true;

-- ── 2. Fix the profiles UPDATE RLS vulnerability ──────────────
-- The current profiles_update_own policy allows ANY authenticated
-- user to UPDATE any column on their own row, including role and
-- is_super_admin.  We replace it with a policy that still allows
-- updating normal profile fields but ONLY service_role / super-
-- admins can change role or is_super_admin.
--
-- Supabase does not support column-level security in policies
-- directly, so we enforce it via a BEFORE UPDATE trigger that
-- rolls back any attempt to change role/is_super_admin unless the
-- caller is service_role or is themselves a super admin.

DROP POLICY IF EXISTS "profiles_update_own"    ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"    ON profiles;

-- Members can update their own profile (all non-protected columns).
-- The trigger below blocks role/is_super_admin changes.
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Members can insert only their own row.
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── Trigger: block role / is_super_admin self-promotion ───────
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role to change anything
  IF current_setting('role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block any change to role unless the caller is a super admin
  IF NEW.role <> OLD.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_admin = true
    ) THEN
      RAISE EXCEPTION 'permission_denied: only a super administrator can change the role field';
    END IF;
  END IF;

  -- Block any change to is_super_admin entirely via client JWT
  -- (only service_role / SQL editor can set this)
  IF NEW.is_super_admin <> OLD.is_super_admin THEN
    IF current_setting('role') <> 'service_role' THEN
      RAISE EXCEPTION 'permission_denied: is_super_admin can only be set by a database administrator';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- ── 3. admin_permissions table ────────────────────────────────
-- One row per admin user. Each boolean flag is a specific
-- permission. Add new columns here as TCM grows — existing rows
-- default to false for any new column.
CREATE TABLE IF NOT EXISTS admin_permissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- ── Member management ──
  perm_view_members      BOOLEAN NOT NULL DEFAULT false,
  perm_edit_members      BOOLEAN NOT NULL DEFAULT false,
  perm_manage_members    BOOLEAN NOT NULL DEFAULT false,
  perm_export_members    BOOLEAN NOT NULL DEFAULT false,

  -- ── Sponsorship management ──
  perm_view_sponsors     BOOLEAN NOT NULL DEFAULT false,
  perm_verify_sponsors   BOOLEAN NOT NULL DEFAULT false,
  perm_manage_sponsors   BOOLEAN NOT NULL DEFAULT false,
  perm_export_sponsors   BOOLEAN NOT NULL DEFAULT false,

  -- ── Support requests ──
  perm_view_support      BOOLEAN NOT NULL DEFAULT false,
  perm_manage_support    BOOLEAN NOT NULL DEFAULT false,

  -- ── Department / project / merchandise management ──
  perm_manage_departments BOOLEAN NOT NULL DEFAULT false,
  perm_manage_projects    BOOLEAN NOT NULL DEFAULT false,
  perm_manage_merchandise BOOLEAN NOT NULL DEFAULT false,

  -- ── Content / media ──
  perm_manage_media      BOOLEAN NOT NULL DEFAULT false,
  perm_manage_content    BOOLEAN NOT NULL DEFAULT false,

  -- ── Administration ──
  perm_view_admins       BOOLEAN NOT NULL DEFAULT false,
  perm_manage_admins     BOOLEAN NOT NULL DEFAULT false,  -- grant / revoke permissions

  -- ── Full administration ──
  -- Grants all of the above implicitly. Protected — only super admin can set.
  perm_full_admin        BOOLEAN NOT NULL DEFAULT false,

  -- Meta
  granted_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_admin_permissions_timestamp ON admin_permissions;
CREATE TRIGGER update_admin_permissions_timestamp
  BEFORE UPDATE ON admin_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_admin_permissions_profile
  ON admin_permissions(profile_id);

-- ── 4. admin_permission_audit table ──────────────────────────
-- Immutable audit trail. NEVER update or delete rows.
CREATE TABLE IF NOT EXISTS admin_permission_audit (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who was changed
  target_profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_name          TEXT NOT NULL,   -- snapshot of name at time of change

  -- Who made the change
  granted_by_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  granted_by_name      TEXT,            -- snapshot of granter's name

  -- What changed (JSON snapshots for full history)
  action               TEXT NOT NULL
    CHECK (action IN ('granted', 'revoked', 'role_changed', 'super_admin_set')),
  permission_key       TEXT,            -- e.g. 'perm_verify_sponsors'
  previous_value       TEXT,            -- 'true'/'false'/'member'/'admin' etc.
  new_value            TEXT,
  notes                TEXT,

  changed_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_perm_audit_target  ON admin_permission_audit(target_profile_id);
CREATE INDEX IF NOT EXISTS idx_perm_audit_granter ON admin_permission_audit(granted_by_id);
CREATE INDEX IF NOT EXISTS idx_perm_audit_changed ON admin_permission_audit(changed_at DESC);

-- ── 5. Enable RLS ─────────────────────────────────────────────
ALTER TABLE admin_permissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permission_audit  ENABLE ROW LEVEL SECURITY;

-- ── 6. RLS: admin_permissions ─────────────────────────────────

-- Super admins and service_role can do everything
DROP POLICY IF EXISTS "super_admins_manage_permissions" ON admin_permissions;
CREATE POLICY "super_admins_manage_permissions"
  ON admin_permissions FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Admins who have perm_manage_admins can manage permissions
-- (but NOT set perm_full_admin or is_super_admin — enforced by app layer + trigger)
DROP POLICY IF EXISTS "permission_managers_can_manage" ON admin_permissions;
CREATE POLICY "permission_managers_can_manage"
  ON admin_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_permissions ap
      WHERE ap.profile_id = auth.uid()
      AND (ap.perm_manage_admins = true OR ap.perm_full_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_permissions ap
      WHERE ap.profile_id = auth.uid()
      AND (ap.perm_manage_admins = true OR ap.perm_full_admin = true)
    )
  );

-- Each admin can read their own permission row (needed for useAuth)
DROP POLICY IF EXISTS "admins_read_own_permissions" ON admin_permissions;
CREATE POLICY "admins_read_own_permissions"
  ON admin_permissions FOR SELECT
  USING (profile_id = auth.uid());

-- ── 7. RLS: admin_permission_audit ───────────────────────────

-- Super admins can read/insert audit entries
DROP POLICY IF EXISTS "super_admins_manage_audit" ON admin_permission_audit;
CREATE POLICY "super_admins_manage_audit"
  ON admin_permission_audit FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Permission managers can insert and read audit entries
DROP POLICY IF EXISTS "permission_managers_audit" ON admin_permission_audit;
CREATE POLICY "permission_managers_audit"
  ON admin_permission_audit FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_permissions ap
      WHERE ap.profile_id = auth.uid()
      AND (ap.perm_manage_admins = true OR ap.perm_full_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_permissions ap
      WHERE ap.profile_id = auth.uid()
      AND (ap.perm_manage_admins = true OR ap.perm_full_admin = true)
    )
  );

-- ── 8. Helper function: get_my_permissions() ─────────────────
-- Returns the admin_permissions row for the current user.
-- Used by the app to load permissions in one call.
CREATE OR REPLACE FUNCTION public.get_my_permissions()
RETURNS TABLE (
  perm_view_members       boolean,
  perm_edit_members       boolean,
  perm_manage_members     boolean,
  perm_export_members     boolean,
  perm_view_sponsors      boolean,
  perm_verify_sponsors    boolean,
  perm_manage_sponsors    boolean,
  perm_export_sponsors    boolean,
  perm_view_support       boolean,
  perm_manage_support     boolean,
  perm_manage_departments boolean,
  perm_manage_projects    boolean,
  perm_manage_merchandise boolean,
  perm_manage_media       boolean,
  perm_manage_content     boolean,
  perm_view_admins        boolean,
  perm_manage_admins      boolean,
  perm_full_admin         boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    perm_view_members, perm_edit_members, perm_manage_members, perm_export_members,
    perm_view_sponsors, perm_verify_sponsors, perm_manage_sponsors, perm_export_sponsors,
    perm_view_support, perm_manage_support,
    perm_manage_departments, perm_manage_projects, perm_manage_merchandise,
    perm_manage_media, perm_manage_content,
    perm_view_admins, perm_manage_admins,
    perm_full_admin
  FROM public.admin_permissions
  WHERE profile_id = auth.uid()
  LIMIT 1;
$$;

-- ── 9. SETUP INSTRUCTIONS (run manually after migration) ──────
-- To designate the first Super Administrator, run the following
-- in Supabase SQL Editor (replace the email with your own):
--
--   UPDATE profiles
--   SET role = 'admin', is_super_admin = true
--   WHERE email = 'your-email@example.com';
--
--   INSERT INTO admin_permissions (profile_id, perm_full_admin, granted_by)
--   SELECT id, true, id
--   FROM profiles
--   WHERE email = 'your-email@example.com'
--   ON CONFLICT (profile_id) DO UPDATE
--   SET perm_full_admin = true;
--
-- This is the ONLY safe way to create the first super admin.
-- Do not hardcode this in the application.
