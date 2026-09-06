import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";
import { normalizeTags, slugFromTitle } from "../../features/blog/editorial";
import { authenticated } from "../access/authenticated";
import { publishedOrAuthenticated } from "../access/published-or-authenticated";

export const setFirstPublishedAt: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (originalDoc?.publishedAt) data.publishedAt = originalDoc.publishedAt;
  else if (data._status === "published") data.publishedAt = new Date().toISOString();
  return data;
};

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Artículo", plural: "Artículos" },
  admin: { group: "Blog", useAsTitle: "title", defaultColumns: ["title", "slug", "_status", "publishedAt", "updatedAt"] },
  access: { create: authenticated, update: authenticated, delete: authenticated, read: publishedOrAuthenticated },
  versions: { drafts: { autosave: { interval: 15000 } }, maxPerDoc: 10 },
  defaultSort: "-publishedAt",
  hooks: { beforeChange: [setFirstPublishedAt] },
  fields: [
    { name: "title", type: "text", label: "Título", required: true, maxLength: 180 },
    {
      name: "slug", type: "text", label: "Slug", required: true, unique: true, index: true,
      admin: { description: "Se genera del título al guardar si está vacío. Puedes editarlo; cambiarlo cambia la URL." },
      hooks: { beforeValidate: [({ value, siblingData }) => slugFromTitle(typeof value === "string" && value.trim() ? value : siblingData?.title ?? "")] },
      validate: (value: string | null | undefined) => Boolean(value && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) || "Usa letras, números y guiones.",
    },
    { name: "excerpt", type: "textarea", label: "Extracto", required: true, maxLength: 320 },
    {
      name: "contentMarkdown", type: "textarea", label: "Contenido Markdown", required: true, maxLength: 200000,
      admin: { components: { Field: "./src/payload/admin/MarkdownField#MarkdownField" } },
    },
    {
      name: "featuredImage", type: "upload", label: "Imagen destacada", relationTo: "media",
      filterOptions: { mimeType: { contains: "image/" } },
    },
    {
      name: "tags", type: "text", hasMany: true, label: "Tags", maxRows: 20,
      hooks: { beforeValidate: [({ value }) => normalizeTags(value)] },
    },
    {
      name: "publishedAt", type: "date", label: "Primera publicación",
      admin: { position: "sidebar", readOnly: true, description: "Se establece al publicar por primera vez." },
      access: { create: () => false, update: () => false },
    },
  ],
};
