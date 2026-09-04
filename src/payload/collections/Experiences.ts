import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";
import { publishedOrAuthenticated } from "../access/published-or-authenticated";
import { orderField } from "../fields/order";
import { stableKeyField } from "../fields/stable-key";
import { stringListField } from "../fields/string-list";

export const Experiences: CollectionConfig = {
  slug: "experiences",
  labels: {
    singular: "Experiencia",
    plural: "Experiencias",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "key", "company", "period", "order", "_status"],
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
    stableKeyField("etpay"),
    { name: "title", type: "text", label: "Cargo", required: true },
    { name: "company", type: "text", label: "Empresa" },
    { name: "period", type: "text", label: "Periodo", required: true },
    { name: "location", type: "text", label: "Ubicación", required: true },
    { name: "summary", type: "textarea", label: "Resumen", required: true },
    stringListField("responsibilities", "Responsabilidades"),
    stringListField("achievements", "Logros"),
    stringListField("technologies", "Tecnologías"),
    { name: "projectType", type: "text", label: "Tipo de proyecto", required: true },
    orderField,
  ],
};
