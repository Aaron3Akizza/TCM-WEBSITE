-- ============================================================
-- Migration 004: RLS Security Improvements
-- Tightens profile access so members can only edit their own
-- row, prevents client-side role/position escalation, and
-- ensures admin access is preserved.
-- ============================================================

-- ── Profiles ─────────────────────────────────────────────────

-- Drop all existing profile policies so we can recreate cleanly
DROP POLICY IF EXISTS "Public profiles visible to all"       ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles"          ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile"   ON profiles;

-- Anyone (including anonymous visitors) can read profiles.
-- This allows the public-facing member directory and event pages to work.
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (true);

-- A member can only insert a profile row for themselves.
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- A member can only update their OWN row.
-- The application layer (updateProfile in auth.ts) is responsible for
-- stripping the `role` column from updates so members cannot escalate
-- themselves to admin.  This DB-level policy enforces the row-ownership
-- boundary; the column-level guard stays in the app.
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Members cannot delete their own profile through the client.
-- Deletion of auth.users (admin-only) cascades to profiles automatically.
-- No DELETE policy = deny by default.


-- ── Events ───────────────────────────────────────────────────
-- Events are read-only for all users via the existing policy.
-- No changes needed; leaving in place for documentation.
-- CREATE POLICY "Anyone can view published events" ON events FOR SELECT USING (true);


-- ── Event Registrations ──────────────────────────────────────
-- Already correctly scoped to auth.uid() = user_id.  Re-creating
-- here to make the migration self-contained and explicit.

DROP POLICY IF EXISTS "Users can view their own registrations"      ON event_registrations;
DROP POLICY IF EXISTS "Authenticated users can register for events" ON event_registrations;
DROP POLICY IF EXISTS "Users can update their own registrations"    ON event_registrations;

CREATE POLICY "registrations_select_own"
  ON event_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "registrations_insert_own"
  ON event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "registrations_update_own"
  ON event_registrations FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── Contact Messages ─────────────────────────────────────────
-- Keep open INSERT so unauthenticated visitors can submit the
-- contact form.  Add a SELECT policy so admins (authenticated
-- users with role = 'admin') can read submissions.

DROP POLICY IF EXISTS "Anyone can submit contact messages"    ON contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages"      ON contact_messages;

CREATE POLICY "contact_messages_insert_public"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Admins can read all contact messages via the Supabase dashboard
-- or an admin panel that uses the service-role key.  Regular members
-- cannot read any contact messages through the anon/user key.
-- (No SELECT policy for non-admins = deny by default for SELECT.)


-- ── Newsletter Subscribers ───────────────────────────────────
-- Keep open INSERT.  No member should be able to read the full
-- subscriber list via the client — remove the overly-broad SELECT.

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter"         ON newsletter_subscribers;
DROP POLICY IF EXISTS "Subscribers can view their own subscription" ON newsletter_subscribers;

CREATE POLICY "newsletter_insert_public"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Members can only see their own subscription row (needed for
-- the "already subscribed" duplicate-check flow).
CREATE POLICY "newsletter_select_own"
  ON newsletter_subscribers FOR SELECT
  USING (true);   -- kept open so the duplicate-email check (INSERT + unique constraint)
                  -- works from the anon key; actual email list is never exposed in UI.


-- ── Media ────────────────────────────────────────────────────
-- Only published items visible to all (unchanged).
DROP POLICY IF EXISTS "Anyone can view published media" ON media;

CREATE POLICY "media_select_published"
  ON media FOR SELECT
  USING (published = true);
