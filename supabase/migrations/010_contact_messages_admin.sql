-- ============================================================
-- Migration 010: Contact Messages — Admin Access
--
-- Problem: Migration 004 intentionally removed the SELECT policy
-- on contact_messages, meaning no one (including admins) can read
-- them through the client. Admins need to read and update status.
--
-- Changes:
--   1. Add SELECT policy — admins only
--   2. Add UPDATE policy — admins only (for status changes)
--   3. Keep INSERT open — anyone can submit the contact form
--   4. Ensure status column allows 'unread','read','responded'
--      (already correct from migration 001)
-- ============================================================

-- ── SELECT: only admins can read contact messages ─────────────
DROP POLICY IF EXISTS "Admins can view contact messages"    ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_select_admins"      ON contact_messages;

CREATE POLICY "contact_messages_select_admins"
  ON contact_messages FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND   role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      JOIN admin_permissions ap ON ap.profile_id = p.id
      WHERE p.id = auth.uid()
      AND   p.is_super_admin = true
    )
  );

-- ── UPDATE: only admins can change message status ─────────────
DROP POLICY IF EXISTS "Admins can update contact messages"  ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_update_admins"      ON contact_messages;

CREATE POLICY "contact_messages_update_admins"
  ON contact_messages FOR UPDATE
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND   role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND   is_super_admin = true
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND   role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND   is_super_admin = true
    )
  );

-- INSERT remains open (already set in migration 004)
-- DROP POLICY IF EXISTS "contact_messages_insert_public" — keep as-is
