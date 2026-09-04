import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";
import { publishedOrAuthenticated } from "../access/published-or-authenticated";
import { externalLinksField } from "../fields/external-link";
import { orderField } from "../fields/order";
import { stableKeyField } from "../fields/stable-key";
import { stringListField } from "../fields/string-list";

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: {
    singular: "Proyecto",
    plural: "Proyectos",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "key", "projectStatus", "year", "featured", "order", "_status"],
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
    maxPerDoc: 5,
  },
  fields: [
    stableKeyField("ecomarket"),
    { name: "name", type: "text", label: "Nombre", required: true },
    { name: "description", type: "text", label: "Resumen", required: true, maxLength: 140 },
    { name: "longDescription", type: "textarea", label: "Descripción", required: true },
    {
      name: "image",
      type: "upload",
      label: "Imagen",
      relationTo: "media",
      filterOptions: { mimeType: { contains: "image" } },
    },
    stringListField("technologies", "Tecnologías"),
    stringListField("frameworks", "Frameworks"),
    stringListField("languages", "Lenguajes"),
    stringListField("roles", "Roles"),
    externalLinksField("Enlaces"),
    {
      name: "projectStatus",
      type: "select",
      label: "Estado",
      required: true,
      options: [
        { label: "Completado", value: "completed" },
        { label: "En desarrollo", value: "in-progress" },
      ],
    },
    { name: "year", type: "text", label: "Año", required: true },
    { name: "featured", type: "checkbox", label: "Destacado", defaultValue: false },
    orderField,
  ],
};
