import "server-only";

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { Pool } from "pg";

const migrationsFolder = path.join(process.cwd(), "drizzle");
const journalPath = path.join(migrationsFolder, "meta", "_journal.json");
const legacyAppTables = ["users", "sites", "conversations", "messages"] as const;

type MigrationJournal = {
  entries?: Array<{ tag?: string; when?: number }>;
};

async function ensureMigrationStore(pool: Pool) {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS drizzle;`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      created_at BIGINT NOT NULL
    );
  `);
}

async function hasAppliedDrizzleMigrations(pool: Pool) {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM drizzle.__drizzle_migrations;`
  );

  return Number(result.rows[0]?.count ?? "0") > 0;
}

async function hasLegacyApplicationSchema(pool: Pool) {
  const result = await pool.query<{ exists: boolean }>(
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
  const journal = JSON.parse(await readFile(journalPath, "utf8")) as MigrationJournal;
  return journal.entries?.[0] ?? null;
}

async function hashMigration(tag: string) {
  const sql = await readFile(path.join(migrationsFolder, `${tag}.sql`));
  return createHash("sha256").update(sql).digest("hex");
}

async function syncBaselineMigration(pool: Pool) {
  const baselineEntry = await readBaselineEntry();

  if (!baselineEntry?.tag) {
    return;
  }

  const expectedHash = await hashMigration(baselineEntry.tag);
  const expectedCreatedAt = String(baselineEntry.when ?? Date.now());
  const result = await pool.query<{ id: number; hash: string; created_at: string }>(
    `
      SELECT id, hash, created_at::text AS created_at
      FROM drizzle.__drizzle_migrations
      ORDER BY id ASC
      LIMIT 1;
    `
  );

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

async function seedLegacyBaseline(pool: Pool) {
  const [hasMigrations, hasLegacySchema] = await Promise.all([
    hasAppliedDrizzleMigrations(pool),
    hasLegacyApplicationSchema(pool)
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

export async function runDrizzleMigrations(pool: Pool) {
  await ensureMigrationStore(pool);
  await seedLegacyBaseline(pool);
  await syncBaselineMigration(pool);
  await migrate(drizzle(pool), {
    migrationsFolder
  });
}
