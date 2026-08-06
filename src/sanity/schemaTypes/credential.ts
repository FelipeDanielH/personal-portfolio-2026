import { defineArrayMember, defineField, defineType } from "sanity";

export const credentialType = defineType({
  name: "credential",
  title: "Formación o certificación",
  type: "document",
  fields: [
    defineField({ name: "type", title: "Tipo", type: "string", options: { list: [{ title: "Formación", value: "education" }, { title: "Certificación", value: "certification" }], layout: "radio" }, validation: (rule) => rule.required() }),
    defineField({ name: "title", title: "Título", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "institution", title: "Institución", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "year", title: "Año", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "date", title: "Fecha", type: "date", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Descripción", type: "text", rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: "details", title: "Detalles", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "duration", title: "Duración", type: "string" }),
    defineField({ name: "location", title: "Ubicación", type: "string" }),
    defineField({ name: "certificateUrl", title: "URL del certificado", type: "url", validation: (rule) => rule.uri({ scheme: ["http", "https"] }) }),
    defineField({ name: "skills", title: "Habilidades", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "status", title: "Estado", type: "string", options: { list: ["Completado", "En progreso"], layout: "radio" }, validation: (rule) => rule.required() }),
    defineField({ name: "order", title: "Orden", type: "number", validation: (rule) => rule.required().integer().min(0) }),
  ],
  orderings: [{ title: "Orden", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "institution" } },
});
