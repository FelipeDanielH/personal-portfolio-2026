import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getPayload } from "payload";
import config from "../payload.config";
import { getSupabaseStorageConfig } from "../src/payload/storage/supabase-storage";

const baseURL = process.env.PAYLOAD_STORAGE_TEST_BASE_URL ?? "http://127.0.0.1:3107";
const marker = randomUUID();
const email = `storage-${marker}@example.invalid`;
const password = `Storage-${randomUUID()}-Aa1!`;
const alt = `Supabase storage validation ${marker}`;
const projectKey = `storage-validation-${marker}`;

const payload = await getPayload({ config });
const storage = getSupabaseStorageConfig();
let userId: number | string | undefined;
let mediaId: number | string | undefined;
let projectId: number | string | undefined;
let publicMediaURL: string | undefined;
const browser = await chromium.launch();

async function cleanupStaleValidationData(): Promise<void> {
  const staleProjects = await payload.find({
    collection: "projects",
    limit: 100,
    overrideAccess: true,
    where: { key: { contains: "storage-validation-" } },
  });
  for (const document of staleProjects.docs) {
    await payload.delete({ collection: "projects", id: document.id, overrideAccess: true });
  }

  const staleMedia = await payload.find({
    collection: "media",
    limit: 100,
    overrideAccess: true,
    where: { alt: { contains: "Supabase storage validation" } },
  });
  for (const document of staleMedia.docs) {
    await payload.delete({ collection: "media", id: document.id, overrideAccess: true });
  }

  const staleUsers = await payload.find({
    collection: "users",
    limit: 100,
    overrideAccess: true,
    where: { email: { contains: "@example.invalid" } },
  });
  for (const document of staleUsers.docs) {
    await payload.delete({ collection: "users", id: document.id, overrideAccess: true });
  }
}

async function waitForPublicState(url: string, shouldExist: boolean): Promise<Response> {
  const fetchWithoutCache = () => {
    const cacheBustedURL = new URL(url);
    cacheBustedURL.searchParams.set("storage-validation", randomUUID());
    return fetch(cacheBustedURL, { cache: "no-store" });
  };
  let response = await fetchWithoutCache();

  for (let attempt = 0; attempt < 10 && response.ok !== shouldExist; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    response = await fetchWithoutCache();
  }

  return response;
}

try {
  await cleanupStaleValidationData();
  const user = await payload.create({
    collection: "users",
    data: { email, name: "Storage validation", password },
    overrideAccess: true,
  });
  userId = user.id;

  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(120_000);
  page.setDefaultNavigationTimeout(120_000);
  const loginResponse = await context.request.post(`${baseURL}/api/users/login`, {
    data: { email, password },
  });
  if (!loginResponse.ok()) {
    throw new Error("Temporary administrator could not authenticate");
  }

  await page.goto(`${baseURL}/admin/collections/media/create`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  await page.locator(".file-field__hidden-input").setInputFiles(path.resolve("public", "og.png"));
  await page.locator(".file-field__filename").waitFor({ state: "visible" });
  const applyImageChanges = page.getByRole("button", {
    name: /Aplicar cambios|Apply changes/i,
  });
  if (await applyImageChanges.isVisible()) {
    await applyImageChanges.click();
  }
  await page.locator('#field-alt, input[name="alt"]').first().fill(alt);
  await page.locator("#action-save").click();
  await page.waitForURL((url) => {
    const segments = url.pathname.split("/").filter(Boolean);
    return segments.slice(0, 3).join("/") === "admin/collections/media" && segments[3] !== "create";
  });

  const mediaDocumentId = new URL(page.url()).pathname.split("/").filter(Boolean).at(-1);
  if (!mediaDocumentId) {
    throw new Error("Payload Admin did not redirect to the created Media document");
  }

  const media = await payload.findByID({
    collection: "media",
    id: mediaDocumentId,
    overrideAccess: true,
  });

  if (!media.url || !media.filename || media.alt !== alt) {
    throw new Error("Payload did not persist the uploaded Media metadata");
  }

  mediaId = media.id;
  publicMediaURL = media.url;
  const publicAssetURLs = [media.url, media.sizes?.thumbnail?.url, media.sizes?.card?.url].filter(
    (url): url is string => typeof url === "string",
  );

  if (!publicMediaURL.startsWith(`${storage.publicURL}/`)) {
    throw new Error("Payload generated a Media URL outside SUPABASE_STORAGE_PUBLIC_URL");
  }

  if (publicAssetURLs.length !== 3 || publicAssetURLs.some((url) => !url.startsWith(`${storage.publicURL}/`))) {
    throw new Error("Payload did not generate public Supabase URLs for every image size");
  }

  const localFilenames = [
    media.filename,
    media.sizes?.thumbnail?.filename,
    media.sizes?.card?.filename,
  ].filter((filename): filename is string => typeof filename === "string");
  if (localFilenames.some((filename) => existsSync(path.resolve("media", filename)))) {
    throw new Error("Payload unexpectedly wrote the original file to local storage");
  }

  for (const assetURL of publicAssetURLs) {
    const uploadedResponse = await waitForPublicState(assetURL, true);
    if (!uploadedResponse.ok || !uploadedResponse.headers.get("content-type")?.startsWith("image/")) {
      throw new Error("An uploaded object is not publicly readable as an image");
    }
  }

  const adminPreview = page.locator(".thumbnail img").first();
  await adminPreview.waitFor({ state: "visible" });
  const hasAdminPreview = await adminPreview.evaluate(
    (image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
  );
  if (!hasAdminPreview) {
    throw new Error("The Payload Admin did not render the Supabase image preview");
  }

  const project = await payload.create({
    collection: "projects",
    data: {
      description: "Temporary storage relationship validation.",
      featured: false,
      image: media.id,
      key: projectKey,
      longDescription: "This record is deleted at the end of the storage validation.",
      name: "Storage validation",
      order: 9999,
      projectStatus: "completed",
      year: "2026",
    },
    draft: false,
    overrideAccess: true,
  });
  projectId = project.id;

  const related = await payload.findByID({
    collection: "projects",
    id: project.id,
    depth: 1,
    overrideAccess: true,
  });
  if (!related.image || typeof related.image !== "object" || related.image.id !== media.id) {
    throw new Error("Project did not resolve the Media relationship");
  }

  await payload.update({
    collection: "projects",
    id: project.id,
    data: { image: null },
    overrideAccess: true,
  });
  const withoutRelation = await payload.findByID({
    collection: "projects",
    id: project.id,
    depth: 1,
    overrideAccess: true,
  });
  if (withoutRelation.image) {
    throw new Error("Project retained a removed Media relationship");
  }

  await payload.update({
    collection: "projects",
    id: project.id,
    data: { image: media.id },
    overrideAccess: true,
  });
  const restoredRelation = await payload.findByID({
    collection: "projects",
    id: project.id,
    depth: 1,
    overrideAccess: true,
  });
  if (!restoredRelation.image || typeof restoredRelation.image !== "object") {
    throw new Error("Project did not restore the Media relationship after reload");
  }

  await payload.delete({ collection: "projects", id: project.id, overrideAccess: true });
  projectId = undefined;
  await payload.delete({ collection: "media", id: media.id, overrideAccess: true });
  mediaId = undefined;

  for (const assetURL of publicAssetURLs) {
    const deletedResponse = await waitForPublicState(assetURL, false);
    if (deletedResponse.ok) {
      throw new Error("An object remained publicly readable after deleting Media");
    }
  }

  console.log("Storage validation passed: admin upload, metadata, public read, preview, relationship and remote delete.");
} finally {
  if (projectId !== undefined) {
    await payload.delete({ collection: "projects", id: projectId, overrideAccess: true });
  }
  if (mediaId !== undefined) {
    await payload.delete({ collection: "media", id: mediaId, overrideAccess: true });
  }
  if (userId !== undefined) {
    await payload.delete({ collection: "users", id: userId, overrideAccess: true });
  }
  await browser.close();
  await payload.destroy();
}
