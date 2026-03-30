import type { Pool } from "pg";

export async function runVisitorPresenceSchemaInitialization(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visitor_presence_sessions (
      site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      session_id TEXT NOT NULL,
      conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL,
      email TEXT,
      current_page_url TEXT,
      referrer TEXT,
      user_agent TEXT,
      country TEXT,
      region TEXT,
      city TEXT,
      timezone TEXT,
      locale TEXT,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (site_id, session_id)
    );
  `);

  await pool.query(`
    ALTER TABLE visitor_presence_sessions
    ADD COLUMN IF NOT EXISTS conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL;
  `);

  await pool.query(`
    ALTER TABLE visitor_presence_sessions
    ADD COLUMN IF NOT EXISTS email TEXT;
  `);

  await pool.query(`
    ALTER TABLE visitor_presence_sessions
    ADD COLUMN IF NOT EXISTS current_page_url TEXT;
  `);

  await pool.query(`
    ALTER TABLE visitor_presence_sessions
    ADD COLUMN IF NOT EXISTS referrer TEXT;
  `);

  await pool.query(`
    ALTER TABLE visitor_presence_sessions
    ADD COLUMN IF NOT EXISTS user_agent TEXT;
  `);

  await pool.query(`
    ALTER TABLE visitor_presence_sessions
    ADD COLUMN IF NOT EXISTS country TEXT;
  `);

  await pool.query(`
    ALTER TABLE visitor_presence_sessions
    ADD COLUMN IF NOT EXISTS region TEXT;
  `);

  await pool.query(`
    ALTER TABLE visitor_presence_sessions
    ADD COLUMN IF NOT EXISTS city TEXT;
  `);

  await pool.query(`
    ALTER TABLE visitor_presence_sessions
    ADD COLUMN IF NOT EXISTS timezone TEXT;
  `);

  await pool.query(`
    ALTER TABLE visitor_presence_sessions
    ADD COLUMN IF NOT EXISTS locale TEXT;
  `);

  await pool.query(`
    ALTER TABLE visitor_presence_sessions
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  `);

  await pool.query(`
    ALTER TABLE visitor_presence_sessions
    ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  `);
}
