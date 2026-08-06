import { defineArrayMember, defineField, defineType } from "sanity";

export const experienceType = defineType({
  name: "experience",
  title: "Experiencia",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Cargo", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "company", title: "Empresa", type: "string" }),
    defineField({ name: "period", title: "Periodo", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "location", title: "Ubicación", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "summary", title: "Resumen", type: "text", rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: "responsibilities", title: "Responsabilidades", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "achievements", title: "Logros", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "technologies", title: "Tecnologías", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "projectType", title: "Tipo de proyecto", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "order", title: "Orden", type: "number", validation: (rule) => rule.required().integer().min(0) }),
  ],
  orderings: [{ title: "Más reciente", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "company" } },
});
