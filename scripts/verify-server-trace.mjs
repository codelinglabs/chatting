import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const TRACE_ROOT = path.resolve(process.cwd(), ".next");
const TRACE_SUFFIX = ".nft.json";
const REQUIRED_SERVER_PACKAGES = ["pg"];

async function findTraceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findTraceFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(TRACE_SUFFIX)) {
      files.push(fullPath);
    }
  }

  return files;
}

function traceMentionsPackage(contents, packageName) {
  return (
    contents.includes(`/node_modules/${packageName}/`) ||
    contents.includes(`\\node_modules\\${packageName}\\`)
  );
}

async function main() {
  const traceFiles = await findTraceFiles(TRACE_ROOT);

  if (traceFiles.length === 0) {
    throw new Error(`No ${TRACE_SUFFIX} files were found under ${TRACE_ROOT}.`);
  }

  const packageMatches = new Map(
    REQUIRED_SERVER_PACKAGES.map((packageName) => [packageName, []])
  );

  for (const traceFile of traceFiles) {
    const contents = await readFile(traceFile, "utf8");

    for (const packageName of REQUIRED_SERVER_PACKAGES) {
      if (traceMentionsPackage(contents, packageName)) {
        packageMatches.get(packageName).push(path.relative(process.cwd(), traceFile));
      }
    }
  }

  const missingPackages = REQUIRED_SERVER_PACKAGES.filter(
    (packageName) => packageMatches.get(packageName).length === 0
  );

  if (missingPackages.length > 0) {
    const packageList = missingPackages.join(", ");
    throw new Error(
      `Missing traced server package(s): ${packageList}. Build output no longer includes them in .nft traces.`
    );
  }

  const summary = REQUIRED_SERVER_PACKAGES.map((packageName) => {
    const matches = packageMatches.get(packageName);
    return `${packageName} (${matches.length} trace file${matches.length === 1 ? "" : "s"})`;
  }).join(", ");

  console.log(`Verified server trace packages: ${summary}`);
}

main().catch((error) => {
  console.error("verify-server-trace failed", error);
  process.exit(1);
});
