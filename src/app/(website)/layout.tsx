import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { getPortfolioContent } from "@/content/data";
import { siteUrl } from "@/lib/site";
import "../globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Felipe Henríquez · Desarrollador Full Stack",
    template: "%s · Felipe Henríquez",
  },
  description:
    "Portafolio de Felipe Henríquez, ingeniero en informática y desarrollador full stack especializado en React, Node.js y Spring Boot.",
  applicationName: "Portafolio de Felipe Henríquez",
  authors: [{ name: "Felipe Henríquez" }],
  creator: "Felipe Henríquez",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "/",
    siteName: "Felipe Henríquez",
    title: "Felipe Henríquez · Desarrollador Full Stack",
    description: "Código claro. Productos que avanzan.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Felipe Henríquez, Desarrollador Full Stack" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Felipe Henríquez · Desarrollador Full Stack",
    description: "Código claro. Productos que avanzan.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#07111f" },
  ],
  colorScheme: "light dark",
};

export default async function WebsiteLayout({ children }: { children: ReactNode }) {
  const { settings } = await getPortfolioContent();

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body id="top">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a className="skip-link" href="#main-content">Saltar al contenido</a>
          <SiteHeader />
          {children}
          <a className="back-to-top" href="#top" aria-label="Volver arriba">↑</a>
          <SiteFooter settings={settings} />
        </ThemeProvider>
      </body>
    </html>
  );
}
