import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __chatlyPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __chatlySchemaReady: Promise<void> | undefined;
}

function getConnectionString() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return value;
}

function createPool() {
  return new Pool({
    connectionString: getConnectionString(),
    ssl:
      process.env.DATABASE_SSL === "require"
        ? { rejectUnauthorized: false }
        : undefined
  });
}

export function getPool() {
  if (!global.__chatlyPool) {
    global.__chatlyPool = createPool();
  }

  return global.__chatlyPool;
}

async function initSchema() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      domain TEXT,
      brand_color TEXT NOT NULL DEFAULT '#0f766e',
      greeting_text TEXT NOT NULL DEFAULT 'Ask us anything before you bounce',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      email TEXT,
      session_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender TEXT NOT NULL CHECK (sender IN ('user', 'founder')),
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversation_metadata (
      conversation_id TEXT PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE,
      page_url TEXT,
      referrer TEXT,
      user_agent TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      conversation_id TEXT PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE,
      helpful BOOLEAN NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tags (
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      tag TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (conversation_id, tag)
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_users_email
      ON users(email);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_token_hash
      ON auth_sessions(token_hash);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_sites_user_id
      ON sites(user_id, created_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
      ON conversations(updated_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_conversations_site_id
      ON conversations(site_id, updated_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at
      ON messages(conversation_id, created_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_tags_conversation_id
      ON tags(conversation_id);
  `);
}

export async function ensureSchema() {
  if (!global.__chatlySchemaReady) {
    global.__chatlySchemaReady = initSchema();
  }

  await global.__chatlySchemaReady;
}

export async function query<T extends QueryResultRow>(text: string, values?: unknown[]) {
  await ensureSchema();
  return getPool().query<T>(text, values);
}
