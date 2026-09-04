import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";
import { publishedOrAuthenticated } from "../access/published-or-authenticated";
import { orderField } from "../fields/order";
import { stableKeyField } from "../fields/stable-key";
import { stringListField } from "../fields/string-list";

export const SkillCategories: CollectionConfig = {
  slug: "skill-categories",
  labels: {
    singular: "Categoría de habilidades",
    plural: "Categorías de habilidades",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "key", "order", "_status"],
    group: "Portafolio",
  },
  defaultSort: "order",
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  versions: {
    drafts: true,
    maxPerDoc: 3,
  },
  fields: [
    stableKeyField("frontend"),
    {
      name: "title",
      type: "text",
      label: "Título",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripción",
      required: true,
    },
    orderField,
    {
      name: "skills",
      type: "array",
      label: "Habilidades",
      required: true,
      minRows: 1,
      fields: [
        {
          name: "name",
          type: "text",
          label: "Nombre",
          required: true,
        },
        stringListField("highlights", "Conceptos"),
      ],
    },
  ],
};
