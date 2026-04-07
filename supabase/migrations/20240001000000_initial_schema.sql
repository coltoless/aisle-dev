-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- COUPLES
-- ─────────────────────────────────────────────
CREATE TABLE couples (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner1_name   text NOT NULL,
  partner2_name   text NOT NULL,
  email           text NOT NULL,
  created_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own couple record"
  ON couples FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own couple record"
  ON couples FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own couple record"
  ON couples FOR UPDATE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- WEDDING PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE wedding_profiles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id         uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  wedding_date      date,
  location_city     text,
  location_state    text,
  location_country  text DEFAULT 'US' NOT NULL,
  guest_count_range text CHECK (guest_count_range IN ('under_50','50_100','100_150','150_200','200_plus')),
  budget_range      text CHECK (budget_range IN ('under_15k','15k_30k','30k_50k','50k_75k','75k_100k','100k_plus')),
  budget_exact      integer CHECK (budget_exact > 0),
  style_tags        text[] DEFAULT '{}' NOT NULL,
  priorities        text[] DEFAULT '{}' NOT NULL,
  onboarding_complete boolean DEFAULT false NOT NULL,
  created_at        timestamptz DEFAULT now() NOT NULL,
  updated_at        timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE wedding_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can view their own wedding profile"
  ON wedding_profiles FOR SELECT
  USING (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));

CREATE POLICY "Couples can insert their own wedding profile"
  ON wedding_profiles FOR INSERT
  WITH CHECK (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));

CREATE POLICY "Couples can update their own wedding profile"
  ON wedding_profiles FOR UPDATE
  USING (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- CHECKLIST ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE checklist_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id       uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  title           text NOT NULL,
  category        text NOT NULL CHECK (category IN ('venue','vendors','attire','legal','logistics','guests','decor','food_beverage','ceremony','travel','admin')),
  phase           text NOT NULL CHECK (phase IN ('12_plus_months','9_12_months','6_9_months','3_6_months','1_3_months','final_month','week_of','day_of')),
  due_date        date,
  completed       boolean DEFAULT false NOT NULL,
  completed_at    timestamptz,
  snoozed_until   date,
  notes           text,
  is_custom       boolean DEFAULT false NOT NULL,
  sort_order      integer DEFAULT 0 NOT NULL,
  created_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can manage their own checklist"
  ON checklist_items FOR ALL
  USING (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));

CREATE INDEX idx_checklist_couple_id ON checklist_items(couple_id);
CREATE INDEX idx_checklist_phase ON checklist_items(phase);
CREATE INDEX idx_checklist_completed ON checklist_items(completed);

-- ─────────────────────────────────────────────
-- BUDGET ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE budget_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id         uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  category          text NOT NULL,
  category_label    text NOT NULL,
  estimated_cost    integer CHECK (estimated_cost >= 0),
  quoted_cost       integer CHECK (quoted_cost >= 0),
  deposit_paid      integer CHECK (deposit_paid >= 0),
  balance_due       integer CHECK (balance_due >= 0),
  balance_due_date  date,
  notes             text,
  sort_order        integer DEFAULT 0 NOT NULL,
  created_at        timestamptz DEFAULT now() NOT NULL,
  updated_at        timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can manage their own budget"
  ON budget_items FOR ALL
  USING (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));

CREATE INDEX idx_budget_couple_id ON budget_items(couple_id);

-- ─────────────────────────────────────────────
-- VENDORS
-- ─────────────────────────────────────────────
CREATE TABLE vendors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id       uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  category        text NOT NULL,
  company_name    text,
  contact_name    text,
  email           text,
  phone           text,
  website         text,
  status          text DEFAULT 'researching' NOT NULL CHECK (status IN ('researching','contacted','quoted','booked','paid')),
  contract_uploaded boolean DEFAULT false NOT NULL,
  notes           text,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can manage their own vendors"
  ON vendors FOR ALL
  USING (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));

CREATE INDEX idx_vendors_couple_id ON vendors(couple_id);
CREATE INDEX idx_vendors_status ON vendors(status);

-- ─────────────────────────────────────────────
-- CONTRACTS
-- ─────────────────────────────────────────────
CREATE TABLE contracts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id         uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  vendor_id         uuid REFERENCES vendors(id) ON DELETE SET NULL,
  vendor_name       text NOT NULL,
  file_path         text NOT NULL,
  file_name         text NOT NULL,
  contract_value    integer CHECK (contract_value >= 0),
  deposit_amount    integer CHECK (deposit_amount >= 0),
  deposit_due_date  date,
  balance_due_date  date,
  signed            boolean DEFAULT false NOT NULL,
  ai_review_notes   text,
  ai_reviewed_at    timestamptz,
  uploaded_at       timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can manage their own contracts"
  ON contracts FOR ALL
  USING (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));

CREATE INDEX idx_contracts_couple_id ON contracts(couple_id);

-- ─────────────────────────────────────────────
-- VENUES
-- ─────────────────────────────────────────────
CREATE TABLE venues (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id             uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  name                  text NOT NULL,
  location              text,
  venue_type            text,
  estimated_price_low   integer CHECK (estimated_price_low >= 0),
  estimated_price_high  integer CHECK (estimated_price_high >= 0),
  description           text,
  website               text,
  style_tags            text[] DEFAULT '{}' NOT NULL,
  status                text DEFAULT 'considering' NOT NULL CHECK (status IN ('considering','dismissed','booked')),
  notes                 text,
  created_at            timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can manage their own venues"
  ON venues FOR ALL
  USING (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));

CREATE INDEX idx_venues_couple_id ON venues(couple_id);

-- ─────────────────────────────────────────────
-- AI CONVERSATIONS
-- ─────────────────────────────────────────────
CREATE TABLE ai_conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id   uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  role        text NOT NULL CHECK (role IN ('user','assistant')),
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can manage their own conversations"
  ON ai_conversations FOR ALL
  USING (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));

CREATE INDEX idx_conversations_couple_id ON ai_conversations(couple_id);
CREATE INDEX idx_conversations_created_at ON ai_conversations(created_at);

-- ─────────────────────────────────────────────
-- BUDGET FLAGS (raised by AI buddy)
-- ─────────────────────────────────────────────
CREATE TABLE budget_flags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id   uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  category    text NOT NULL,
  reason      text NOT NULL,
  severity    text NOT NULL CHECK (severity IN ('info','warning','critical')),
  resolved    boolean DEFAULT false NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE budget_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can manage their own budget flags"
  ON budget_flags FOR ALL
  USING (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER (reusable)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_wedding_profiles_updated_at
  BEFORE UPDATE ON wedding_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_budget_items_updated_at
  BEFORE UPDATE ON budget_items
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
