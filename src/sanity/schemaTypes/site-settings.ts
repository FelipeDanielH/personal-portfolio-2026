import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Perfil y sitio",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nombre", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "role", title: "Rol profesional", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "eyebrow", title: "Línea superior", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "summary", title: "Propuesta de valor", type: "text", rows: 3, validation: (rule) => rule.required().max(240) }),
    defineField({ name: "bio", title: "Biografía breve", type: "text", rows: 5, validation: (rule) => rule.required() }),
    defineField({ name: "location", title: "Ubicación", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "availability", title: "Disponibilidad", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "email", title: "Correo público", type: "email", validation: (rule) => rule.required() }),
    defineField({ name: "phone", title: "Teléfono público", type: "string" }),
    defineField({ name: "cv", title: "CV", type: "file", options: { accept: ".pdf" } }),
    defineField({
      name: "avatar",
      title: "Fotografía",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Texto alternativo", type: "string", validation: (rule) => rule.required() })],
    }),
    defineField({
      name: "socialLinks",
      title: "Redes",
      type: "array",
      of: [defineArrayMember({ type: "externalLink" })],
    }),
    defineField({
      name: "aboutSections",
      title: "Secciones Sobre mí",
      type: "array",
      validation: (rule) => rule.min(1),
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "id", title: "Identificador", type: "slug", options: { source: "title" }, validation: (rule) => rule.required() }),
            defineField({ name: "title", title: "Título", type: "string", validation: (rule) => rule.required() }),
            defineField({
              name: "body",
              title: "Párrafos",
              type: "array",
              of: [defineArrayMember({ type: "text", rows: 4 })],
              validation: (rule) => rule.required().min(1),
            }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Título", type: "string", validation: (rule) => rule.required().max(60) }),
        defineField({ name: "description", title: "Descripción", type: "text", rows: 3, validation: (rule) => rule.required().max(160) }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Perfil y configuración del sitio" }) },
});
