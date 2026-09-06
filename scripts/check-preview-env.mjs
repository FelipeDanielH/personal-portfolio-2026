import { readFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import { applicationEnvNames, readPreviewEnvironment } from "./preview-env.mjs";

const developmentEnvPath = path.resolve(process.cwd(), ".env.local");

function readEnvironment(filePath, label) {
  try {
    return parseEnv(readFileSync(filePath, "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new Error(`Missing ${label}.`);
    }

    throw error;
  }
}

function hostname(value) {
  try {
    return new URL(value).hostname;
  } catch {
    throw new Error("DATABASE_URL must be a valid URL.");
  }
}

const developmentEnv = readEnvironment(developmentEnvPath, ".env.local");
const previewEnv = readPreviewEnvironment();

if (!developmentEnv.DATABASE_URL?.trim()) {
  throw new Error("Missing DATABASE_URL in .env.local.");
}

const missingPreviewNames = applicationEnvNames.filter((name) => !previewEnv[name]?.trim());
const distinctDatabases = hostname(developmentEnv.DATABASE_URL) !== hostname(previewEnv.DATABASE_URL);

console.log("Development environment: .env.local");
console.log("Preview environment: .env.preview.local");
console.log(`Preview expected variables present: ${applicationEnvNames.length - missingPreviewNames.length}/${applicationEnvNames.length}`);
console.log(`Development and Preview database hosts differ: ${distinctDatabases}`);
console.log("Preview NODE_ENV for commands: production");
console.log("Payload push for Preview commands: false");

if (!distinctDatabases) {
  throw new Error("Development and Preview DATABASE_URL hosts must differ.");
}
