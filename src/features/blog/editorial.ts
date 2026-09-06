export function slugFromTitle(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120).replace(/-$/, "");
}

export function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().replace(/\s+/g, " ").toLowerCase()).filter(Boolean))];
}

export function markdownImage(alt: string, url: string): string {
  const escapedAlt = alt.replace(/\\/g, "\\\\").replace(/([\[\]])/g, "\\$1").replace(/[\r\n]/g, " ");
  return `![${escapedAlt}](${url.replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\s/g, "%20")})`;
}
