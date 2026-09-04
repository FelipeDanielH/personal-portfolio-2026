import type { Payload } from "payload";
import { fallbackContent } from "../../content/fallback";
import { sanitizeLinks } from "../../content/selectors";

type SeedCollection = "skill-categories" | "experiences" | "projects" | "credentials";
type SeedResult = { created: number; updated: number };

const stringList = (items: string[]) => items.map((value) => ({ value }));

async function upsertPublished(
  payload: Payload,
  collection: SeedCollection,
  key: string,
  write: (id: number | undefined) => Promise<unknown>,
): Promise<"created" | "updated"> {
  const existing = await payload.find({
    collection,
    where: { key: { equals: key } },
    draft: true,
    depth: 0,
    limit: 2,
    overrideAccess: true,
  });

  if (existing.totalDocs > 1) {
    throw new Error(`La clave ${collection}:${key} no es única.`);
  }

  const current = existing.docs[0];
  if (current) {
    await write(current.id);
    return "updated";
  }

  await write(undefined);
  return "created";
}

export async function seedPortfolioContent(payload: Payload): Promise<SeedResult> {
  const result: SeedResult = { created: 0, updated: 0 };
  const record = (operation: "created" | "updated") => {
    result[operation] += 1;
  };

  const settings = fallbackContent.settings;
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      name: settings.name,
      role: settings.role,
      eyebrow: settings.eyebrow,
      summary: settings.summary,
      bio: settings.bio,
      location: settings.location,
      availability: settings.availability,
      email: settings.email,
      phone: settings.phone ?? null,
      cv: null,
      avatar: null,
      socialLinks: sanitizeLinks(settings.socialLinks),
      aboutSections: settings.aboutSections.map((section) => ({
        anchor: section.id,
        title: section.title,
        body: stringList(section.body),
      })),
      seo: settings.seo,
      _status: "published",
    },
    draft: false,
    overrideAccess: true,
  });

  for (const category of fallbackContent.skills) {
    const data = {
      key: category.id,
      title: category.title,
      description: category.description,
      order: category.order,
      skills: category.skills.map((skill) => ({
        name: skill.name,
        highlights: stringList(skill.highlights),
      })),
      _status: "published",
    } as const;
    record(await upsertPublished(payload, "skill-categories", category.id, (id) => id == null
      ? payload.create({ collection: "skill-categories", data, draft: false, overrideAccess: true })
      : payload.update({ collection: "skill-categories", id, data, draft: false, overrideAccess: true })));
  }

  for (const item of fallbackContent.experience) {
    const data = {
      key: item.id,
      title: item.title,
      company: item.company ?? null,
      period: item.period,
      location: item.location,
      summary: item.summary,
      responsibilities: stringList(item.responsibilities),
      achievements: stringList(item.achievements),
      technologies: stringList(item.technologies),
      projectType: item.projectType,
      order: item.order,
      _status: "published",
    } as const;
    record(await upsertPublished(payload, "experiences", item.id, (id) => id == null
      ? payload.create({ collection: "experiences", data, draft: false, overrideAccess: true })
      : payload.update({ collection: "experiences", id, data, draft: false, overrideAccess: true })));
  }

  for (const project of fallbackContent.projects) {
    const data = {
      key: project.id,
      name: project.name,
      description: project.description,
      longDescription: project.longDescription,
      image: null,
      technologies: stringList(project.technologies),
      frameworks: stringList(project.frameworks),
      languages: stringList(project.languages),
      roles: stringList(project.roles),
      links: sanitizeLinks(project.links),
      projectStatus: project.status === "Completado" ? "completed" : "in-progress",
      year: project.year,
      featured: project.featured,
      order: project.order,
      _status: "published",
    } as const;
    record(await upsertPublished(payload, "projects", project.id, (id) => id == null
      ? payload.create({ collection: "projects", data, draft: false, overrideAccess: true })
      : payload.update({ collection: "projects", id, data, draft: false, overrideAccess: true })));
  }

  for (const credential of fallbackContent.credentials) {
    const data = {
      key: credential.id,
      type: credential.type,
      title: credential.title,
      institution: credential.institution,
      year: credential.year,
      date: credential.date,
      description: credential.description,
      details: stringList(credential.details),
      duration: credential.duration ?? null,
      location: credential.location ?? null,
      certificateUrl: credential.certificateUrl ?? null,
      skills: stringList(credential.skills),
      credentialStatus: credential.status === "Completado" ? "completed" : "in-progress",
      order: credential.order,
      _status: "published",
    } as const;
    record(await upsertPublished(payload, "credentials", credential.id, (id) => id == null
      ? payload.create({ collection: "credentials", data, draft: false, overrideAccess: true })
      : payload.update({ collection: "credentials", id, data, draft: false, overrideAccess: true })));
  }

  return result;
}
