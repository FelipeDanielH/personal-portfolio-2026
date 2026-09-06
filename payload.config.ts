import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Credentials } from "./src/payload/collections/Credentials";
import { Experiences } from "./src/payload/collections/Experiences";
import { Media } from "./src/payload/collections/Media";
import { Projects } from "./src/payload/collections/Projects";
import { Posts } from "./src/payload/collections/Posts";
import { SkillCategories } from "./src/payload/collections/SkillCategories";
import { Users } from "./src/payload/collections/Users";
import { SiteSettings } from "./src/payload/globals/SiteSettings";
import {
  createSupabaseStorageOptions,
  getSupabaseStorageConfig,
} from "./src/payload/storage/supabase-storage";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const serverURL = process.env.NEXT_PUBLIC_SITE_URL;
const supabaseStorage = getSupabaseStorageConfig();

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " · Felipe Henríquez",
    },
  },
  collections: [Users, Media, SkillCategories, Experiences, Projects, Credentials, Posts],
  globals: [SiteSettings],
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, "migrations"),
    pool: {
      connectionString: process.env.DATABASE_URL ?? "",
    },
    push: process.env.NODE_ENV !== "production",
  }),
  editor: lexicalEditor({}),
  plugins: [s3Storage(createSupabaseStorageOptions(supabaseStorage))],
  secret: process.env.PAYLOAD_SECRET ?? "",
  ...(serverURL ? { serverURL } : {}),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
});
