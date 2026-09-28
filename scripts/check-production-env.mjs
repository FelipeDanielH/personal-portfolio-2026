import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import { readPreviewEnvironment } from "./preview-env.mjs";
import {
  createProductionChildEnvironment,
  productionApplicationEnvNames,
  readProductionEnvironment,
} from "./production-env.mjs";

function readEnvironment(filePath, label) {
  try {
    return parseEnv(readFileSync(filePath, "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new Error(`Missing ${label}; Production isolation cannot be demonstrated.`);
    }

    throw error;
  }
}

function required(environment, name, label) {
  const value = environment[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name} in ${label}.`);
  }

  return value;
}

function parseURL(value, label, protocols = ["https:"]) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid absolute URL.`);
  }

  if (!protocols.includes(url.protocol)) {
    throw new Error(`${label} uses an unexpected protocol.`);
  }

  return url;
}

function databaseIdentity(environment, label) {
  const url = parseURL(required(environment, "DATABASE_URL", label), `${label} DATABASE_URL`, [
    "postgres:",
    "postgresql:",
  ]);
  const hostname = url.hostname.toLowerCase();

  if (!hostname.endsWith(".neon.tech")) {
    throw new Error(`${label} DATABASE_URL must point to Neon.`);
  }

  return `${hostname.replace(/-pooler(?=\.)/, "")}${url.pathname}`;
}

function supabaseProjectRef(url, kind) {
  const pattern =
    kind === "endpoint"
      ? /^([a-z0-9]+)\.storage\.supabase\.co$/i
      : /^([a-z0-9]+)\.supabase\.co$/i;
  const match = url.hostname.match(pattern);

  if (!match) {
    throw new Error(`Production Supabase ${kind} host has an unexpected format.`);
  }

  return match[1].toLowerCase();
}

const developmentEnvironment = readEnvironment(
  path.resolve(process.cwd(), ".env.local"),
  ".env.local",
);
const previewEnvironment = readPreviewEnvironment();
const productionEnvironment = readProductionEnvironment();

const developmentDatabase = databaseIdentity(developmentEnvironment, "Development");
const previewDatabase = databaseIdentity(previewEnvironment, "Preview");
const productionDatabase = databaseIdentity(productionEnvironment, "Production");
const productionDiffersFromDevelopment = productionDatabase !== developmentDatabase;
const productionDiffersFromPreview = productionDatabase !== previewDatabase;

assert.ok(
  productionDiffersFromDevelopment,
  "Production and Development DATABASE_URL must identify different Neon databases.",
);
assert.ok(
  productionDiffersFromPreview,
  "Production and Preview DATABASE_URL must identify different Neon databases.",
);

const productionBucket = required(
  productionEnvironment,
  "SUPABASE_STORAGE_BUCKET",
  "Production",
);
const developmentBucket = required(
  developmentEnvironment,
  "SUPABASE_STORAGE_BUCKET",
  "Development",
);
const previewBucket = required(previewEnvironment, "SUPABASE_STORAGE_BUCKET", "Preview");

assert.notEqual(productionBucket, developmentBucket, "Production and Development buckets must differ.");
assert.notEqual(productionBucket, previewBucket, "Production and Preview buckets must differ.");
assert.match(productionBucket, /production/i, "Production bucket name must identify Production.");

const productionEndpoint = parseURL(
  required(productionEnvironment, "SUPABASE_STORAGE_ENDPOINT", "Production"),
  "Production SUPABASE_STORAGE_ENDPOINT",
);
const productionPublicURL = parseURL(
  required(productionEnvironment, "SUPABASE_STORAGE_PUBLIC_URL", "Production"),
  "Production SUPABASE_STORAGE_PUBLIC_URL",
);

assert.match(
  productionEndpoint.pathname,
  /^\/storage\/v1\/s3\/?$/,
  "Production S3 endpoint path must be /storage/v1/s3.",
);
assert.equal(
  decodeURIComponent(productionPublicURL.pathname).replace(/\/$/, ""),
  `/storage/v1/object/public/${productionBucket}`,
  "Production public URL path must end with the configured bucket.",
);
assert.equal(
  supabaseProjectRef(productionEndpoint, "endpoint"),
  supabaseProjectRef(productionPublicURL, "public URL"),
  "Production Supabase endpoint and public URL must use the same project-ref.",
);

const siteURL = parseURL(
  required(productionEnvironment, "NEXT_PUBLIC_SITE_URL", "Production"),
  "Production NEXT_PUBLIC_SITE_URL",
);
assert.notEqual(siteURL.hostname, "localhost", "Production site URL cannot use localhost.");

const inheritedEnvironment = Object.fromEntries(
  productionApplicationEnvNames.flatMap((name) => [
    [name, "inherited-value"],
    [name.toLowerCase(), "inherited-lowercase-value"],
  ]),
);
const childEnvironment = createProductionChildEnvironment(
  productionEnvironment,
  inheritedEnvironment,
);

for (const name of productionApplicationEnvNames) {
  assert.equal(childEnvironment[name], productionEnvironment[name]);
  assert.ok(!(name.toLowerCase() in childEnvironment));
}
assert.equal(childEnvironment.NODE_ENV, "production");

console.log("Development environment: .env.local (identity comparison only)");
console.log("Preview environment: .env.preview.local (identity comparison only)");
console.log("Production environment: .env.production.local (exclusive command source)");
console.log(
  `Production required variables present: ${productionApplicationEnvNames.length}/${productionApplicationEnvNames.length}`,
);
console.log(`Production Neon database differs from Development: ${productionDiffersFromDevelopment}`);
console.log(`Production Neon database differs from Preview: ${productionDiffersFromPreview}`);
console.log("Production database provider: Neon");
console.log("Production bucket differs from Development and Preview: true");
console.log("Production Supabase endpoint/public project-ref match: true");
console.log("Production public URL matches its bucket: true");
console.log("Inherited application variables removed: true");
console.log("Production NODE_ENV for commands: production");
console.log("Payload push for Production commands: false");
