-- ============================================================
-- Migration 011: Admin Notifications
--
-- Simple one-row-per-notification table.
-- When a super admin grants permissions to a member, a notification
-- is inserted here. The member sees it on their profile/dashboard
-- on next sign-in and can dismiss it.
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL DEFAULT 'access_granted'
    CHECK (type IN ('access_granted', 'access_revoked', 'general')),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  granted_by_name TEXT,                        -- name of super admin who granted
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_profile
  ON admin_notifications(profile_id, is_read);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Each admin can only read/update their own notifications
DROP POLICY IF EXISTS "admins_read_own_notifications" ON admin_notifications;
CREATE POLICY "admins_read_own_notifications"
  ON admin_notifications FOR SELECT
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "admins_update_own_notifications" ON admin_notifications;
CREATE POLICY "admins_update_own_notifications"
  ON admin_notifications FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Super admins and service_role can insert notifications
DROP POLICY IF EXISTS "super_admins_insert_notifications" ON admin_notifications;
CREATE POLICY "super_admins_insert_notifications"
  ON admin_notifications FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_super_admin = true OR role = 'admin')
    )
  );

-- Super admins can read all notifications (for auditing)
DROP POLICY IF EXISTS "super_admins_read_all_notifications" ON admin_notifications;
CREATE POLICY "super_admins_read_all_notifications"
  ON admin_notifications FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );
