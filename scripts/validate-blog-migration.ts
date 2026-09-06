import { postgresAdapter } from "@payloadcms/db-postgres";
import { createLocalReq, getPayload } from "payload";
import config from "../payload.config";
import { up, down } from "../migrations/20260904_222234_markdown_posts";

if (process.env.NODE_ENV === "production") throw new Error("Development validation only");
const payload = await getPayload({ config: {
  ...await config,
  db: { ...postgresAdapter({ push: false, pool: { connectionString: process.env.DATABASE_URL ?? "" } }), allowIDOnCreate: false, name: "postgres" },
} });
const rollback = new Error("Validation rollback");
try {
  const req = await createLocalReq({}, payload);
  await payload.db.drizzle.transaction(async (db) => {
    await up({ db, payload, req });
    await down({ db, payload, req });
    await up({ db, payload, req });
    throw rollback;
  });
} catch (error) {
  if (error !== rollback) throw error;
  console.log("Migration up/down/up passed in a rolled-back development transaction.");
} finally { await payload.destroy(); }
