import type { Pool } from "pg";

export async function runVisitorNotesSchemaInitialization(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visitor_notes (
      site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      identity_type TEXT NOT NULL CHECK (identity_type IN ('email', 'session')),
      identity_value TEXT NOT NULL,
      note TEXT NOT NULL,
      updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (site_id, identity_type, identity_value)
    );
  `);

  await pool.query(`
    ALTER TABLE visitor_notes
    ADD COLUMN IF NOT EXISTS note TEXT NOT NULL DEFAULT '';
  `);

  await pool.query(`
    ALTER TABLE visitor_notes
    ADD COLUMN IF NOT EXISTS updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
  `);

  await pool.query(`
    ALTER TABLE visitor_notes
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  `);

  await pool.query(`
    ALTER TABLE visitor_notes
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  `);
}
