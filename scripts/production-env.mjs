import { readFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";

export const productionEnvPath = path.resolve(process.cwd(), ".env.production.local");

export const productionApplicationEnvNames = [
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

export function readProductionEnvironment() {
  let contents;

  try {
    contents = readFileSync(productionEnvPath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new Error(
        "Missing .env.production.local. Production commands never fall back to .env.local.",
      );
    }

    throw error;
  }

  const environment = parseEnv(contents);
  const missing = productionApplicationEnvNames.filter((name) => !environment[name]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing required Production environment variables: ${missing.join(", ")}`);
  }

  return environment;
}

export function createProductionChildEnvironment(
  productionEnvironment,
  inheritedEnvironment = process.env,
) {
  const environment = { ...inheritedEnvironment };
  const applicationNames = new Set(
    productionApplicationEnvNames.map((name) => name.toUpperCase()),
  );

  for (const name of Object.keys(environment)) {
    if (applicationNames.has(name.toUpperCase())) {
      delete environment[name];
    }
  }

  Object.assign(environment, productionEnvironment, { NODE_ENV: "production" });
  return environment;
}
