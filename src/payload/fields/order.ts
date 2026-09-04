import type { NumberField } from "payload";

export const orderField: NumberField = {
  name: "order",
  type: "number",
  label: "Orden",
  required: true,
  min: 0,
  defaultValue: 0,
  validate: (value: null | number | undefined) =>
    value == null || Number.isInteger(value) || "El orden debe ser un número entero.",
};
