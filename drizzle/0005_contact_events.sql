CREATE TABLE IF NOT EXISTS "contact_events" (
  "id" text PRIMARY KEY NOT NULL,
  "owner_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "site_id" text REFERENCES "sites"("id") ON DELETE SET NULL,
  "contact_email" text,
  "event_type" text NOT NULL,
  "actor_user_id" text REFERENCES "users"("id") ON DELETE SET NULL,
  "metadata_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "contact_events_owner_created_at_idx"
  ON "contact_events" ("owner_user_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "contact_events_event_type_created_at_idx"
  ON "contact_events" ("event_type", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "contact_events_site_email_created_at_idx"
  ON "contact_events" ("site_id", "contact_email", "created_at" DESC);
