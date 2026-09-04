import type { PortfolioContent } from "../../content/types";
import type { Media } from "../../payload-types";
import type { PayloadPortfolioSnapshot } from "./repository";

function values(items: null | undefined | Array<{ value: string }>): string[] {
  return items?.map(({ value }) => value) ?? [];
}

function mediaAsset(media: Media | number | null | undefined) {
  if (!media || typeof media === "number" || !media.url) return undefined;
  return { url: media.url, alt: media.alt };
}

export function mapPayloadPortfolio(snapshot: PayloadPortfolioSnapshot): PortfolioContent {
  const avatar = mediaAsset(snapshot.settings.avatar);
  const cv = mediaAsset(snapshot.settings.cv);

  return {
    settings: {
      name: snapshot.settings.name,
      role: snapshot.settings.role,
      eyebrow: snapshot.settings.eyebrow,
      summary: snapshot.settings.summary,
      bio: snapshot.settings.bio,
      location: snapshot.settings.location,
      availability: snapshot.settings.availability,
      email: snapshot.settings.email,
      ...(snapshot.settings.phone ? { phone: snapshot.settings.phone } : {}),
      ...(cv ? { cvUrl: cv.url } : {}),
      socialLinks: snapshot.settings.socialLinks?.map(({ label, url }) => ({ label, url })) ?? [],
      aboutSections: snapshot.settings.aboutSections.map((section) => ({
        id: section.anchor,
        title: section.title,
        body: values(section.body),
      })),
      seo: snapshot.settings.seo,
      ...(avatar ? { avatar } : {}),
    },
    skills: snapshot.skills.map((category) => ({
      id: category.key,
      title: category.title,
      description: category.description,
      order: category.order,
      skills: category.skills.map((skill) => ({ name: skill.name, highlights: values(skill.highlights) })),
    })),
    experience: snapshot.experience.map((item) => ({
      id: item.key,
      title: item.title,
      ...(item.company ? { company: item.company } : {}),
      period: item.period,
      location: item.location,
      summary: item.summary,
      responsibilities: values(item.responsibilities),
      achievements: values(item.achievements),
      technologies: values(item.technologies),
      projectType: item.projectType,
      order: item.order,
    })),
    projects: snapshot.projects.map((project) => {
      const image = mediaAsset(project.image);
      return {
        id: project.key,
        name: project.name,
        description: project.description,
        longDescription: project.longDescription,
        technologies: values(project.technologies),
        frameworks: values(project.frameworks),
        languages: values(project.languages),
        roles: values(project.roles),
        links: project.links?.map(({ label, url }) => ({ label, url })) ?? [],
        status: project.projectStatus === "completed" ? "Completado" : "En desarrollo",
        year: project.year,
        featured: Boolean(project.featured),
        order: project.order,
        ...(image ? { image } : {}),
      };
    }),
    credentials: snapshot.credentials.map((credential) => ({
      id: credential.key,
      type: credential.type,
      title: credential.title,
      institution: credential.institution,
      year: credential.year,
      date: credential.date.slice(0, 10),
      description: credential.description,
      details: values(credential.details),
      ...(credential.duration ? { duration: credential.duration } : {}),
      ...(credential.location ? { location: credential.location } : {}),
      ...(credential.certificateUrl ? { certificateUrl: credential.certificateUrl } : {}),
      skills: values(credential.skills),
      status: credential.credentialStatus === "completed" ? "Completado" : "En progreso",
      order: credential.order,
    })),
  };
}
