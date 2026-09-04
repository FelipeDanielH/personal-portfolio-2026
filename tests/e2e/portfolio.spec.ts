import { expect, test } from "@playwright/test";

const routes = [
  ["/", "Desarrollador Full Stack"],
  ["/sobre-mi", "Curiosidad técnica"],
  ["/habilidades", "Capacidad aplicada"],
  ["/experiencia", "Tecnología dentro"],
  ["/proyectos", "Ideas convertidas"],
  ["/formacion", "Fundamentos sólidos"],
] as const;

for (const [route, heading] of routes) {
  test(`${route} carga contenido y metadatos`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1, name: new RegExp(heading, "i") })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /http:\/\/localhost:3000/);
    await expect(page.locator('a[href="#"]')).toHaveCount(0);
  });
}

test("el tema se puede cambiar sin perder la preferencia", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const html = page.locator("html");
  const initial = await html.getAttribute("class");
  await page.getByRole("button", { name: "Cambiar tema de color" }).click();
  await expect.poll(() => html.getAttribute("class")).not.toBe(initial);
  await page.reload();
  await expect(html).toHaveClass(/dark|light/);
});

test("los filtros de proyectos actualizan el catálogo", async ({ page }) => {
  await page.goto("/proyectos");
  await page.waitForLoadState("networkidle");
  await page.getByRole("group", { name: "Lenguaje" }).getByRole("button", { name: "Java", exact: true }).click();
  await expect(page.getByText(/3 de 4 proyectos/)).toBeVisible();
  await page.getByRole("button", { name: "Limpiar" }).click();
  await expect(page.getByText(/4 de 4 proyectos/)).toBeVisible();
});

test("la landing expone JSON-LD y el footer alimentados por el contenido publicado", async ({ page, isMobile }) => {
  await page.goto("/");
  const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? "{}") as {
    name?: string;
    knowsAbout?: string[];
  };

  expect(jsonLd.name).toBe("Felipe Henríquez");
  expect(jsonLd.knowsAbout).toContain("TypeScript");
  await expect(page.locator("footer")).toContainText("felipe.daniel.henriquez@gmail.com");
  await expect(page.locator("footer")).toContainText("Next.js · TypeScript · Payload");
  if (isMobile) {
    await page.getByRole("button", { name: "Abrir menú" }).click();
    await expect(page.getByRole("navigation", { name: "Navegación móvil" })).toContainText("Proyectos");
  } else {
    await expect(page.getByRole("navigation", { name: "Navegación principal" })).toContainText("Proyectos");
  }
});

test("el formulario comunica éxito y es operable con teclado", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.fulfill({
    status: 202,
    contentType: "application/json",
    body: JSON.stringify({ ok: true }),
  }));
  await page.goto("/");
  await page.getByLabel("Nombre").fill("Ada Lovelace");
  await page.getByLabel("Correo").fill("ada@example.com");
  await page.getByLabel("Mensaje").fill("Quiero conversar sobre una plataforma web para mi equipo.");
  await page.getByRole("button", { name: "Enviar mensaje" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Mensaje enviado.")).toBeVisible();
});

test("la navegación móvil abre, navega y cierra", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Comportamiento específico del viewport móvil");
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("navigation", { name: "Navegación móvil" }).getByRole("link", { name: "Experiencia" }).click();
  await expect(page).toHaveURL(/\/experiencia$/);
  await expect(page.getByRole("button", { name: "Abrir menú" })).toBeVisible();
});

test("el enlace de salto lleva el foco al contenido", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
});
