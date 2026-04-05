const { spawnSync } = require("node:child_process");
const fsp = require("node:fs/promises");
const path = require("node:path");

const migrationTag = "0000_initial_schema";
const migrationWhen = Date.UTC(2026, 3, 4, 0, 0, 0);
const projectRoot = process.cwd();
const migrationsDir = path.join(projectRoot, "drizzle");
const metaDir = path.join(migrationsDir, "meta");
const journalPath = path.join(metaDir, "_journal.json");
const migrationPath = path.join(migrationsDir, `${migrationTag}.sql`);

async function assertMigrationFolderIsEmpty() {
  try {
    const existing = JSON.parse(await fsp.readFile(journalPath, "utf8"));
    const canOverwriteBaseline =
      Array.isArray(existing.entries) &&
      existing.entries.length === 1 &&
      existing.entries[0]?.tag === migrationTag;

    if (Array.isArray(existing.entries) && existing.entries.length > 0 && !canOverwriteBaseline) {
      throw new Error("Drizzle migrations already exist. Refusing to overwrite them.");
    }
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return;
    }

    throw error;
  }
}

function exportSchemaSql() {
  const result = spawnSync(
    path.join(projectRoot, "node_modules/.bin/drizzle-kit"),
    ["export", "--config", "drizzle.config.ts"],
    {
      cwd: projectRoot,
      encoding: "utf8"
    }
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "drizzle-kit export failed");
  }

  return result.stdout.trim().concat("\n");
}

async function main() {
  await assertMigrationFolderIsEmpty();
  await fsp.mkdir(metaDir, { recursive: true });

  const sql = exportSchemaSql();

  await fsp.writeFile(migrationPath, sql);
  await fsp.writeFile(
    journalPath,
    `${JSON.stringify(
      {
        version: "7",
        dialect: "postgresql",
        entries: [
          {
            idx: 0,
            version: "7",
            when: migrationWhen,
            tag: migrationTag,
            breakpoints: false
          }
        ]
      },
      null,
      2
    )}\n`
  );

  console.log(`Wrote ${path.relative(projectRoot, migrationPath)} baseline migration.`);
}

void main();
