-- ============================================================
-- Migration 007: Sponsorship Payment & Verification System
--
-- Adds:
--   payment_methods          — admin-managed payment instructions
--   Extends sponsorship_records with:
--     verification_status    — pending_verification | current | former | unverified
--     transaction fields     — ref, amount_sent, payment_date, payment_method_id
--     verification fields    — verified_by, verified_at, verification_notes
--     sponsor contact fields — merch_size, merch_quantity (were missing)
--
-- Architecture note:
--   Manual verification flow:
--     public submits → pending_verification
--     admin checks MTN/bank records → marks current
--   Future API integration point:
--     MTN/bank webhook → auto set pending → auto verify → current
--   The verification_status column is the single source of truth.
-- ============================================================

-- ── 1. payment_methods ────────────────────────────────────────
-- Admin-managed table. Never hard-code payment numbers in code.
-- Admins update these via the admin dashboard.
CREATE TABLE IF NOT EXISTS payment_methods (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name             TEXT NOT NULL,             -- e.g. "MTN Mobile Money"
  provider         TEXT,                      -- e.g. "MTN Uganda"
  account_number   TEXT,                      -- e.g. "0779 340 046"
  account_name     TEXT,                      -- e.g. "Ministry Contact"
  bank_name        TEXT,                      -- for bank transfers
  instructions     TEXT,                      -- step-by-step instructions shown to user
  is_active        BOOLEAN NOT NULL DEFAULT true,
  display_order    INTEGER DEFAULT 0,         -- controls display order on the form

  -- Future API integration fields (nullable for now)
  api_provider     TEXT,                      -- e.g. 'mtn_momo', 'airtel_money', 'bank'
  api_enabled      BOOLEAN NOT NULL DEFAULT false,

  created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_payment_methods_timestamp ON payment_methods;
CREATE TRIGGER update_payment_methods_timestamp
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Anyone can READ active payment methods (needed for the public registration wizard)
DROP POLICY IF EXISTS "Anyone can view active payment methods" ON payment_methods;
CREATE POLICY "Anyone can view active payment methods"
  ON payment_methods FOR SELECT
  USING (is_active = true);

-- Only admins can manage (INSERT/UPDATE/DELETE) payment methods
DROP POLICY IF EXISTS "Admins can manage payment methods" ON payment_methods;
CREATE POLICY "Admins can manage payment methods"
  ON payment_methods FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id   = auth.uid()
      AND   profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id   = auth.uid()
      AND   profiles.role = 'admin'
    )
  );

-- ── 2. Seed default payment methods ───────────────────────────
-- These are placeholders. Admins update them via the dashboard.
-- Using INSERT ... ON CONFLICT DO NOTHING so re-running is safe.
INSERT INTO payment_methods (name, provider, account_number, account_name, instructions, display_order)
VALUES
  (
    'MTN Mobile Money',
    'MTN Uganda',
    '0779 340 046',
    'Ministry Contact',
    'Dial *165# → Send Money → Enter number 0779340046 → Enter amount → Enter your PIN → Confirm. Save the transaction ID shown on screen.',
    1
  ),
  (
    'Airtel Money',
    'Airtel Uganda',
    '0704 812 493',
    'Ministry Contact',
    'Dial *185# → Send Money → Enter number 0704812493 → Enter amount → Enter your PIN → Confirm. Save the transaction ID shown on screen.',
    2
  ),
  (
    'Bank Transfer',
    'ABSA Bank Uganda',
    '6007927566',
    'Personal account (temporary)',
    'Transfer to ABSA Bank Uganda, Account Number: 6007927566. Use your name and "TCM Support" as the reference. Keep your bank receipt or transaction reference.',
    3
  )
ON CONFLICT DO NOTHING;

-- ── 3. Extend sponsorship_records ─────────────────────────────
-- Add all fields needed for the public registration + verification workflow.

-- Verification status (the core new field)
ALTER TABLE sponsorship_records
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending_verification'
    CHECK (verification_status IN (
      'pending_verification',   -- submitted, awaiting admin check
      'current',                -- verified and active
      'former',                 -- was active, now ended
      'unverified'              -- admin checked, could not verify
    ));

-- Payment / transaction fields
ALTER TABLE sponsorship_records
  ADD COLUMN IF NOT EXISTS payment_method_id   UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS transaction_ref     TEXT,          -- reference/ID from mobile money or bank
  ADD COLUMN IF NOT EXISTS amount_sent         TEXT,          -- amount the user claims to have sent
  ADD COLUMN IF NOT EXISTS payment_date        DATE,          -- date support was reportedly sent
  ADD COLUMN IF NOT EXISTS sender_name         TEXT,          -- name on the sending account
  ADD COLUMN IF NOT EXISTS payment_notes       TEXT;          -- any extra payment info from user

-- Merchandise fields (were missing from 006)
ALTER TABLE sponsorship_records
  ADD COLUMN IF NOT EXISTS merch_size          TEXT
    CHECK (merch_size IN ('XS','S','M','L','XL','XXL') OR merch_size IS NULL),
  ADD COLUMN IF NOT EXISTS merch_quantity      INTEGER DEFAULT 1;

-- Verification fields (admin-only, filled when admin verifies)
ALTER TABLE sponsorship_records
  ADD COLUMN IF NOT EXISTS verified_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at         TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS verification_notes  TEXT;

-- Unique submission reference ID shown to the user after submission
ALTER TABLE sponsorship_records
  ADD COLUMN IF NOT EXISTS submission_ref      TEXT UNIQUE;

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_sponsorship_records_verification
  ON sponsorship_records(verification_status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_records_payment_method
  ON sponsorship_records(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_records_submission_ref
  ON sponsorship_records(submission_ref);

-- ── 4. Extend sponsors ────────────────────────────────────────
-- Allow public (unauthenticated) INSERT so anyone can register as a sponsor
-- without needing a member account.

DROP POLICY IF EXISTS "Admins can manage sponsors"       ON sponsors;
DROP POLICY IF EXISTS "Members can view own sponsor record" ON sponsors;
DROP POLICY IF EXISTS "Public can insert sponsor"        ON sponsors;

-- Admin full access
CREATE POLICY "Admins can manage sponsors"
  ON sponsors FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Anyone can INSERT a new sponsor (public registration wizard)
CREATE POLICY "Public can insert sponsor"
  ON sponsors FOR INSERT
  WITH CHECK (true);

-- Linked members can view their own record
CREATE POLICY "Members can view own sponsor record"
  ON sponsors FOR SELECT
  USING (profile_id = auth.uid());

-- ── 5. Extend sponsorship_records RLS ─────────────────────────
-- Allow public INSERT (anyone submitting the wizard)
DROP POLICY IF EXISTS "Admins can manage sponsorship records"    ON sponsorship_records;
DROP POLICY IF EXISTS "Members can view own sponsorship records" ON sponsorship_records;
DROP POLICY IF EXISTS "Public can insert sponsorship record"     ON sponsorship_records;

-- Admin full access
CREATE POLICY "Admins can manage sponsorship records"
  ON sponsorship_records FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Anyone can INSERT a new sponsorship record
CREATE POLICY "Public can insert sponsorship record"
  ON sponsorship_records FOR INSERT
  WITH CHECK (true);

-- Linked members can view their own records
CREATE POLICY "Members can view own sponsorship records"
  ON sponsorship_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sponsors
      WHERE sponsors.id         = sponsorship_records.sponsor_id
      AND   sponsors.profile_id = auth.uid()
    )
  );

-- ── 6. sponsorship_history: allow public INSERT ───────────────
DROP POLICY IF EXISTS "Admins can manage sponsorship history"    ON sponsorship_history;
DROP POLICY IF EXISTS "Members can view own sponsorship history" ON sponsorship_history;
DROP POLICY IF EXISTS "Public can insert sponsorship history"    ON sponsorship_history;

CREATE POLICY "Admins can manage sponsorship history"
  ON sponsorship_history FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Public can insert sponsorship history"
  ON sponsorship_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Members can view own sponsorship history"
  ON sponsorship_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sponsors
      WHERE sponsors.id         = sponsorship_history.sponsor_id
      AND   sponsors.profile_id = auth.uid()
    )
  );
