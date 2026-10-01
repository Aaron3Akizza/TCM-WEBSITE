-- ============================================================
-- Migration 005: Support Requests
-- Stores ministry support / merchandise interest submissions
-- from the public Support page.
-- ============================================================

-- Support type enum values (stored as text with CHECK)
-- support_type: 'ministry_department' | 'merchandise' | 'general' | 'other'
-- status:       'new' | 'contacted' | 'processing' | 'completed'

CREATE TABLE IF NOT EXISTS support_requests (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Supporter contact
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,

  -- Support classification
  support_type     TEXT NOT NULL
    CHECK (support_type IN ('ministry_department','merchandise','general','other')),

  -- Ministry department (when support_type = 'ministry_department')
  department       TEXT,

  -- Merchandise fields (when support_type = 'merchandise')
  merch_item       TEXT,
  merch_size       TEXT
    CHECK (merch_size IN ('XS','S','M','L','XL','XXL') OR merch_size IS NULL),
  merch_quantity   INTEGER DEFAULT 1,

  -- Financial / general
  amount           TEXT,              -- free-text e.g. "20,000 UGX" or "10 USD"
  other_details    TEXT,              -- free-text for 'other' type or extra notes
  message          TEXT,              -- general message / notes

  -- Admin workflow
  status           TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','processing','completed')),
  admin_notes      TEXT,

  -- Timestamps
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Auto-update updated_at on every change
DROP TRIGGER IF EXISTS update_support_requests_timestamp ON support_requests;
CREATE TRIGGER update_support_requests_timestamp
  BEFORE UPDATE ON support_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_requests_status      ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_support_type ON support_requests(support_type);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at  ON support_requests(created_at DESC);

-- Enable RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can submit a support request
DROP POLICY IF EXISTS "Anyone can submit support requests" ON support_requests;
CREATE POLICY "Anyone can submit support requests"
  ON support_requests FOR INSERT
  WITH CHECK (true);

-- Only service_role (admin dashboard via Supabase dashboard or admin API) can read/update
-- Regular users / anon key cannot read the submissions list
-- Admins use the Supabase dashboard or a protected admin page that checks role = 'admin'
DROP POLICY IF EXISTS "Admins can view support requests" ON support_requests;
CREATE POLICY "Admins can view support requests"
  ON support_requests FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update support request status" ON support_requests;
CREATE POLICY "Admins can update support request status"
  ON support_requests FOR UPDATE
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
