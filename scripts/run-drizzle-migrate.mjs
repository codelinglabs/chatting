import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

config({ path: ".env", quiet: true });
config({ path: ".env.local", override: true, quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL_NOT_CONFIGURED");
}

const migrationsFolder = path.join(process.cwd(), "drizzle");
const journalPath = path.join(migrationsFolder, "meta", "_journal.json");
const legacyAppTables = ["users", "sites", "conversations", "messages"];
const pool = new pg.Pool({
  connectionString: databaseUrl
});

async function ensureMigrationStore() {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS drizzle;`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      created_at BIGINT NOT NULL
    );
  `);
}

async function hasAppliedDrizzleMigrations() {
  const result = await pool.query(`SELECT COUNT(*)::text AS count FROM drizzle.__drizzle_migrations;`);
  return Number(result.rows[0]?.count ?? "0") > 0;
}

async function hasLegacyApplicationSchema() {
  const result = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = ANY ($1::text[])
      ) AS exists;
    `,
    [legacyAppTables]
  );

  return result.rows[0]?.exists ?? false;
}

async function readBaselineEntry() {
  const journal = JSON.parse(await readFile(journalPath, "utf8"));
  return journal.entries?.[0] ?? null;
}

async function hashMigration(tag) {
  const sql = await readFile(path.join(migrationsFolder, `${tag}.sql`));
  return createHash("sha256").update(sql).digest("hex");
}

async function syncBaselineMigration() {
  const baselineEntry = await readBaselineEntry();

  if (!baselineEntry?.tag) {
    return;
  }

  const expectedHash = await hashMigration(baselineEntry.tag);
  const expectedCreatedAt = String(baselineEntry.when ?? Date.now());
  const result = await pool.query(`
    SELECT id, hash, created_at::text AS created_at
    FROM drizzle.__drizzle_migrations
    ORDER BY id ASC
    LIMIT 1;
  `);

  const firstMigration = result.rows[0];

  if (!firstMigration) {
    return;
  }

  if (
    firstMigration.hash === expectedHash &&
    firstMigration.created_at === expectedCreatedAt
  ) {
    return;
  }

  await pool.query(
    `
      UPDATE drizzle.__drizzle_migrations
      SET hash = $2, created_at = $3
      WHERE id = $1;
    `,
    [firstMigration.id, expectedHash, expectedCreatedAt]
  );
}

async function seedLegacyBaseline() {
  const [hasMigrations, hasLegacySchema] = await Promise.all([
    hasAppliedDrizzleMigrations(),
    hasLegacyApplicationSchema()
  ]);

  if (hasMigrations || !hasLegacySchema) {
    return;
  }

  const baselineEntry = await readBaselineEntry();

  if (!baselineEntry?.tag) {
    return;
  }

  await pool.query(
    `INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2);`,
    [
      await hashMigration(baselineEntry.tag),
      String(baselineEntry.when ?? Date.now())
    ]
  );
}

try {
  await ensureMigrationStore();
  await seedLegacyBaseline();
  await syncBaselineMigration();
  await migrate(drizzle(pool), {
    migrationsFolder
  });

  console.log("Applied Drizzle migrations.");
} finally {
  await pool.end();
}
