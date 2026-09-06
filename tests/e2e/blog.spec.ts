import { expect, test } from "@playwright/test";

test("blog is reachable and has canonical metadata", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Notas desde el código.");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/blog$/);
  await expect(page.locator(".blog-grid")).toBeVisible();
});

test("missing posts do not expose an article and are noindex", async ({ page }) => {
  await page.goto("/blog/does-not-exist-validation");
  await expect(page.locator(".blog-article")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
});
