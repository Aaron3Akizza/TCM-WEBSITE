-- ============================================================
-- Migration 006: Sponsor Record Keeping
--
-- Design:
--   sponsors              — one row per person (the sponsor master record)
--   sponsorship_records   — one row per sponsorship engagement
--                           (a sponsor can have many records over time)
--   sponsorship_history   — immutable audit log of every status change
--
-- A sponsor is NOT the same as a registered member.
-- A person can be:
--   • A sponsor only (no Supabase auth account)
--   • A member only (registered but not a sponsor)
--   • Both (profile_id links the two)
-- ============================================================

-- ── 1. sponsors ───────────────────────────────────────────────
-- Master record for each individual sponsor.
-- One row per person regardless of how many things they sponsor.
CREATE TABLE IF NOT EXISTS sponsors (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  full_name        TEXT NOT NULL,
  email            TEXT,
  phone            TEXT,
  avatar_url       TEXT,                    -- optional profile photo

  -- Link to a registered member (optional)
  profile_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Sponsor classification
  sponsor_type     TEXT NOT NULL DEFAULT 'general'
    CHECK (sponsor_type IN ('general', 'department', 'project', 'merchandise', 'other')),

  -- Overall active/former status
  -- (individual sponsorship_records also carry their own status)
  is_active        BOOLEAN NOT NULL DEFAULT true,

  -- Admin notes about this person
  notes            TEXT,

  -- Timestamps
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. sponsorship_records ────────────────────────────────────
-- Each row = one sponsorship engagement for a sponsor.
-- One sponsor can have MANY records (different depts, different years).
CREATE TABLE IF NOT EXISTS sponsorship_records (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id       UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,

  -- What are they sponsoring?
  support_type     TEXT NOT NULL
    CHECK (support_type IN ('general', 'department', 'project', 'merchandise', 'other')),
  department       TEXT,                    -- maps to DEPARTMENTS values in Support.tsx
  project          TEXT,                    -- free-text project/activity name
  merch_item       TEXT,                    -- maps to MERCH_ITEMS values
  description      TEXT,                    -- free-text description of what is sponsored

  -- Financial
  amount           TEXT,                    -- free-text e.g. "50,000 UGX/month"
  frequency        TEXT
    CHECK (frequency IN ('one_time','monthly','quarterly','annual','other') OR frequency IS NULL),

  -- Status of THIS particular sponsorship
  status           TEXT NOT NULL DEFAULT 'current'
    CHECK (status IN ('current', 'former')),

  -- Dates
  start_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date         DATE,                    -- NULL = still active

  -- Notes
  notes            TEXT,
  admin_notes      TEXT,

  -- Timestamps
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. sponsorship_history ────────────────────────────────────
-- Immutable audit trail of every status change on a sponsorship_record.
-- Never update or delete rows in this table.
CREATE TABLE IF NOT EXISTS sponsorship_history (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsorship_record_id UUID NOT NULL REFERENCES sponsorship_records(id) ON DELETE CASCADE,
  sponsor_id            UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,

  -- What changed
  previous_status       TEXT,               -- NULL on first entry (creation)
  new_status            TEXT NOT NULL,
  change_note           TEXT,               -- admin's reason / comment for the change
  changed_by_admin_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- When
  changed_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sponsors_is_active        ON sponsors(is_active);
CREATE INDEX IF NOT EXISTS idx_sponsors_sponsor_type     ON sponsors(sponsor_type);
CREATE INDEX IF NOT EXISTS idx_sponsors_profile_id       ON sponsors(profile_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_records_sponsor  ON sponsorship_records(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_records_status   ON sponsorship_records(status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_records_dept     ON sponsorship_records(department);
CREATE INDEX IF NOT EXISTS idx_sponsorship_history_record   ON sponsorship_history(sponsorship_record_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_history_sponsor  ON sponsorship_history(sponsor_id);

-- ── Auto-update updated_at triggers ──────────────────────────
DROP TRIGGER IF EXISTS update_sponsors_timestamp ON sponsors;
CREATE TRIGGER update_sponsors_timestamp
  BEFORE UPDATE ON sponsors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sponsorship_records_timestamp ON sponsorship_records;
CREATE TRIGGER update_sponsorship_records_timestamp
  BEFORE UPDATE ON sponsorship_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Enable RLS ────────────────────────────────────────────────
ALTER TABLE sponsors             ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_history  ENABLE ROW LEVEL SECURITY;

-- ── RLS: sponsors ─────────────────────────────────────────────
-- Only admins can read/write sponsor records
DROP POLICY IF EXISTS "Admins can manage sponsors" ON sponsors;
CREATE POLICY "Admins can manage sponsors"
  ON sponsors FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND   profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND   profiles.role = 'admin'
    )
  );

-- A sponsor who is also a registered member can view their own record
DROP POLICY IF EXISTS "Members can view own sponsor record" ON sponsors;
CREATE POLICY "Members can view own sponsor record"
  ON sponsors FOR SELECT
  USING (profile_id = auth.uid());

-- ── RLS: sponsorship_records ──────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage sponsorship records" ON sponsorship_records;
CREATE POLICY "Admins can manage sponsorship records"
  ON sponsorship_records FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND   profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND   profiles.role = 'admin'
    )
  );

-- Members can view their own sponsorship records
DROP POLICY IF EXISTS "Members can view own sponsorship records" ON sponsorship_records;
CREATE POLICY "Members can view own sponsorship records"
  ON sponsorship_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sponsors
      WHERE sponsors.id         = sponsorship_records.sponsor_id
      AND   sponsors.profile_id = auth.uid()
    )
  );

-- ── RLS: sponsorship_history ──────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage sponsorship history" ON sponsorship_history;
CREATE POLICY "Admins can manage sponsorship history"
  ON sponsorship_history FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND   profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND   profiles.role = 'admin'
    )
  );

-- Members can view their own history
DROP POLICY IF EXISTS "Members can view own sponsorship history" ON sponsorship_history;
CREATE POLICY "Members can view own sponsorship history"
  ON sponsorship_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sponsors
      WHERE sponsors.id         = sponsorship_history.sponsor_id
      AND   sponsors.profile_id = auth.uid()
    )
  );
