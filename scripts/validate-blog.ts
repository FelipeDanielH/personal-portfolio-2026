import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium, expect, type Page } from "@playwright/test";
import { getPayload } from "payload";
import sharp from "sharp";
import config from "../payload.config";
import { readPublishedPost, readPublishedPosts } from "../src/payload/blog/repository";

const baseURL = process.env.BLOG_TEST_BASE_URL ?? "http://127.0.0.1:3108";
if (process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname)) throw new Error("Development validation only");
const marker = `blog-validation-${randomUUID()}`;
const payload = await getPayload({ config });
const browser = await chromium.launch();
let postID: number | undefined;
let mediaID: number | undefined;
let newMediaID: number | undefined;
let userID: number | undefined;

async function visitUntil(page: Page, path: string, text: string, present: boolean) {
  const deadline = Date.now() + 95000;
  do {
    await page.goto(`${baseURL}${path}`, { waitUntil: "networkidle" });
    if ((await page.locator("main").innerText()).includes(text) === present) return;
    await new Promise((resolve) => setTimeout(resolve, 3000));
  } while (Date.now() < deadline);
  throw new Error(`Public cache did not reflect the expected state for ${path}`);
}

try {
  const password = randomUUID() + "Aa1!";
  const email = `${marker}@example.invalid`;
  const user = await payload.create({ collection: "users", data: { name: "Blog validation", email, password }, overrideAccess: true });
  userID = user.id;
  const imageBytes = await sharp({ create: { width: 1200, height: 800, channels: 3, background: "#2f7fff" } }).png().toBuffer();
  const media = await payload.create({ collection: "media", data: { alt: marker },
    file: { name: `${marker}.png`, data: imageBytes, mimetype: "image/png", size: imageBytes.length }, overrideAccess: true });
  mediaID = media.id;
  assert.ok(media.url);
  assert.equal((await fetch(media.url)).status, 200);
  const markdown = '## Encabezado de prueba\n\n- Elemento uno\n- Elemento dos\n\n[Enlace seguro](https://example.org)\n\nCódigo `inline`\n\n```js\nconst ejemplo = 1;\n```\n\n| Campo | Valor |\n| --- | --- |\n| Markdown | real |\n\n<script>alert("xss")</script>\n\n';
  const draft = await payload.create({ collection: "posts", data: { title: marker, excerpt: "Extracto temporal para validar el blog.", contentMarkdown: markdown,
    featuredImage: media.id, tags: [" React ", "react", "TypeScript"], _status: "draft" }, draft: true, overrideAccess: true });
  postID = draft.id;
  assert.equal(draft._status, "draft");
  assert.equal(draft.slug, marker);
  assert.deepEqual(draft.tags, ["react", "typescript"]);
  assert.equal(await readPublishedPost(marker), null);
  assert.ok(!(await readPublishedPosts()).some((post) => post.slug === marker));
  const anonymousDrafts = await payload.find({ collection: "posts", draft: true, overrideAccess: false, where: { id: { equals: draft.id } } });
  assert.equal(anonymousDrafts.totalDocs, 0);
  const anonymous = await browser.newContext();
  const page = await anonymous.newPage();
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(120000);
  await visitUntil(page, "/blog", marker, false);
  await page.goto(`${baseURL}/blog/${marker}`, { waitUntil: "networkidle" });
  assert.ok(!(await page.locator("main").innerText()).includes(marker));
  assert.equal((await anonymous.request.get(`${baseURL}/api/posts/${draft.id}?draft=true`)).status(), 404);
  assert.equal((await anonymous.request.post(`${baseURL}/api/posts`, { data: { title: "forbidden" } })).status(), 403);
  console.log("Draft is hidden from Local API, REST, /blog and the article route.");

  const admin = await browser.newContext();
  assert.equal((await admin.request.post(`${baseURL}/api/users/login`, { data: { email, password } })).status(), 200);
  const editor = await admin.newPage();
  editor.setDefaultTimeout(60000);
  editor.setDefaultNavigationTimeout(120000);
  await editor.goto(`${baseURL}/admin/collections/posts/${draft.id}`, { waitUntil: "networkidle" });
  await expect(editor.locator("#field-contentMarkdown")).toHaveValue(markdown);
  await editor.locator("#field-contentMarkdown").focus();
  await editor.locator("#field-contentMarkdown").press("Control+End");
  await editor.getByRole("button", { name: "Insertar Media", exact: true }).click();
  await editor.locator(".list-drawer .default-cell__first-cell").filter({ hasText: `${marker}.png` }).click();
  await expect(editor.locator("#field-contentMarkdown")).toHaveValue(new RegExp(`!\\[${marker}\\]`));
  await editor.getByRole("button", { name: "Insertar Media", exact: true }).click();
  await editor.locator(".list-drawer .list-header__create-new-button").click();
  const uploadDrawer = editor.locator(".doc-drawer").last();
  await uploadDrawer.locator(".file-field__hidden-input").setInputFiles({ name: `${marker}-new.png`, mimeType: "image/png", buffer: imageBytes });
  await uploadDrawer.locator(".file-field__filename").waitFor({ state: "visible" });
  const applyChanges = uploadDrawer.getByRole("button", { name: /Aplicar cambios|Apply changes/i });
  if (await applyChanges.isVisible()) await applyChanges.click();
  await uploadDrawer.locator('input[name="alt"]').fill(`${marker}-new`);
  await uploadDrawer.locator("#action-save").click();
  await expect(editor.locator("#field-contentMarkdown")).toHaveValue(new RegExp(`!\\[${marker}-new\\]`));
  const newMedia = await payload.find({ collection: "media", where: { filename: { equals: `${marker}-new.png` } }, overrideAccess: true });
  assert.equal(newMedia.totalDocs, 1);
  newMediaID = newMedia.docs[0]!.id;
  assert.equal((await fetch(newMedia.docs[0]!.url!)).status, 200);
  await editor.locator("#action-save").click();
  await expect.poll(async () => (await payload.findByID({ collection: "posts", id: draft.id, draft: false }))._status, { timeout: 30000 }).toBe("published");
  const published = await payload.findByID({ collection: "posts", id: draft.id, draft: false });
  assert.ok(published.publishedAt);
  assert.ok(published.contentMarkdown.includes(`![${marker}](${media.url})`));
  await editor.close();
  console.log("Admin inserted existing and newly uploaded Media and published the Markdown post.");

  await visitUntil(page, "/blog", marker, true);
  await visitUntil(page, `/blog/${marker}`, "Encabezado de prueba", true);
  await expect(page.getByRole("heading", { level: 1, name: marker })).toBeVisible();
  await expect(page.locator(".blog-markdown h2")).toHaveText("Encabezado de prueba");
  await expect(page.locator(".blog-markdown li")).toHaveCount(2);
  await expect(page.locator(".blog-markdown pre code")).toContainText("const ejemplo = 1;");
  await expect(page.locator(".blog-markdown a")).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.locator(".blog-markdown table")).toBeVisible();
  await expect(page.locator(".blog-markdown script")).toHaveCount(0);
  await expect(page.locator(".blog-markdown img")).toHaveCount(2);
  await expect.poll(() => page.locator(".blog-markdown img").evaluateAll((images) => images.every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/blog/${marker}$`));
  assert.ok((await page.locator('script[type="application/ld+json"]').textContent())?.includes("BlogPosting"));
  const sitemap = await anonymous.request.get(`${baseURL}/sitemap.xml`);
  assert.ok((await sitemap.text()).includes(`/blog/${marker}`));
  console.log("Public Markdown, Supabase image, metadata and sitemap passed.");

  const changedContent = published.contentMarkdown + "\n\nCambio publicado sin redeploy.";
  await payload.update({ collection: "posts", id: draft.id, data: { contentMarkdown: changedContent, _status: "published" }, draft: false, overrideAccess: true });
  await visitUntil(page, `/blog/${marker}`, "Cambio publicado sin redeploy.", true);
  const updated = await payload.findByID({ collection: "posts", id: draft.id });
  assert.equal(updated.publishedAt, published.publishedAt);
  await payload.update({ collection: "posts", id: draft.id, data: { contentMarkdown: "BORRADOR NO PUBLICADO", _status: "draft" }, draft: true, overrideAccess: true });
  assert.ok((await readPublishedPost(marker))?.contentMarkdown.includes("Cambio publicado sin redeploy."));
  assert.ok(!(await readPublishedPost(marker))?.contentMarkdown.includes("BORRADOR NO PUBLICADO"));
  console.log("Updates became public without redeploy; later drafts did not replace the published article.");
} finally {
  const failures: string[] = [];
  await browser.close();
  if (postID !== undefined) await payload.delete({ collection: "posts", id: postID, overrideAccess: true }).catch(() => failures.push(`post ${postID}`));
  // Recover the exact test upload ID if the browser failed after saving it.
  if (newMediaID === undefined) newMediaID = (await payload.find({ collection: "media", where: { filename: { equals: `${marker}-new.png` } }, overrideAccess: true })).docs[0]?.id;
  if (newMediaID !== undefined) await payload.delete({ collection: "media", id: newMediaID, overrideAccess: true }).catch(() => failures.push(`media ${newMediaID}`));
  if (mediaID !== undefined) await payload.delete({ collection: "media", id: mediaID, overrideAccess: true }).catch(() => failures.push(`media ${mediaID}`));
  if (userID !== undefined) await payload.delete({ collection: "users", id: userID, overrideAccess: true }).catch(() => failures.push(`user ${userID}`));
  await payload.destroy();
  assert.deepEqual(failures, [], "Temporary records require cleanup");
  console.log("Temporary post, media and administrator deleted.");
}
