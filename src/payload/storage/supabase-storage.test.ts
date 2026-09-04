import { describe, expect, it } from "vitest";
import {
  createSupabaseStorageOptions,
  generateSupabaseMediaURL,
  getSupabaseStorageConfig,
  type SupabaseStorageConfig,
} from "./supabase-storage";

const storage: SupabaseStorageConfig = {
  accessKeyId: "server-access-key",
  bucket: "portfolio-media-development",
  endpoint: "https://example.storage.supabase.co/storage/v1/s3",
  publicURL:
    "https://example.supabase.co/storage/v1/object/public/portfolio-media-development",
  region: "us-east-1",
  secretAccessKey: "server-secret-key",
};

describe("Supabase S3 storage configuration", () => {
  it("requires every server-side setting without exposing values in errors", () => {
    expect(() =>
      getSupabaseStorageConfig({
        SUPABASE_STORAGE_BUCKET: storage.bucket,
      }),
    ).toThrow("SUPABASE_STORAGE_ACCESS_KEY_ID");
  });

  it("normalizes URLs and creates public object URLs", () => {
    const parsed = getSupabaseStorageConfig({
      SUPABASE_STORAGE_ACCESS_KEY_ID: storage.accessKeyId,
      SUPABASE_STORAGE_BUCKET: storage.bucket,
      SUPABASE_STORAGE_ENDPOINT: `${storage.endpoint}/`,
      SUPABASE_STORAGE_PUBLIC_URL: `${storage.publicURL}/`,
      SUPABASE_STORAGE_REGION: storage.region,
      SUPABASE_STORAGE_SECRET_ACCESS_KEY: storage.secretAccessKey,
    });

    expect(parsed.endpoint).toBe(storage.endpoint);
    expect(parsed.publicURL).toBe(storage.publicURL);
    expect(generateSupabaseMediaURL(parsed.publicURL, "my image.png", "media/originals")).toBe(
      `${storage.publicURL}/media/originals/my%20image.png`,
    );
  });

  it("keeps uploads server-side and uses Supabase path-style S3 requests", () => {
    const options = createSupabaseStorageOptions(storage);

    expect(options).toMatchObject({
      bucket: storage.bucket,
      clientUploads: false,
      disableLocalStorage: true,
      enabled: true,
      config: {
        endpoint: storage.endpoint,
        forcePathStyle: true,
        region: storage.region,
      },
    });
    expect(options.collections.media).toMatchObject({ disablePayloadAccessControl: true });
  });
});
