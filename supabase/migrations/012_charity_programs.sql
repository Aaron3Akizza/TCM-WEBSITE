-- ============================================================
-- Migration 012: Charity Programs & Activities
-- ============================================================

CREATE TABLE IF NOT EXISTS charity_programs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('seed_project','outreach','community','equipment','conference','education','medical','other')),
  status        TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned','active','completed','cancelled')),
  target_amount TEXT,
  amount_raised TEXT,
  start_date    DATE,
  end_date      DATE,
  location      TEXT,
  beneficiaries TEXT,
  notes         TEXT,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_charity_programs_timestamp ON charity_programs;
CREATE TRIGGER update_charity_programs_timestamp
  BEFORE UPDATE ON charity_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_charity_programs_status   ON charity_programs(status);
CREATE INDEX IF NOT EXISTS idx_charity_programs_category ON charity_programs(category);

ALTER TABLE charity_programs ENABLE ROW LEVEL SECURITY;

-- Public can view active/completed programs (for the public charity page)
DROP POLICY IF EXISTS "public_view_charity" ON charity_programs;
CREATE POLICY "public_view_charity"
  ON charity_programs FOR SELECT
  USING (status IN ('active', 'completed'));

-- Admins can do everything
DROP POLICY IF EXISTS "admins_manage_charity" ON charity_programs;
CREATE POLICY "admins_manage_charity"
  ON charity_programs FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true))
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true))
  );
