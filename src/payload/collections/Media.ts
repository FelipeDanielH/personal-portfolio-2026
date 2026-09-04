import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "Archivo",
    plural: "Archivos",
  },
  admin: {
    group: "Contenido",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  upload: {
    adminThumbnail: ({ doc }) => {
      const thumbnail =
        doc.sizes && typeof doc.sizes === "object" && "thumbnail" in doc.sizes
          ? doc.sizes.thumbnail
          : undefined;

      if (
        thumbnail &&
        typeof thumbnail === "object" &&
        "url" in thumbnail &&
        typeof thumbnail.url === "string"
      ) {
        return thumbnail.url;
      }

      return typeof doc.url === "string" ? doc.url : null;
    },
    disableLocalStorage: true,
    displayPreview: true,
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "application/pdf",
    ],
    imageSizes: [
      {
        name: "thumbnail",
        width: 480,
        height: 320,
        position: "centre",
      },
      {
        name: "card",
        width: 960,
        height: 640,
        position: "centre",
      },
    ],
    focalPoint: true,
    crop: true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Texto alternativo o descripción",
      required: true,
    },
  ],
};
