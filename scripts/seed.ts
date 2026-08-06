import { createClient } from "@sanity/client";
import { fallbackContent } from "../src/content/fallback";
import { sanitizeLinks } from "../src/content/selectors";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  throw new Error("Configura NEXT_PUBLIC_SANITY_PROJECT_ID y SANITY_API_WRITE_TOKEN antes de ejecutar el seed.");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-08-01", useCdn: false });

const settings = fallbackContent.settings;
const transaction = client.transaction();

transaction.createOrReplace({
  _id: "siteSettings",
  _type: "siteSettings",
  name: settings.name,
  role: settings.role,
  eyebrow: settings.eyebrow,
  summary: settings.summary,
  bio: settings.bio,
  location: settings.location,
  availability: settings.availability,
  email: settings.email,
  ...(settings.phone ? { phone: settings.phone } : {}),
  socialLinks: sanitizeLinks(settings.socialLinks).map((link, index) => ({ _key: `social-${index}`, ...link })),
  aboutSections: settings.aboutSections.map((section) => ({
    _key: section.id,
    id: { _type: "slug", current: section.id },
    title: section.title,
    body: section.body,
  })),
  seo: settings.seo,
});

for (const category of fallbackContent.skills) {
  transaction.createOrReplace({
    _id: `skillCategory.${category.id}`,
    _type: "skillCategory",
    title: category.title,
    description: category.description,
    order: category.order,
    skills: category.skills.map((skill, index) => ({
      _key: `skill-${index}`,
      name: skill.name,
      highlights: skill.highlights,
    })),
  });
}

for (const item of fallbackContent.experience) {
  transaction.createOrReplace({
    _id: `experience.${item.id}`,
    _type: "experience",
    title: item.title,
    ...(item.company ? { company: item.company } : {}),
    period: item.period,
    location: item.location,
    summary: item.summary,
    responsibilities: item.responsibilities,
    achievements: item.achievements,
    technologies: item.technologies,
    projectType: item.projectType,
    order: item.order,
  });
}

for (const project of fallbackContent.projects) {
  transaction.createOrReplace({
    _id: `project.${project.id}`,
    _type: "project",
    name: project.name,
    description: project.description,
    longDescription: project.longDescription,
    technologies: project.technologies,
    frameworks: project.frameworks,
    languages: project.languages,
    roles: project.roles,
    links: sanitizeLinks(project.links).map((link, index) => ({ _key: `link-${index}`, ...link })),
    status: project.status,
    year: project.year,
    featured: project.featured,
    order: project.order,
  });
}

for (const credential of fallbackContent.credentials) {
  transaction.createOrReplace({
    _id: `credential.${credential.id}`,
    _type: "credential",
    type: credential.type,
    title: credential.title,
    institution: credential.institution,
    year: credential.year,
    date: credential.date,
    description: credential.description,
    details: credential.details,
    ...(credential.duration ? { duration: credential.duration } : {}),
    ...(credential.location ? { location: credential.location } : {}),
    ...(credential.certificateUrl ? { certificateUrl: credential.certificateUrl } : {}),
    skills: credential.skills,
    status: credential.status,
    order: credential.order,
  });
}

const result = await transaction.commit();
console.log(`Seed completado de forma idempotente: ${result.results.length} documentos actualizados.`);
