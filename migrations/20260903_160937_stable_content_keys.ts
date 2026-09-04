import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "experiences" ADD COLUMN "key" varchar;
  ALTER TABLE "_experiences_v" ADD COLUMN "version_key" varchar;
  ALTER TABLE "projects" ADD COLUMN "key" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_key" varchar;
  ALTER TABLE "credentials" ADD COLUMN "key" varchar;
  ALTER TABLE "_credentials_v" ADD COLUMN "version_key" varchar;
  CREATE UNIQUE INDEX "experiences_key_idx" ON "experiences" USING btree ("key");
  CREATE INDEX "_experiences_v_version_version_key_idx" ON "_experiences_v" USING btree ("version_key");
  CREATE UNIQUE INDEX "projects_key_idx" ON "projects" USING btree ("key");
  CREATE INDEX "_projects_v_version_version_key_idx" ON "_projects_v" USING btree ("version_key");
  CREATE UNIQUE INDEX "credentials_key_idx" ON "credentials" USING btree ("key");
  CREATE INDEX "_credentials_v_version_version_key_idx" ON "_credentials_v" USING btree ("version_key");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "experiences_key_idx";
  DROP INDEX "_experiences_v_version_version_key_idx";
  DROP INDEX "projects_key_idx";
  DROP INDEX "_projects_v_version_version_key_idx";
  DROP INDEX "credentials_key_idx";
  DROP INDEX "_credentials_v_version_version_key_idx";
  ALTER TABLE "experiences" DROP COLUMN "key";
  ALTER TABLE "_experiences_v" DROP COLUMN "version_key";
  ALTER TABLE "projects" DROP COLUMN "key";
  ALTER TABLE "_projects_v" DROP COLUMN "version_key";
  ALTER TABLE "credentials" DROP COLUMN "key";
  ALTER TABLE "_credentials_v" DROP COLUMN "version_key";`)
}
