import type { GlobalConfig } from "payload";
import { authenticated } from "../access/authenticated";
import { externalLinksField } from "../fields/external-link";
import { stringListField } from "../fields/string-list";
import { validateUniqueAboutAnchors } from "../fields/unique-about-anchor";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Perfil y sitio",
  admin: {
    group: "Portafolio",
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  versions: {
    drafts: true,
    max: 5,
  },
  fields: [
    { name: "name", type: "text", label: "Nombre", required: true },
    { name: "role", type: "text", label: "Rol profesional", required: true },
    { name: "eyebrow", type: "text", label: "Línea superior", required: true },
    { name: "summary", type: "textarea", label: "Propuesta de valor", required: true, maxLength: 240 },
    { name: "bio", type: "textarea", label: "Biografía breve", required: true },
    { name: "location", type: "text", label: "Ubicación", required: true },
    { name: "availability", type: "text", label: "Disponibilidad", required: true },
    { name: "email", type: "email", label: "Correo público", required: true },
    { name: "phone", type: "text", label: "Teléfono público" },
    {
      name: "cv",
      type: "upload",
      label: "CV",
      relationTo: "media",
      filterOptions: { mimeType: { equals: "application/pdf" } },
    },
    {
      name: "avatar",
      type: "upload",
      label: "Fotografía",
      relationTo: "media",
      filterOptions: { mimeType: { contains: "image" } },
    },
    {
      ...externalLinksField("Redes"),
      name: "socialLinks",
    },
    {
      name: "aboutSections",
      type: "array",
      label: "Secciones Sobre mí",
      required: true,
      minRows: 1,
      validate: validateUniqueAboutAnchors,
      fields: [
        { name: "anchor", type: "text", label: "Identificador", required: true },
        { name: "title", type: "text", label: "Título", required: true },
        { ...stringListField("body", "Párrafos"), required: true, minRows: 1 },
      ],
    },
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "title", type: "text", label: "Título", required: true, maxLength: 60 },
        { name: "description", type: "textarea", label: "Descripción", required: true, maxLength: 160 },
      ],
    },
  ],
};
