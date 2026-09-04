import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";
import { publishedOrAuthenticated } from "../access/published-or-authenticated";
import { orderField } from "../fields/order";
import { stableKeyField } from "../fields/stable-key";
import { stringListField } from "../fields/string-list";

export const Credentials: CollectionConfig = {
  slug: "credentials",
  labels: {
    singular: "Formación o certificación",
    plural: "Formación y certificaciones",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "key", "institution", "type", "credentialStatus", "year", "order", "_status"],
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
    stableKeyField("generation"),
    {
      name: "type",
      type: "radio",
      label: "Tipo",
      required: true,
      options: [
        { label: "Formación", value: "education" },
        { label: "Certificación", value: "certification" },
      ],
    },
    { name: "title", type: "text", label: "Título", required: true },
    { name: "institution", type: "text", label: "Institución", required: true },
    { name: "year", type: "text", label: "Año", required: true },
    { name: "date", type: "date", label: "Fecha", required: true },
    { name: "description", type: "textarea", label: "Descripción", required: true },
    stringListField("details", "Detalles"),
    { name: "duration", type: "text", label: "Duración" },
    { name: "location", type: "text", label: "Ubicación" },
    {
      name: "certificateUrl",
      type: "text",
      label: "URL del certificado",
      validate: (value: null | string | undefined) => {
        if (!value) {
          return true;
        }

        try {
          const url = new URL(value);
          return ["http:", "https:"].includes(url.protocol) || "Usa una URL http o https.";
        } catch {
          return "Ingresa una URL válida.";
        }
      },
    },
    stringListField("skills", "Habilidades"),
    {
      name: "credentialStatus",
      type: "select",
      label: "Estado",
      required: true,
      options: [
        { label: "Completado", value: "completed" },
        { label: "En progreso", value: "in-progress" },
      ],
    },
    orderField,
  ],
};
