DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'conversations'
      AND indexdef ILIKE '%(site_id, lower(COALESCE(email, %'
  ) THEN
    EXECUTE '
      CREATE INDEX "idx_conversations_site_email_lookup_v2"
      ON "conversations" ("site_id", (LOWER(COALESCE("email", ''''))))
    ';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'visitor_presence_sessions'
      AND indexdef ILIKE '%(site_id, lower(COALESCE(email, %'
  ) THEN
    EXECUTE '
      CREATE INDEX "idx_visitor_presence_sessions_email_lookup_v2"
      ON "visitor_presence_sessions" ("site_id", (LOWER(COALESCE("email", ''''))))
    ';
  END IF;
END
$$;
