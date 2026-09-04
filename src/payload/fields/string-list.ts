import type { ArrayField } from "payload";

export const stringListField = (name: string, label: string): ArrayField => ({
  name,
  type: "array",
  label,
  fields: [
    {
      name: "value",
      type: "text",
      label: "Valor",
      required: true,
    },
  ],
});
