import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_skill_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__skill_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_experiences_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__experiences_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_projects_project_status" AS ENUM('completed', 'in-progress');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_project_status" AS ENUM('completed', 'in-progress');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_credentials_type" AS ENUM('education', 'certification');
  CREATE TYPE "public"."enum_credentials_credential_status" AS ENUM('completed', 'in-progress');
  CREATE TYPE "public"."enum_credentials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__credentials_v_version_type" AS ENUM('education', 'certification');
  CREATE TYPE "public"."enum__credentials_v_version_credential_status" AS ENUM('completed', 'in-progress');
  CREATE TYPE "public"."enum__credentials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar
  );
  
  CREATE TABLE "skill_categories_skills_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "skill_categories_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "skill_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"title" varchar,
  	"description" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_skill_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_skill_categories_v_version_skills_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_skill_categories_v_version_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_skill_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_key" varchar,
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__skill_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "experiences_responsibilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "experiences_achievements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "experiences_technologies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "experiences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"company" varchar,
  	"period" varchar,
  	"location" varchar,
  	"summary" varchar,
  	"project_type" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_experiences_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_experiences_v_version_responsibilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v_version_achievements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v_version_technologies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_company" varchar,
  	"version_period" varchar,
  	"version_location" varchar,
  	"version_summary" varchar,
  	"version_project_type" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__experiences_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "projects_technologies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "projects_frameworks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "projects_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "projects_roles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "projects_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"long_description" varchar,
  	"image_id" integer,
  	"project_status" "enum_projects_project_status",
  	"year" varchar,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_projects_v_version_technologies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_frameworks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_roles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_description" varchar,
  	"version_long_description" varchar,
  	"version_image_id" integer,
  	"version_project_status" "enum__projects_v_version_project_status",
  	"version_year" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "credentials_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "credentials_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "credentials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_credentials_type",
  	"title" varchar,
  	"institution" varchar,
  	"year" varchar,
  	"date" timestamp(3) with time zone,
  	"description" varchar,
  	"duration" varchar,
  	"location" varchar,
  	"certificate_url" varchar,
  	"credential_status" "enum_credentials_credential_status",
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_credentials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_credentials_v_version_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_credentials_v_version_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_credentials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_type" "enum__credentials_v_version_type",
  	"version_title" varchar,
  	"version_institution" varchar,
  	"version_year" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_description" varchar,
  	"version_duration" varchar,
  	"version_location" varchar,
  	"version_certificate_url" varchar,
  	"version_credential_status" "enum__credentials_v_version_credential_status",
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__credentials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"skill_categories_id" integer,
  	"experiences_id" integer,
  	"projects_id" integer,
  	"credentials_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "site_settings_about_sections_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "site_settings_about_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"eyebrow" varchar,
  	"summary" varchar,
  	"bio" varchar,
  	"location" varchar,
  	"availability" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"cv_id" integer,
  	"avatar_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"_status" "enum_site_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_settings_v_version_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_about_sections_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_about_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_name" varchar,
  	"version_role" varchar,
  	"version_eyebrow" varchar,
  	"version_summary" varchar,
  	"version_bio" varchar,
  	"version_location" varchar,
  	"version_availability" varchar,
  	"version_email" varchar,
  	"version_phone" varchar,
  	"version_cv_id" integer,
  	"version_avatar_id" integer,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "skill_categories_skills_highlights" ADD CONSTRAINT "skill_categories_skills_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."skill_categories_skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "skill_categories_skills" ADD CONSTRAINT "skill_categories_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."skill_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_skill_categories_v_version_skills_highlights" ADD CONSTRAINT "_skill_categories_v_version_skills_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_skill_categories_v_version_skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_skill_categories_v_version_skills" ADD CONSTRAINT "_skill_categories_v_version_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_skill_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_skill_categories_v" ADD CONSTRAINT "_skill_categories_v_parent_id_skill_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."skill_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experiences_responsibilities" ADD CONSTRAINT "experiences_responsibilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_achievements" ADD CONSTRAINT "experiences_achievements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_technologies" ADD CONSTRAINT "experiences_technologies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_responsibilities" ADD CONSTRAINT "_experiences_v_version_responsibilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_achievements" ADD CONSTRAINT "_experiences_v_version_achievements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_technologies" ADD CONSTRAINT "_experiences_v_version_technologies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v" ADD CONSTRAINT "_experiences_v_parent_id_experiences_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_technologies" ADD CONSTRAINT "projects_technologies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_frameworks" ADD CONSTRAINT "projects_frameworks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_languages" ADD CONSTRAINT "projects_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_roles" ADD CONSTRAINT "projects_roles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_links" ADD CONSTRAINT "projects_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_technologies" ADD CONSTRAINT "_projects_v_version_technologies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_frameworks" ADD CONSTRAINT "_projects_v_version_frameworks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_languages" ADD CONSTRAINT "_projects_v_version_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_roles" ADD CONSTRAINT "_projects_v_version_roles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_links" ADD CONSTRAINT "_projects_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "credentials_details" ADD CONSTRAINT "credentials_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."credentials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "credentials_skills" ADD CONSTRAINT "credentials_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."credentials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_credentials_v_version_details" ADD CONSTRAINT "_credentials_v_version_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_credentials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_credentials_v_version_skills" ADD CONSTRAINT "_credentials_v_version_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_credentials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_credentials_v" ADD CONSTRAINT "_credentials_v_parent_id_credentials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."credentials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_skill_categories_fk" FOREIGN KEY ("skill_categories_id") REFERENCES "public"."skill_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_experiences_fk" FOREIGN KEY ("experiences_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_credentials_fk" FOREIGN KEY ("credentials_id") REFERENCES "public"."credentials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_about_sections_body" ADD CONSTRAINT "site_settings_about_sections_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_about_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_about_sections" ADD CONSTRAINT "site_settings_about_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_cv_id_media_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_social_links" ADD CONSTRAINT "_site_settings_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_about_sections_body" ADD CONSTRAINT "_site_settings_v_version_about_sections_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v_version_about_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_about_sections" ADD CONSTRAINT "_site_settings_v_version_about_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_cv_id_media_id_fk" FOREIGN KEY ("version_cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_avatar_id_media_id_fk" FOREIGN KEY ("version_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "skill_categories_skills_highlights_order_idx" ON "skill_categories_skills_highlights" USING btree ("_order");
  CREATE INDEX "skill_categories_skills_highlights_parent_id_idx" ON "skill_categories_skills_highlights" USING btree ("_parent_id");
  CREATE INDEX "skill_categories_skills_order_idx" ON "skill_categories_skills" USING btree ("_order");
  CREATE INDEX "skill_categories_skills_parent_id_idx" ON "skill_categories_skills" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "skill_categories_key_idx" ON "skill_categories" USING btree ("key");
  CREATE INDEX "skill_categories_updated_at_idx" ON "skill_categories" USING btree ("updated_at");
  CREATE INDEX "skill_categories_created_at_idx" ON "skill_categories" USING btree ("created_at");
  CREATE INDEX "skill_categories__status_idx" ON "skill_categories" USING btree ("_status");
  CREATE INDEX "_skill_categories_v_version_skills_highlights_order_idx" ON "_skill_categories_v_version_skills_highlights" USING btree ("_order");
  CREATE INDEX "_skill_categories_v_version_skills_highlights_parent_id_idx" ON "_skill_categories_v_version_skills_highlights" USING btree ("_parent_id");
  CREATE INDEX "_skill_categories_v_version_skills_order_idx" ON "_skill_categories_v_version_skills" USING btree ("_order");
  CREATE INDEX "_skill_categories_v_version_skills_parent_id_idx" ON "_skill_categories_v_version_skills" USING btree ("_parent_id");
  CREATE INDEX "_skill_categories_v_parent_idx" ON "_skill_categories_v" USING btree ("parent_id");
  CREATE INDEX "_skill_categories_v_version_version_key_idx" ON "_skill_categories_v" USING btree ("version_key");
  CREATE INDEX "_skill_categories_v_version_version_updated_at_idx" ON "_skill_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_skill_categories_v_version_version_created_at_idx" ON "_skill_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_skill_categories_v_version_version__status_idx" ON "_skill_categories_v" USING btree ("version__status");
  CREATE INDEX "_skill_categories_v_created_at_idx" ON "_skill_categories_v" USING btree ("created_at");
  CREATE INDEX "_skill_categories_v_updated_at_idx" ON "_skill_categories_v" USING btree ("updated_at");
  CREATE INDEX "_skill_categories_v_latest_idx" ON "_skill_categories_v" USING btree ("latest");
  CREATE INDEX "experiences_responsibilities_order_idx" ON "experiences_responsibilities" USING btree ("_order");
  CREATE INDEX "experiences_responsibilities_parent_id_idx" ON "experiences_responsibilities" USING btree ("_parent_id");
  CREATE INDEX "experiences_achievements_order_idx" ON "experiences_achievements" USING btree ("_order");
  CREATE INDEX "experiences_achievements_parent_id_idx" ON "experiences_achievements" USING btree ("_parent_id");
  CREATE INDEX "experiences_technologies_order_idx" ON "experiences_technologies" USING btree ("_order");
  CREATE INDEX "experiences_technologies_parent_id_idx" ON "experiences_technologies" USING btree ("_parent_id");
  CREATE INDEX "experiences_updated_at_idx" ON "experiences" USING btree ("updated_at");
  CREATE INDEX "experiences_created_at_idx" ON "experiences" USING btree ("created_at");
  CREATE INDEX "experiences__status_idx" ON "experiences" USING btree ("_status");
  CREATE INDEX "_experiences_v_version_responsibilities_order_idx" ON "_experiences_v_version_responsibilities" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_responsibilities_parent_id_idx" ON "_experiences_v_version_responsibilities" USING btree ("_parent_id");
  CREATE INDEX "_experiences_v_version_achievements_order_idx" ON "_experiences_v_version_achievements" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_achievements_parent_id_idx" ON "_experiences_v_version_achievements" USING btree ("_parent_id");
  CREATE INDEX "_experiences_v_version_technologies_order_idx" ON "_experiences_v_version_technologies" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_technologies_parent_id_idx" ON "_experiences_v_version_technologies" USING btree ("_parent_id");
  CREATE INDEX "_experiences_v_parent_idx" ON "_experiences_v" USING btree ("parent_id");
  CREATE INDEX "_experiences_v_version_version_updated_at_idx" ON "_experiences_v" USING btree ("version_updated_at");
  CREATE INDEX "_experiences_v_version_version_created_at_idx" ON "_experiences_v" USING btree ("version_created_at");
  CREATE INDEX "_experiences_v_version_version__status_idx" ON "_experiences_v" USING btree ("version__status");
  CREATE INDEX "_experiences_v_created_at_idx" ON "_experiences_v" USING btree ("created_at");
  CREATE INDEX "_experiences_v_updated_at_idx" ON "_experiences_v" USING btree ("updated_at");
  CREATE INDEX "_experiences_v_latest_idx" ON "_experiences_v" USING btree ("latest");
  CREATE INDEX "projects_technologies_order_idx" ON "projects_technologies" USING btree ("_order");
  CREATE INDEX "projects_technologies_parent_id_idx" ON "projects_technologies" USING btree ("_parent_id");
  CREATE INDEX "projects_frameworks_order_idx" ON "projects_frameworks" USING btree ("_order");
  CREATE INDEX "projects_frameworks_parent_id_idx" ON "projects_frameworks" USING btree ("_parent_id");
  CREATE INDEX "projects_languages_order_idx" ON "projects_languages" USING btree ("_order");
  CREATE INDEX "projects_languages_parent_id_idx" ON "projects_languages" USING btree ("_parent_id");
  CREATE INDEX "projects_roles_order_idx" ON "projects_roles" USING btree ("_order");
  CREATE INDEX "projects_roles_parent_id_idx" ON "projects_roles" USING btree ("_parent_id");
  CREATE INDEX "projects_links_order_idx" ON "projects_links" USING btree ("_order");
  CREATE INDEX "projects_links_parent_id_idx" ON "projects_links" USING btree ("_parent_id");
  CREATE INDEX "projects_image_idx" ON "projects" USING btree ("image_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "_projects_v_version_technologies_order_idx" ON "_projects_v_version_technologies" USING btree ("_order");
  CREATE INDEX "_projects_v_version_technologies_parent_id_idx" ON "_projects_v_version_technologies" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_frameworks_order_idx" ON "_projects_v_version_frameworks" USING btree ("_order");
  CREATE INDEX "_projects_v_version_frameworks_parent_id_idx" ON "_projects_v_version_frameworks" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_languages_order_idx" ON "_projects_v_version_languages" USING btree ("_order");
  CREATE INDEX "_projects_v_version_languages_parent_id_idx" ON "_projects_v_version_languages" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_roles_order_idx" ON "_projects_v_version_roles" USING btree ("_order");
  CREATE INDEX "_projects_v_version_roles_parent_id_idx" ON "_projects_v_version_roles" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_links_order_idx" ON "_projects_v_version_links" USING btree ("_order");
  CREATE INDEX "_projects_v_version_links_parent_id_idx" ON "_projects_v_version_links" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_image_idx" ON "_projects_v" USING btree ("version_image_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "credentials_details_order_idx" ON "credentials_details" USING btree ("_order");
  CREATE INDEX "credentials_details_parent_id_idx" ON "credentials_details" USING btree ("_parent_id");
  CREATE INDEX "credentials_skills_order_idx" ON "credentials_skills" USING btree ("_order");
  CREATE INDEX "credentials_skills_parent_id_idx" ON "credentials_skills" USING btree ("_parent_id");
  CREATE INDEX "credentials_updated_at_idx" ON "credentials" USING btree ("updated_at");
  CREATE INDEX "credentials_created_at_idx" ON "credentials" USING btree ("created_at");
  CREATE INDEX "credentials__status_idx" ON "credentials" USING btree ("_status");
  CREATE INDEX "_credentials_v_version_details_order_idx" ON "_credentials_v_version_details" USING btree ("_order");
  CREATE INDEX "_credentials_v_version_details_parent_id_idx" ON "_credentials_v_version_details" USING btree ("_parent_id");
  CREATE INDEX "_credentials_v_version_skills_order_idx" ON "_credentials_v_version_skills" USING btree ("_order");
  CREATE INDEX "_credentials_v_version_skills_parent_id_idx" ON "_credentials_v_version_skills" USING btree ("_parent_id");
  CREATE INDEX "_credentials_v_parent_idx" ON "_credentials_v" USING btree ("parent_id");
  CREATE INDEX "_credentials_v_version_version_updated_at_idx" ON "_credentials_v" USING btree ("version_updated_at");
  CREATE INDEX "_credentials_v_version_version_created_at_idx" ON "_credentials_v" USING btree ("version_created_at");
  CREATE INDEX "_credentials_v_version_version__status_idx" ON "_credentials_v" USING btree ("version__status");
  CREATE INDEX "_credentials_v_created_at_idx" ON "_credentials_v" USING btree ("created_at");
  CREATE INDEX "_credentials_v_updated_at_idx" ON "_credentials_v" USING btree ("updated_at");
  CREATE INDEX "_credentials_v_latest_idx" ON "_credentials_v" USING btree ("latest");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_skill_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("skill_categories_id");
  CREATE INDEX "payload_locked_documents_rels_experiences_id_idx" ON "payload_locked_documents_rels" USING btree ("experiences_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_credentials_id_idx" ON "payload_locked_documents_rels" USING btree ("credentials_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_about_sections_body_order_idx" ON "site_settings_about_sections_body" USING btree ("_order");
  CREATE INDEX "site_settings_about_sections_body_parent_id_idx" ON "site_settings_about_sections_body" USING btree ("_parent_id");
  CREATE INDEX "site_settings_about_sections_order_idx" ON "site_settings_about_sections" USING btree ("_order");
  CREATE INDEX "site_settings_about_sections_parent_id_idx" ON "site_settings_about_sections" USING btree ("_parent_id");
  CREATE INDEX "site_settings_cv_idx" ON "site_settings" USING btree ("cv_id");
  CREATE INDEX "site_settings_avatar_idx" ON "site_settings" USING btree ("avatar_id");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE INDEX "_site_settings_v_version_social_links_order_idx" ON "_site_settings_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_social_links_parent_id_idx" ON "_site_settings_v_version_social_links" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_about_sections_body_order_idx" ON "_site_settings_v_version_about_sections_body" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_about_sections_body_parent_id_idx" ON "_site_settings_v_version_about_sections_body" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_about_sections_order_idx" ON "_site_settings_v_version_about_sections" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_about_sections_parent_id_idx" ON "_site_settings_v_version_about_sections" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_version_cv_idx" ON "_site_settings_v" USING btree ("version_cv_id");
  CREATE INDEX "_site_settings_v_version_version_avatar_idx" ON "_site_settings_v" USING btree ("version_avatar_id");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "skill_categories_skills_highlights" CASCADE;
  DROP TABLE "skill_categories_skills" CASCADE;
  DROP TABLE "skill_categories" CASCADE;
  DROP TABLE "_skill_categories_v_version_skills_highlights" CASCADE;
  DROP TABLE "_skill_categories_v_version_skills" CASCADE;
  DROP TABLE "_skill_categories_v" CASCADE;
  DROP TABLE "experiences_responsibilities" CASCADE;
  DROP TABLE "experiences_achievements" CASCADE;
  DROP TABLE "experiences_technologies" CASCADE;
  DROP TABLE "experiences" CASCADE;
  DROP TABLE "_experiences_v_version_responsibilities" CASCADE;
  DROP TABLE "_experiences_v_version_achievements" CASCADE;
  DROP TABLE "_experiences_v_version_technologies" CASCADE;
  DROP TABLE "_experiences_v" CASCADE;
  DROP TABLE "projects_technologies" CASCADE;
  DROP TABLE "projects_frameworks" CASCADE;
  DROP TABLE "projects_languages" CASCADE;
  DROP TABLE "projects_roles" CASCADE;
  DROP TABLE "projects_links" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "_projects_v_version_technologies" CASCADE;
  DROP TABLE "_projects_v_version_frameworks" CASCADE;
  DROP TABLE "_projects_v_version_languages" CASCADE;
  DROP TABLE "_projects_v_version_roles" CASCADE;
  DROP TABLE "_projects_v_version_links" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "credentials_details" CASCADE;
  DROP TABLE "credentials_skills" CASCADE;
  DROP TABLE "credentials" CASCADE;
  DROP TABLE "_credentials_v_version_details" CASCADE;
  DROP TABLE "_credentials_v_version_skills" CASCADE;
  DROP TABLE "_credentials_v" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_social_links" CASCADE;
  DROP TABLE "site_settings_about_sections_body" CASCADE;
  DROP TABLE "site_settings_about_sections" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "_site_settings_v_version_social_links" CASCADE;
  DROP TABLE "_site_settings_v_version_about_sections_body" CASCADE;
  DROP TABLE "_site_settings_v_version_about_sections" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TYPE "public"."enum_skill_categories_status";
  DROP TYPE "public"."enum__skill_categories_v_version_status";
  DROP TYPE "public"."enum_experiences_status";
  DROP TYPE "public"."enum__experiences_v_version_status";
  DROP TYPE "public"."enum_projects_project_status";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_project_status";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_credentials_type";
  DROP TYPE "public"."enum_credentials_credential_status";
  DROP TYPE "public"."enum_credentials_status";
  DROP TYPE "public"."enum__credentials_v_version_type";
  DROP TYPE "public"."enum__credentials_v_version_credential_status";
  DROP TYPE "public"."enum__credentials_v_version_status";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_status";`)
}
