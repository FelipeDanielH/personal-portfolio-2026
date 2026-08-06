import { defineArrayMember, defineField, defineType } from "sanity";

export const projectType = defineType({
  name: "project",
  title: "Proyecto",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nombre", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Resumen", type: "string", validation: (rule) => rule.required().max(140) }),
    defineField({ name: "longDescription", title: "Descripción", type: "text", rows: 5, validation: (rule) => rule.required() }),
    defineField({
      name: "image",
      title: "Imagen",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Texto alternativo", type: "string", validation: (rule) => rule.required() })],
    }),
    defineField({ name: "technologies", title: "Tecnologías", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "frameworks", title: "Frameworks", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "languages", title: "Lenguajes", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "roles", title: "Roles", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "links", title: "Enlaces", type: "array", of: [defineArrayMember({ type: "externalLink" })] }),
    defineField({
      name: "status",
      title: "Estado",
      type: "string",
      options: { list: ["Completado", "En desarrollo"], layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "year", title: "Año", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "featured", title: "Destacado", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Orden", type: "number", validation: (rule) => rule.required().integer().min(0) }),
  ],
  orderings: [{ title: "Orden", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "status", media: "image" } },
});
