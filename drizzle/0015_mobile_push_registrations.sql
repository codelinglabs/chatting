CREATE TABLE IF NOT EXISTS mobile_push_registrations (
  id text PRIMARY KEY,
  site_id text NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  conversation_id text REFERENCES conversations(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  provider text NOT NULL DEFAULT 'expo',
  platform text,
  app_id text,
  push_token text NOT NULL,
  disabled_at timestamptz,
  last_seen_at timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT mobile_push_registrations_provider_check CHECK (provider = ANY (ARRAY['expo'::text]))
);

CREATE UNIQUE INDEX IF NOT EXISTS mobile_push_registrations_push_token_key
  ON mobile_push_registrations (push_token);

CREATE INDEX IF NOT EXISTS idx_mobile_push_registrations_conversation
  ON mobile_push_registrations (conversation_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_mobile_push_registrations_site_session
  ON mobile_push_registrations (site_id, session_id, updated_at DESC);
