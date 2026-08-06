import { describe, expect, it } from "vitest";
import { fallbackContent } from "./fallback";
import { isUsableUrl, normalizeContent, sanitizeLinks, selectFeatured } from "./selectors";

describe("content selectors", () => {
  it("acepta enlaces web y rutas internas, pero oculta acciones incompletas", () => {
    expect(isUsableUrl("https://example.com")).toBe(true);
    expect(isUsableUrl("/curriculum.pdf")).toBe(true);
    expect(isUsableUrl("#")).toBe(false);
    expect(isUsableUrl("javascript:alert(1)")).toBe(false);
    expect(sanitizeLinks([
      { label: "GitHub", url: "https://github.com/example" },
      { label: "Pendiente", url: "#" },
    ])).toEqual([{ label: "GitHub", url: "https://github.com/example" }]);
  });

  it("ordena sin mutar la fuente y elimina un CV inválido", () => {
    const source = structuredClone(fallbackContent);
    source.settings.cvUrl = "#";
    source.projects = source.projects.toReversed();
    source.credentials[0] = { ...source.credentials[0]!, certificateUrl: "#" };

    const normalized = normalizeContent(source);

    expect(normalized.projects.map((project) => project.order)).toEqual([1, 2, 3, 4]);
    expect(source.projects[0]?.order).toBe(4);
    expect(normalized.settings).not.toHaveProperty("cvUrl");
    expect(normalized.credentials[0]).not.toHaveProperty("certificateUrl");
  });

  it("reutiliza el contenido ordenado para los resúmenes de portada", () => {
    const featured = selectFeatured(normalizeContent(fallbackContent));

    expect(featured.projects).toHaveLength(3);
    expect(featured.projects.every((project) => project.featured)).toBe(true);
    expect(featured.experience).toHaveLength(2);
    expect(featured.skills.length).toBeGreaterThan(0);
  });
});
