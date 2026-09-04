import type { S3StorageOptions } from "@payloadcms/storage-s3";

type EnvironmentKey =
  | "SUPABASE_STORAGE_BUCKET"
  | "SUPABASE_STORAGE_REGION"
  | "SUPABASE_STORAGE_ACCESS_KEY_ID"
  | "SUPABASE_STORAGE_SECRET_ACCESS_KEY"
  | "SUPABASE_STORAGE_ENDPOINT"
  | "SUPABASE_STORAGE_PUBLIC_URL";
type StorageEnvironment = Readonly<Record<string, string | undefined>>;

export type SupabaseStorageConfig = {
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  publicURL: string;
  region: string;
  secretAccessKey: string;
};

function required(environment: StorageEnvironment, key: EnvironmentKey): string {
  const value = environment[key]?.trim();

  if (!value) {
    throw new Error(`Missing required server environment variable: ${key}`);
  }

  return value;
}

function normalizedURL(value: string, key: EnvironmentKey): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${key} must be an absolute HTTP(S) URL`);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`${key} must be an absolute HTTP(S) URL`);
  }

  return url.toString().replace(/\/$/, "");
}

export function getSupabaseStorageConfig(
  environment: StorageEnvironment = process.env,
): SupabaseStorageConfig {
  return {
    accessKeyId: required(environment, "SUPABASE_STORAGE_ACCESS_KEY_ID"),
    bucket: required(environment, "SUPABASE_STORAGE_BUCKET"),
    endpoint: normalizedURL(
      required(environment, "SUPABASE_STORAGE_ENDPOINT"),
      "SUPABASE_STORAGE_ENDPOINT",
    ),
    publicURL: normalizedURL(
      required(environment, "SUPABASE_STORAGE_PUBLIC_URL"),
      "SUPABASE_STORAGE_PUBLIC_URL",
    ),
    region: required(environment, "SUPABASE_STORAGE_REGION"),
    secretAccessKey: required(environment, "SUPABASE_STORAGE_SECRET_ACCESS_KEY"),
  };
}

function encodeObjectPath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function generateSupabaseMediaURL(
  publicURL: string,
  filename: string,
  prefix?: string,
): string {
  const objectPath = encodeObjectPath([prefix, filename].filter(Boolean).join("/"));
  return `${publicURL.replace(/\/+$/, "")}/${objectPath}`;
}

export function createSupabaseStorageOptions(
  storage: SupabaseStorageConfig,
): S3StorageOptions {
  return {
    bucket: storage.bucket,
    clientUploads: false,
    collections: {
      media: {
        disablePayloadAccessControl: true,
        generateFileURL: ({ filename, prefix }) =>
          generateSupabaseMediaURL(storage.publicURL, filename, prefix),
      },
    },
    config: {
      credentials: {
        accessKeyId: storage.accessKeyId,
        secretAccessKey: storage.secretAccessKey,
      },
      endpoint: storage.endpoint,
      forcePathStyle: true,
      region: storage.region,
    },
    disableLocalStorage: true,
    enabled: true,
  };
}
