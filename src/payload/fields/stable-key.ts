import type { TextField } from "payload";

export function stableKeyField(example: string): TextField {
  return {
    name: "key",
    type: "text",
    label: "Clave técnica",
    required: true,
    unique: true,
    index: true,
    admin: {
      description: `Identificador estable para seeds y relaciones. Ejemplo: ${example}.`,
    },
  };
}
