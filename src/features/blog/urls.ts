export function safeLinkURL(value: string): string | undefined {
  if (!value || /[\u0000-\u0020\\]/.test(value)) return undefined;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("#")) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:", "mailto:"].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

export function allowedMediaURL(value: string, publicBase: string): string | undefined {
  try {
    const url = new URL(value);
    const base = new URL(publicBase);
    if (url.protocol !== "https:" || url.origin !== base.origin || url.username || url.password || url.search || url.hash) return undefined;
    const basePath = `${base.pathname.replace(/\/+$/, "")}/`;
    if (!url.pathname.startsWith(basePath) || /%2f|%5c|%2e/i.test(url.pathname)) return undefined;
    return url.href;
  } catch { return undefined; }
}
