import type { Metadata } from "next";
import type { SiteSettings } from "./types";

const fallbackTitle = "Portafolio";
const fallbackDescription = "Portafolio profesional.";

export function websiteMetadata(settings: SiteSettings): Metadata {
  const name = settings.name.trim() || fallbackTitle;
  const role = settings.role.trim();
  const title = settings.seo.title.trim() || (role ? `${name} · ${role}` : name);
  const description = settings.seo.description.trim() || fallbackDescription;

  return {
    title: { default: title, template: `%s · ${name}` },
    description,
    applicationName: name,
    authors: [{ name }],
    creator: name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "es_CL",
      url: "/",
      siteName: name,
      title,
      description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: role ? `${name}, ${role}` : name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}
