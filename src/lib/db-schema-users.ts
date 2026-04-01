import type { Pool } from "pg";

export async function runUserSchemaInitialization(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      onboarding_step TEXT NOT NULL DEFAULT 'done',
      onboarding_completed_at TIMESTAMPTZ,
      owner_onboarding_stage TEXT NOT NULL DEFAULT 'complete',
      owner_onboarding_site_domain TEXT,
      owner_onboarding_referral_code TEXT,
      email_verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS onboarding_step TEXT NOT NULL DEFAULT 'done';
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS owner_onboarding_stage TEXT NOT NULL DEFAULT 'complete';
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS owner_onboarding_site_domain TEXT;
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS owner_onboarding_referral_code TEXT;
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
  `);

  await pool.query(`
    ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_onboarding_step_check;
  `);

  await pool.query(`
    ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_owner_onboarding_stage_check;
  `);

  await pool.query(`
    ALTER TABLE users
    ADD CONSTRAINT users_onboarding_step_check
    CHECK (onboarding_step IN ('signup', 'team', 'customize', 'install', 'done'));
  `);

  await pool.query(`
    ALTER TABLE users
    ADD CONSTRAINT users_owner_onboarding_stage_check
    CHECK (owner_onboarding_stage IN ('account_created', 'site_created', 'billing_ready', 'referral_applied', 'complete'));
  `);

  await pool.query(`
    UPDATE users
    SET onboarding_completed_at = COALESCE(onboarding_completed_at, created_at)
    WHERE onboarding_step = 'done'
      AND onboarding_completed_at IS NULL;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}
