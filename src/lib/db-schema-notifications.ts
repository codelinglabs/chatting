import type { Pool } from "pg";

export async function runNotificationSchemaInitialization(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_digest_deliveries (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      digest_date DATE NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, digest_date)
    );

    CREATE TABLE IF NOT EXISTS weekly_performance_deliveries (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      week_start DATE NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, week_start)
    );
  `);
}
