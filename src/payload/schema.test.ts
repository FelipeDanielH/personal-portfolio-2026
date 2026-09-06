import { describe, expect, it } from "vitest";
import { Credentials } from "./collections/Credentials";
import { Experiences } from "./collections/Experiences";
import { Media } from "./collections/Media";
import { Projects } from "./collections/Projects";
import { Posts } from "./collections/Posts";
import { SkillCategories } from "./collections/SkillCategories";
import { Users } from "./collections/Users";
import { publishedOrAuthenticated } from "./access/published-or-authenticated";
import { denyAnonymousSiteSettingsDraftRead, SiteSettings } from "./globals/SiteSettings";
import { validateUniqueAboutAnchors } from "./fields/unique-about-anchor";

describe("Payload portfolio schema", () => {
  it("models the portfolio and Markdown posts without a separate tags collection", () => {
    const collectionSlugs = [Users, Media, SkillCategories, Experiences, Projects, Credentials, Posts].map(
      ({ slug }) => slug,
    );

    expect(collectionSlugs).toEqual([
      "users",
      "media",
      "skill-categories",
      "experiences",
      "projects",
      "credentials",
      "posts",
    ]);
    expect(collectionSlugs).not.toContain("tags");
    expect(SiteSettings.slug).toBe("site-settings");
  });

  it("keeps editorial version history deliberately short", () => {
    expect(SkillCategories.versions).toMatchObject({ drafts: true, maxPerDoc: 3 });
    expect(Experiences.versions).toMatchObject({ drafts: true, maxPerDoc: 3 });
    expect(Projects.versions).toMatchObject({ drafts: true, maxPerDoc: 5 });
    expect(Credentials.versions).toMatchObject({ drafts: true, maxPerDoc: 3 });
    expect(SiteSettings.versions).toMatchObject({ drafts: true, max: 5 });
    expect(Users.versions).toBeUndefined();
    expect(Media.versions).toBeUndefined();
  });

  it("uses published-only read access for anonymous Site Settings requests", () => {
    expect(SiteSettings.access?.read).toBe(publishedOrAuthenticated);
  });

  it("rejects anonymous Site Settings draft reads before Payload can replace the published document", () => {
    expect(() => denyAnonymousSiteSettingsDraftRead({
      args: { draft: true },
      operation: "read",
      req: { user: null, t: undefined },
    } as never)).toThrow();
    expect(denyAnonymousSiteSettingsDraftRead({
      args: { draft: true },
      operation: "read",
      req: { user: { id: 1 }, t: undefined },
    } as never)).toEqual({ draft: true });
  });

  it("stores Media remotely and keeps the existing image derivatives", () => {
    expect(Media.upload).toMatchObject({
      disableLocalStorage: true,
      displayPreview: true,
      mimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
        "application/pdf",
      ],
    });
    expect(Media.upload && typeof Media.upload === "object" && Media.upload.adminThumbnail).toBeTypeOf(
      "function",
    );
    expect(Media.upload && typeof Media.upload === "object" && Media.upload.staticDir).toBeUndefined();
    expect(Media.upload && typeof Media.upload === "object" && Media.upload.imageSizes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "thumbnail", width: 480, height: 320 }),
        expect.objectContaining({ name: "card", width: 960, height: 640 }),
      ]),
    );
  });

  it("defines stable unique keys for every seeded collection", () => {
    for (const collection of [SkillCategories, Experiences, Projects, Credentials]) {
      const keyField = collection.fields.find((field) => "name" in field && field.name === "key");
      expect(keyField).toMatchObject({ type: "text", required: true, unique: true, index: true });
    }
  });

  it("keeps Posts as Markdown with unique slugs and limited native drafts", () => {
    const field = (name: string) => Posts.fields.find((entry) => "name" in entry && entry.name === name);
    expect(field("slug")).toMatchObject({ type: "text", required: true, unique: true, index: true });
    expect(field("contentMarkdown")).toMatchObject({ type: "textarea", required: true });
    expect(field("tags")).toMatchObject({ type: "text", hasMany: true });
    expect(field("featuredImage")).toMatchObject({ type: "upload", relationTo: "media" });
    expect(field("_status")).toBeUndefined();
    expect(Posts.versions).toMatchObject({ drafts: { autosave: { interval: 15000 } }, maxPerDoc: 10 });
  });

  it("rejects duplicate about section anchors", () => {
    expect(validateUniqueAboutAnchors([{ anchor: "historia" }, { anchor: "objetivos" }] as never, {} as never)).toBe(true);
    expect(validateUniqueAboutAnchors([{ anchor: "historia" }, { anchor: "historia" }] as never, {} as never)).toBe(
      "Cada sección debe tener un identificador único.",
    );
  });

  it("does not collide with Payload's draft status field", () => {
    const projectFields = Projects.fields.filter((field) => "name" in field).map((field) => field.name);
    const credentialFields = Credentials.fields.filter((field) => "name" in field).map((field) => field.name);

    expect(projectFields).toContain("projectStatus");
    expect(credentialFields).toContain("credentialStatus");
    expect(projectFields).not.toContain("status");
    expect(credentialFields).not.toContain("status");
  });
});
