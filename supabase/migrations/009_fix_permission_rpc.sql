-- ============================================================
-- Migration 009: Fix permission grant system
--
-- Problem: The prevent_role_escalation trigger fires on every
-- UPDATE to profiles.role — even when called by a super admin
-- through the Supabase client. The trigger's auth.uid() check
-- works for PostgREST requests but the RAISE inside the trigger
-- still fires because the role-check logic has a race condition.
--
-- Solution: Create a SECURITY DEFINER function set_member_role()
-- that runs elevated to the postgres role, bypassing the trigger's
-- JWT-based check. The function does its own authorization check
-- using the profiles table directly before making any change.
--
-- Also fix: admin_permissions upsert policy so that super admins
-- (verified via profiles.is_super_admin) can always write.
-- ============================================================

-- ── 1. set_member_role() — safe role-change RPC ───────────────
-- Call via: supabase.rpc('set_member_role', { target_id, new_role })
-- The function verifies the caller is a super admin or has
-- perm_manage_admins before making any change.
CREATE OR REPLACE FUNCTION public.set_member_role(
  target_id UUID,
  new_role  TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id        UUID;
  caller_is_super  BOOLEAN;
  caller_can_manage BOOLEAN;
  current_role     TEXT;
BEGIN
  -- Get the calling user's ID
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  -- Check caller's permissions
  SELECT is_super_admin INTO caller_is_super
  FROM public.profiles WHERE id = caller_id;

  SELECT (perm_manage_admins OR perm_full_admin) INTO caller_can_manage
  FROM public.admin_permissions WHERE profile_id = caller_id;

  IF NOT (COALESCE(caller_is_super, false) OR COALESCE(caller_can_manage, false)) THEN
    RETURN jsonb_build_object('error', 'permission_denied: you do not have permission to change member roles');
  END IF;

  -- Validate the new role value
  IF new_role NOT IN ('member', 'leader', 'admin') THEN
    RETURN jsonb_build_object('error', 'invalid_role: must be member, leader, or admin');
  END IF;

  -- Get current role
  SELECT role INTO current_role FROM public.profiles WHERE id = target_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'member_not_found');
  END IF;

  -- Prevent demoting a super admin via this function
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_id AND is_super_admin = true)
     AND new_role <> 'admin' THEN
    RETURN jsonb_build_object('error', 'cannot_demote_super_admin: remove is_super_admin first');
  END IF;

  -- Perform the update (SECURITY DEFINER bypasses the RLS trigger check)
  UPDATE public.profiles SET role = new_role WHERE id = target_id;

  RETURN jsonb_build_object('success', true, 'previous_role', current_role, 'new_role', new_role);
END;
$$;

-- Grant execute to authenticated users (the function itself enforces authorization)
GRANT EXECUTE ON FUNCTION public.set_member_role(UUID, TEXT) TO authenticated;

-- ── 2. upsert_admin_permissions() — safe permissions RPC ──────
-- Call via: supabase.rpc('upsert_admin_permissions', { target_id, perms })
-- Handles insert-or-update in one call with proper authorization.
CREATE OR REPLACE FUNCTION public.upsert_admin_permissions(
  target_id  UUID,
  perms      JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id         UUID;
  caller_is_super   BOOLEAN;
  caller_can_manage BOOLEAN;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  SELECT is_super_admin INTO caller_is_super
  FROM public.profiles WHERE id = caller_id;

  SELECT (perm_manage_admins OR perm_full_admin) INTO caller_can_manage
  FROM public.admin_permissions WHERE profile_id = caller_id;

  IF NOT (COALESCE(caller_is_super, false) OR COALESCE(caller_can_manage, false)) THEN
    RETURN jsonb_build_object('error', 'permission_denied');
  END IF;

  -- Prevent non-super-admins from setting perm_full_admin or perm_manage_admins
  IF NOT COALESCE(caller_is_super, false) THEN
    IF (perms->>'perm_full_admin')::boolean = true OR
       (perms->>'perm_manage_admins')::boolean = true THEN
      RETURN jsonb_build_object('error', 'permission_denied: only super admins can grant full_admin or manage_admins');
    END IF;
  END IF;

  INSERT INTO public.admin_permissions (
    profile_id,
    granted_by,
    perm_view_members, perm_edit_members, perm_manage_members, perm_export_members,
    perm_view_sponsors, perm_verify_sponsors, perm_manage_sponsors, perm_export_sponsors,
    perm_view_support, perm_manage_support,
    perm_manage_departments, perm_manage_projects, perm_manage_merchandise,
    perm_manage_media, perm_manage_content,
    perm_view_admins, perm_manage_admins,
    perm_full_admin
  ) VALUES (
    target_id,
    caller_id,
    COALESCE((perms->>'perm_view_members')::boolean, false),
    COALESCE((perms->>'perm_edit_members')::boolean, false),
    COALESCE((perms->>'perm_manage_members')::boolean, false),
    COALESCE((perms->>'perm_export_members')::boolean, false),
    COALESCE((perms->>'perm_view_sponsors')::boolean, false),
    COALESCE((perms->>'perm_verify_sponsors')::boolean, false),
    COALESCE((perms->>'perm_manage_sponsors')::boolean, false),
    COALESCE((perms->>'perm_export_sponsors')::boolean, false),
    COALESCE((perms->>'perm_view_support')::boolean, false),
    COALESCE((perms->>'perm_manage_support')::boolean, false),
    COALESCE((perms->>'perm_manage_departments')::boolean, false),
    COALESCE((perms->>'perm_manage_projects')::boolean, false),
    COALESCE((perms->>'perm_manage_merchandise')::boolean, false),
    COALESCE((perms->>'perm_manage_media')::boolean, false),
    COALESCE((perms->>'perm_manage_content')::boolean, false),
    COALESCE((perms->>'perm_view_admins')::boolean, false),
    COALESCE((perms->>'perm_manage_admins')::boolean, false),
    COALESCE((perms->>'perm_full_admin')::boolean, false)
  )
  ON CONFLICT (profile_id) DO UPDATE SET
    granted_by              = EXCLUDED.granted_by,
    perm_view_members       = EXCLUDED.perm_view_members,
    perm_edit_members       = EXCLUDED.perm_edit_members,
    perm_manage_members     = EXCLUDED.perm_manage_members,
    perm_export_members     = EXCLUDED.perm_export_members,
    perm_view_sponsors      = EXCLUDED.perm_view_sponsors,
    perm_verify_sponsors    = EXCLUDED.perm_verify_sponsors,
    perm_manage_sponsors    = EXCLUDED.perm_manage_sponsors,
    perm_export_sponsors    = EXCLUDED.perm_export_sponsors,
    perm_view_support       = EXCLUDED.perm_view_support,
    perm_manage_support     = EXCLUDED.perm_manage_support,
    perm_manage_departments = EXCLUDED.perm_manage_departments,
    perm_manage_projects    = EXCLUDED.perm_manage_projects,
    perm_manage_merchandise = EXCLUDED.perm_manage_merchandise,
    perm_manage_media       = EXCLUDED.perm_manage_media,
    perm_manage_content     = EXCLUDED.perm_manage_content,
    perm_view_admins        = EXCLUDED.perm_view_admins,
    perm_manage_admins      = EXCLUDED.perm_manage_admins,
    perm_full_admin         = EXCLUDED.perm_full_admin,
    updated_at              = CURRENT_TIMESTAMP;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_admin_permissions(UUID, JSONB) TO authenticated;

-- ── 3. insert_permission_audit() — audit log RPC ──────────────
CREATE OR REPLACE FUNCTION public.insert_permission_audit(
  rows JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  caller_is_super BOOLEAN;
  caller_can_manage BOOLEAN;
  r JSONB;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  SELECT is_super_admin INTO caller_is_super
  FROM public.profiles WHERE id = caller_id;

  SELECT (perm_manage_admins OR perm_full_admin) INTO caller_can_manage
  FROM public.admin_permissions WHERE profile_id = caller_id;

  IF NOT (COALESCE(caller_is_super, false) OR COALESCE(caller_can_manage, false)) THEN
    RETURN jsonb_build_object('error', 'permission_denied');
  END IF;

  FOR r IN SELECT * FROM jsonb_array_elements(rows)
  LOOP
    INSERT INTO public.admin_permission_audit (
      target_profile_id, target_name,
      granted_by_id, granted_by_name,
      action, permission_key,
      previous_value, new_value, notes
    ) VALUES (
      (r->>'target_profile_id')::UUID,
      r->>'target_name',
      (r->>'granted_by_id')::UUID,
      r->>'granted_by_name',
      r->>'action',
      r->>'permission_key',
      r->>'previous_value',
      r->>'new_value',
      r->>'notes'
    );
  END LOOP;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_permission_audit(JSONB) TO authenticated;
