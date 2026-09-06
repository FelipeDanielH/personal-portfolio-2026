import { describe, expect, it } from "vitest";
import { websiteMetadata } from "./site-metadata";

const settings = {
  name: "Nombre publicado",
  role: "Rol publicado",
  seo: { title: "Título SEO", description: "Descripción SEO" },
} as const;

describe("websiteMetadata", () => {
  it("derives global SEO, Open Graph and Twitter metadata from published Site Settings", () => {
    const metadata = websiteMetadata(settings as never);

    expect(metadata.title).toEqual({ default: "Título SEO", template: "%s · Nombre publicado" });
    expect(metadata.description).toBe("Descripción SEO");
    expect(metadata.authors).toEqual([{ name: "Nombre publicado" }]);
    expect(metadata.openGraph).toMatchObject({
      siteName: "Nombre publicado",
      title: "Título SEO",
      description: "Descripción SEO",
    });
    expect(metadata.twitter).toMatchObject({ title: "Título SEO", description: "Descripción SEO" });
  });

  it("keeps safe metadata defaults if editable values are blank", () => {
    const metadata = websiteMetadata({ ...settings, name: "", role: "", seo: { title: "", description: "" } } as never);

    expect(metadata.title).toEqual({ default: "Portafolio", template: "%s · Portafolio" });
    expect(metadata.description).toBe("Portafolio profesional.");
  });
});
