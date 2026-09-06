import { readFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";

export const previewEnvPath = path.resolve(process.cwd(), ".env.preview.local");

export const applicationEnvNames = [
  "DATABASE_URL",
  "PAYLOAD_SECRET",
  "SUPABASE_STORAGE_BUCKET",
  "SUPABASE_STORAGE_REGION",
  "SUPABASE_STORAGE_ACCESS_KEY_ID",
  "SUPABASE_STORAGE_SECRET_ACCESS_KEY",
  "SUPABASE_STORAGE_ENDPOINT",
  "SUPABASE_STORAGE_PUBLIC_URL",
  "RESEND_API_KEY",
  "CONTACT_TO_EMAIL",
  "CONTACT_FROM_EMAIL",
  "NEXT_PUBLIC_SITE_URL",
];

const payloadRequiredEnvNames = [
  "DATABASE_URL",
  "PAYLOAD_SECRET",
  "SUPABASE_STORAGE_BUCKET",
  "SUPABASE_STORAGE_REGION",
  "SUPABASE_STORAGE_ACCESS_KEY_ID",
  "SUPABASE_STORAGE_SECRET_ACCESS_KEY",
  "SUPABASE_STORAGE_ENDPOINT",
  "SUPABASE_STORAGE_PUBLIC_URL",
];

export function readPreviewEnvironment() {
  let contents;

  try {
    contents = readFileSync(previewEnvPath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new Error("Missing .env.preview.local. Preview commands never fall back to .env.local.");
    }

    throw error;
  }

  const env = parseEnv(contents);
  const missing = payloadRequiredEnvNames.filter((name) => !env[name]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing required Preview environment variables: ${missing.join(", ")}`);
  }

  return env;
}

export function createPreviewChildEnvironment(previewEnv) {
  const environment = { ...process.env };
  const applicationNames = new Set(applicationEnvNames.map((name) => name.toUpperCase()));

  for (const name of Object.keys(environment)) {
    if (applicationNames.has(name.toUpperCase())) {
      delete environment[name];
    }
  }

  Object.assign(environment, previewEnv, { NODE_ENV: "production" });
  return environment;
}
