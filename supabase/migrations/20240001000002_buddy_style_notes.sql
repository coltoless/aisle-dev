-- AI Buddy: persist chat mode per message; vision board notes on profile
ALTER TABLE ai_conversations
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'planning'
    CHECK (mode IN ('planning', 'vendor_email', 'vision_board', 'timeline'));

ALTER TABLE wedding_profiles
  ADD COLUMN IF NOT EXISTS style_notes text;
