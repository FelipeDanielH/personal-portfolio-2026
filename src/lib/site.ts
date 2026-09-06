export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

export const publicRoutes = [
  "",
  "/sobre-mi",
  "/habilidades",
  "/experiencia",
  "/proyectos",
  "/formacion",
  "/blog",
] as const;
