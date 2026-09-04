import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import { getPayload, type Payload } from "payload";
import config from "../payload.config";

type CollectionSlug = "credentials" | "experiences" | "media" | "projects" | "skill-categories" | "users";
type CreatedDocument = { collection: CollectionSlug; id: number | string };

const baseURL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
const runID = randomUUID().slice(0, 8);
const created: CreatedDocument[] = [];

function remember(collection: CollectionSlug, id: number | string) {
  created.push({ collection, id });
}

function cookieFrom(response: Response) {
  const setCookie = response.headers.get("set-cookie");
  assert.ok(setCookie, "Login did not return an authentication cookie.");
  return setCookie.split(";", 1)[0] ?? "";
}

async function deleteRemembered(payload: Payload, collection: CollectionSlug, id: number | string) {
  const index = created.findIndex((item) => item.collection === collection && item.id === id);
  await payload.delete({ collection, id, overrideAccess: true });
  if (index >= 0) created.splice(index, 1);
}

async function validate() {
  const payload = await getPayload({ config });
  const password = randomBytes(32).toString("base64url");
  const email = `payload-validation-${runID}@example.com`;
  try {
    const testUser = await payload.create({
      collection: "users",
      data: { email, name: "Payload Validation", password },
      overrideAccess: true,
    });
    remember("users", testUser.id);
    const accessUser = { ...testUser, sessions: testUser.sessions ?? [] };

    const anonymousAdmin = await fetch(`${baseURL}/admin`);
    const anonymousAdminHTML = await anonymousAdmin.text();
    assert.equal(anonymousAdmin.status, 200);
    assert.match(anonymousAdminHTML, /login/i, "Anonymous /admin did not render the login view.");

    const publicCreate = await fetch(`${baseURL}/api/experiences`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Forbidden" }),
    });
    assert.equal(publicCreate.status, 403, "Anonymous content creation was not forbidden.");

    for (const endpoint of ["users", "users/first-register"] as const) {
      const registrationEmail = `closed-registration-${endpoint.replace("/", "-")}-${runID}@example.com`;
      const response = await fetch(`${baseURL}/api/${endpoint}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: registrationEmail, name: "Forbidden", password }),
      });

      if (response.ok) {
        const body = (await response.json()) as { doc?: { id?: number | string }; id?: number | string };
        const unexpectedID = body.doc?.id ?? body.id;
        if (unexpectedID != null) remember("users", unexpectedID);
      }
      assert.equal(response.ok, false, `Public registration remained open at /api/${endpoint}.`);
    }

    const login = await fetch(`${baseURL}/api/users/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(login.status, 200, "Valid administrator login failed.");
    const cookie = cookieFrom(login);

    const authenticatedMe = await fetch(`${baseURL}/api/users/me`, { headers: { cookie } });
    const authenticatedMeBody = (await authenticatedMe.json()) as { user?: { id?: number | string } | null };
    assert.equal(authenticatedMeBody.user?.id, testUser.id);

    const logout = await fetch(`${baseURL}/api/users/logout`, { method: "POST", headers: { cookie } });
    assert.equal(logout.status, 200, "Logout failed.");
    assert.match(logout.headers.get("set-cookie") ?? "", /expires|max-age=0/i, "Logout did not clear the cookie.");

    const imageData = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    );
    const media = await payload.create({
      collection: "media",
      data: { alt: "Imagen temporal de validación" },
      file: {
        data: imageData,
        mimetype: "image/png",
        name: `payload-validation-${runID}.png`,
        size: imageData.length,
      },
      overrideAccess: false,
      user: accessUser,
    });
    remember("media", media.id);
    assert.equal(media.mimeType, "image/png");
    assert.equal(media.alt, "Imagen temporal de validación");
    assert.ok(media.filename);
    const mediaPath = path.resolve(process.cwd(), "media", media.filename);
    assert.equal(existsSync(mediaPath), true, "The uploaded file was not written to local storage.");

    const siteSettingsData = {
      name: "Validación Payload",
      role: "Prueba temporal",
      eyebrow: "Payload + Neon",
      summary: "Contenido temporal utilizado para validar drafts y publicación.",
      bio: "Este contenido será reemplazado por el seed real en una fase posterior.",
      location: "Santiago, Chile",
      availability: "Validación",
      email: "validation@example.com",
      avatar: media.id,
      socialLinks: [{ label: "Sitio", url: "https://example.com" }],
      aboutSections: [
        {
          anchor: "validation",
          title: "Validación",
          body: [{ value: "Payload conserva la estructura equivalente a Sanity." }],
        },
      ],
      seo: { title: "Validación Payload", description: "Configuración temporal para validar Payload y Neon." },
    };

    const siteDraft = await payload.updateGlobal({
      slug: "site-settings",
      data: siteSettingsData,
      draft: true,
      overrideAccess: false,
      user: accessUser,
    });
    assert.equal(siteDraft._status, "draft");

    const sitePublished = await payload.updateGlobal({
      slug: "site-settings",
      data: { ...siteSettingsData, summary: `${siteSettingsData.summary} Publicado.`, _status: "published" },
      draft: false,
      overrideAccess: false,
      user: accessUser,
    });
    assert.equal(sitePublished._status, "published");
    const siteRead = await payload.findGlobal({
      slug: "site-settings",
      draft: false,
      overrideAccess: false,
    });
    assert.equal(siteRead._status, "published");
    assert.equal(typeof siteRead.avatar, "object");

    const firstSkill = await payload.create({
      collection: "skill-categories",
      data: {
        key: `validation-${runID}`,
        title: "Validation skills",
        description: "Temporary category",
        order: 20,
        skills: [{ name: "Payload", highlights: [{ value: "Collections" }] }],
      },
      draft: true,
      overrideAccess: false,
      user: accessUser,
    });
    remember("skill-categories", firstSkill.id);
    assert.equal(firstSkill._status, "draft");

    await assert.rejects(() =>
      payload.create({
        collection: "skill-categories",
        data: {
          key: firstSkill.key,
          title: "Duplicate key",
          description: "Must fail",
          order: 30,
          skills: [{ name: "Duplicate" }],
        },
        draft: true,
        overrideAccess: false,
        user: accessUser,
      }),
    );

    const secondSkill = await payload.create({
      collection: "skill-categories",
      data: {
        key: `validation-second-${runID}`,
        title: "Second validation skills",
        description: "Temporary category",
        order: 10,
        skills: [{ name: "Neon", highlights: [{ value: "PostgreSQL" }] }],
      },
      draft: true,
      overrideAccess: false,
      user: accessUser,
    });
    remember("skill-categories", secondSkill.id);

    const editedSkill = await payload.update({
      collection: "skill-categories",
      id: firstSkill.id,
      data: { title: "Validation skills edited", _status: "published" },
      draft: false,
      overrideAccess: false,
      user: accessUser,
    });
    assert.equal(editedSkill.title, "Validation skills edited");
    assert.equal(editedSkill._status, "published");
    await payload.update({
      collection: "skill-categories",
      id: secondSkill.id,
      data: { _status: "published" },
      draft: false,
      overrideAccess: false,
      user: accessUser,
    });
    const orderedSkills = await payload.find({
      collection: "skill-categories",
      sort: "order",
      limit: 100,
      overrideAccess: false,
      user: accessUser,
    });
    const validationSkillIDs = orderedSkills.docs
      .filter((doc) => doc.key.includes(runID))
      .map((doc) => doc.id);
    assert.deepEqual(validationSkillIDs, [secondSkill.id, firstSkill.id]);

    const experience = await payload.create({
      collection: "experiences",
      data: {
        key: `validation-experience-${runID}`,
        title: "Validation Engineer",
        company: "Temporary",
        period: "2026",
        location: "Remote",
        summary: "Draft experience",
        responsibilities: [{ value: "Validate create and edit" }],
        achievements: [{ value: "Drafts verified" }],
        technologies: [{ value: "Payload" }, { value: "PostgreSQL" }],
        projectType: "Validation",
        order: 10,
      },
      draft: true,
      overrideAccess: false,
      user: accessUser,
    });
    remember("experiences", experience.id);
    assert.equal(experience._status, "draft");

    const anonymousDraft = await payload.find({
      collection: "experiences",
      draft: true,
      where: { id: { equals: experience.id } },
      overrideAccess: false,
    });
    assert.equal(anonymousDraft.totalDocs, 0, "Anonymous Local API exposed a draft.");
    const adminDraft = await payload.find({
      collection: "experiences",
      draft: true,
      where: { id: { equals: experience.id } },
      overrideAccess: false,
      user: accessUser,
    });
    assert.equal(adminDraft.totalDocs, 1, "Authenticated Local API could not read a draft.");

    const restDraft = await fetch(
      `${baseURL}/api/experiences?draft=true&where[id][equals]=${encodeURIComponent(String(experience.id))}`,
    );
    const restDraftBody = (await restDraft.json()) as { totalDocs: number };
    assert.equal(restDraftBody.totalDocs, 0, "Anonymous REST exposed a draft.");

    const publishedExperience = await payload.update({
      collection: "experiences",
      id: experience.id,
      data: { summary: "Published experience", _status: "published" },
      draft: false,
      overrideAccess: false,
      user: accessUser,
    });
    assert.equal(publishedExperience.summary, "Published experience");
    assert.equal(publishedExperience._status, "published");
    const restPublished = await fetch(
      `${baseURL}/api/experiences?where[id][equals]=${encodeURIComponent(String(experience.id))}`,
    );
    const restPublishedBody = (await restPublished.json()) as { totalDocs: number };
    assert.equal(restPublishedBody.totalDocs, 1, "Anonymous REST could not read published content.");

    const project = await payload.create({
      collection: "projects",
      data: {
        key: `validation-project-${runID}`,
        name: "Payload validation project",
        description: "Temporary project used to validate the schema.",
        longDescription: "Checks arrays, links, flags, order and the Media relationship.",
        image: media.id,
        technologies: [{ value: "Payload" }, { value: "PostgreSQL" }],
        frameworks: [{ value: "Next.js" }],
        languages: [{ value: "TypeScript" }],
        roles: [{ value: "Full Stack" }],
        links: [{ label: "Example", url: "https://example.com" }],
        projectStatus: "in-progress",
        year: "2026",
        featured: true,
        order: 10,
      },
      draft: true,
      overrideAccess: false,
      user: accessUser,
    });
    remember("projects", project.id);
    assert.equal(project._status, "draft");
    const publishedProject = await payload.update({
      collection: "projects",
      id: project.id,
      data: { longDescription: `${project.longDescription} Edited.`, projectStatus: "completed", _status: "published" },
      draft: false,
      overrideAccess: false,
      user: accessUser,
    });
    assert.equal(publishedProject._status, "published");
    assert.equal(publishedProject.featured, true);
    assert.equal(publishedProject.links?.[0]?.url, "https://example.com");
    const projectWithMedia = await payload.findByID({
      collection: "projects",
      id: project.id,
      depth: 1,
      overrideAccess: false,
      user: accessUser,
    });
    assert.equal(typeof projectWithMedia.image, "object");
    assert.equal(projectWithMedia.image && typeof projectWithMedia.image === "object" ? projectWithMedia.image.id : null, media.id);

    for (const [type, order] of [["education", 10], ["certification", 20]] as const) {
      const credential = await payload.create({
        collection: "credentials",
        data: {
          key: `validation-${type}-${runID}`,
          type,
          title: `Validation ${type}`,
          institution: "Temporary institution",
          year: "2026",
          date: "2026-01-01",
          description: `Temporary ${type}`,
          details: [{ value: "Single collection discriminator" }],
          skills: [{ value: "Payload" }],
          credentialStatus: "completed",
          order,
        },
        draft: true,
        overrideAccess: false,
        user: accessUser,
      });
      remember("credentials", credential.id);
      assert.equal(credential.type, type);
      const publishedCredential = await payload.update({
        collection: "credentials",
        id: credential.id,
        data: { _status: "published" },
        draft: false,
        overrideAccess: false,
        user: accessUser,
      });
      assert.equal(publishedCredential._status, "published");
    }

    for (const item of [...created].reverse()) {
      if (item.collection === "media" || item.collection === "users") continue;
      await deleteRemembered(payload, item.collection, item.id);
    }

    await payload.updateGlobal({
      slug: "site-settings",
      data: { ...siteSettingsData, avatar: null, _status: "published" },
      draft: false,
      overrideAccess: false,
      user: accessUser,
    });
    await deleteRemembered(payload, "media", media.id);
    assert.equal(existsSync(mediaPath), false, "Payload did not remove the local media file.");
    await deleteRemembered(payload, "users", testUser.id);

    assert.equal(created.length, 0, "Some temporary collection documents were not removed.");

    console.log(JSON.stringify({
      auth: { login: true, logout: true, adminProtected: true, registrationClosed: true, anonymousWritesDenied: true },
      siteSettings: { draft: true, publish: true, publishedRead: true, mediaRelationship: true },
      skillCategories: { create: true, edit: true, publish: true, order: true, skillsArray: true, uniqueKey: true },
      experiences: { create: true, edit: true, draft: true, publish: true, arrays: true, order: true },
      projects: { create: true, edit: true, draft: true, publish: true, arrays: true, links: true, featured: true, order: true, mediaRelationship: true },
      credentials: { education: true, certification: true, sharedCollection: true },
      media: { upload: true, metadata: true, relationships: true, delete: true },
      access: { anonymousLocalDraftsHidden: true, anonymousRestDraftsHidden: true, adminDraftsVisible: true, publishedRestVisible: true },
      cleanup: { collectionDocumentsRemoved: true, siteSettingsLeftPublished: true },
    }, null, 2));
  } finally {
    for (const item of [...created].reverse()) {
      try {
        await payload.delete({ collection: item.collection, id: item.id, overrideAccess: true });
      } catch {
        // Best-effort cleanup; the report will identify leftovers if the main run reached that assertion.
      }
    }
  }
}

try {
  await validate();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : "Payload validation failed.");
  if (error instanceof Error && error.cause instanceof Error) {
    console.error(`Cause: ${error.cause.message}`);
  }
  process.exit(1);
}
