import { defineField, defineType } from "sanity";

export const externalLinkType = defineType({
  name: "externalLink",
  title: "Enlace externo",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Etiqueta", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (rule) => rule.required().uri({ scheme: ["http", "https"] }),
    }),
  ],
  preview: { select: { title: "label", subtitle: "url" } },
});
