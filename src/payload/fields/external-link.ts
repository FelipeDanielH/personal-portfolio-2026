import type { ArrayField } from "payload";

export const externalLinksField = (label: string): ArrayField => ({
  name: "links",
  type: "array",
  label,
  fields: [
    {
      name: "label",
      type: "text",
      label: "Etiqueta",
      required: true,
    },
    {
      name: "url",
      type: "text",
      label: "URL",
      required: true,
      validate: (value: null | string | undefined) => {
        if (!value) {
          return "La URL es obligatoria.";
        }

        try {
          const url = new URL(value);
          return ["http:", "https:"].includes(url.protocol) || "Usa una URL http o https.";
        } catch {
          return "Ingresa una URL válida.";
        }
      },
    },
  ],
});
