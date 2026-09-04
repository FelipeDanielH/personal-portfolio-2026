import type { ArrayField } from "payload";

export const validateUniqueAboutAnchors: NonNullable<ArrayField["validate"]> = (value) => {
  if (!Array.isArray(value)) return true;

  const anchors = value
    .map((section) => section && typeof section === "object" && "anchor" in section ? section.anchor : undefined)
    .filter((anchor): anchor is string => typeof anchor === "string" && anchor.length > 0);

  return new Set(anchors).size === anchors.length || "Cada sección debe tener un identificador único.";
};
