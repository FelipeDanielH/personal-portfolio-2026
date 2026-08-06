import type { ExternalLink, PortfolioContent } from "./types";

export function isUsableUrl(url: string | undefined): url is string {
  if (!url || url === "#") return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return url.startsWith("/");
  }
}

export function sanitizeLinks(links: ExternalLink[]): ExternalLink[] {
  return links.filter((link) => isUsableUrl(link.url));
}

export function normalizeContent(content: PortfolioContent): PortfolioContent {
  const { cvUrl, ...settings } = content.settings;

  return {
    ...content,
    settings: {
      ...settings,
      socialLinks: sanitizeLinks(content.settings.socialLinks),
      ...(isUsableUrl(cvUrl) ? { cvUrl } : {}),
    },
    skills: content.skills.toSorted((a, b) => a.order - b.order),
    experience: content.experience.toSorted((a, b) => a.order - b.order),
    projects: content.projects
      .map((project) => ({ ...project, links: sanitizeLinks(project.links) }))
      .toSorted((a, b) => a.order - b.order),
    credentials: content.credentials
      .map((credential) => {
        const { certificateUrl, ...safeCredential } = credential;
        return {
          ...safeCredential,
          ...(isUsableUrl(certificateUrl) ? { certificateUrl } : {}),
        };
      })
      .toSorted((a, b) => a.order - b.order),
  };
}

export function selectFeatured(content: PortfolioContent) {
  return {
    skills: content.skills.flatMap((category) => category.skills.map((skill) => skill.name)).slice(0, 10),
    experience: content.experience.slice(0, 2),
    projects: content.projects.filter((project) => project.featured).slice(0, 3),
    credentials: content.credentials.slice(0, 2),
  };
}
