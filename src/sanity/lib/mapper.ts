import { fallbackContent } from "@/content/fallback";
import type { PortfolioContent } from "@/content/types";
import type { PORTFOLIO_QUERY_RESULT } from "../sanity.types";

const text = (value: string | null, fallback: string) => value?.trim() || fallback;
const list = (value: string[] | null) => value?.filter(Boolean) ?? [];

export function mapSanityContent(raw: PORTFOLIO_QUERY_RESULT): PortfolioContent {
  const defaults = fallbackContent;
  const settings = raw.settings;

  if (!settings) return defaults;

  return {
    settings: {
      name: text(settings.name, defaults.settings.name),
      role: text(settings.role, defaults.settings.role),
      eyebrow: text(settings.eyebrow, defaults.settings.eyebrow),
      summary: text(settings.summary, defaults.settings.summary),
      bio: text(settings.bio, defaults.settings.bio),
      location: text(settings.location, defaults.settings.location),
      availability: text(settings.availability, defaults.settings.availability),
      email: text(settings.email, defaults.settings.email),
      ...(settings.phone ? { phone: settings.phone } : {}),
      ...(settings.cvUrl ? { cvUrl: settings.cvUrl } : {}),
      ...(settings.avatar?.url && settings.avatar.alt
        ? { avatar: { url: settings.avatar.url, alt: settings.avatar.alt } }
        : {}),
      socialLinks:
        settings.socialLinks?.flatMap((link) =>
          link.label && link.url ? [{ label: link.label, url: link.url }] : [],
        ) ?? [],
      aboutSections:
        settings.aboutSections?.flatMap((section) =>
          section.id && section.title && section.body?.length
            ? [{ id: section.id, title: section.title, body: section.body }]
            : [],
        ) ?? defaults.settings.aboutSections,
      seo: {
        title: text(settings.seo?.title ?? null, defaults.settings.seo.title),
        description: text(settings.seo?.description ?? null, defaults.settings.seo.description),
      },
    },
    skills: raw.skills.flatMap((category) =>
      category.title && category.description
        ? [
            {
              id: category.id,
              title: category.title,
              description: category.description,
              order: category.order ?? 0,
              skills:
                category.skills?.flatMap((skill) =>
                  skill.name ? [{ name: skill.name, highlights: list(skill.highlights) }] : [],
                ) ?? [],
            },
          ]
        : [],
    ),
    experience: raw.experience.flatMap((item) =>
      item.title && item.period && item.location && item.summary && item.projectType
        ? [
            {
              id: item.id,
              title: item.title,
              ...(item.company ? { company: item.company } : {}),
              period: item.period,
              location: item.location,
              summary: item.summary,
              responsibilities: list(item.responsibilities),
              achievements: list(item.achievements),
              technologies: list(item.technologies),
              projectType: item.projectType,
              order: item.order ?? 0,
            },
          ]
        : [],
    ),
    projects: raw.projects.flatMap((project) =>
      project.name &&
      project.description &&
      project.longDescription &&
      project.status &&
      project.year
        ? [
            {
              id: project.id,
              name: project.name,
              description: project.description,
              longDescription: project.longDescription,
              technologies: list(project.technologies),
              frameworks: list(project.frameworks),
              languages: list(project.languages),
              roles: list(project.roles),
              links:
                project.links?.flatMap((link) =>
                  link.label && link.url ? [{ label: link.label, url: link.url }] : [],
                ) ?? [],
              status: project.status,
              year: project.year,
              featured: project.featured ?? false,
              order: project.order ?? 0,
              ...(project.image?.url && project.image.alt
                ? { image: { url: project.image.url, alt: project.image.alt } }
                : {}),
            },
          ]
        : [],
    ),
    credentials: raw.credentials.flatMap((credential) =>
      credential.type &&
      credential.title &&
      credential.institution &&
      credential.year &&
      credential.date &&
      credential.description &&
      credential.status
        ? [
            {
              id: credential.id,
              type: credential.type,
              title: credential.title,
              institution: credential.institution,
              year: credential.year,
              date: credential.date,
              description: credential.description,
              details: list(credential.details),
              ...(credential.duration ? { duration: credential.duration } : {}),
              ...(credential.location ? { location: credential.location } : {}),
              ...(credential.certificateUrl ? { certificateUrl: credential.certificateUrl } : {}),
              skills: list(credential.skills),
              status: credential.status,
              order: credential.order ?? 0,
            },
          ]
        : [],
    ),
  };
}
