import { defineArrayMember, defineField, defineType } from "sanity";

export const skillCategoryType = defineType({
  name: "skillCategory",
  title: "Categoría de habilidades",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Descripción", type: "text", rows: 2, validation: (rule) => rule.required() }),
    defineField({ name: "order", title: "Orden", type: "number", validation: (rule) => rule.required().integer().min(0) }),
    defineField({
      name: "skills",
      title: "Habilidades",
      type: "array",
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "name", title: "Nombre", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "highlights", title: "Conceptos", type: "array", of: [defineArrayMember({ type: "string" })] }),
          ],
          preview: { select: { title: "name" } },
        }),
      ],
    }),
  ],
  orderings: [{ title: "Orden", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
});
