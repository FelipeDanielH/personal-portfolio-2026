import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { getPortfolioContent } from "@/content/data";
import { websiteMetadata } from "@/content/site-metadata";
import { siteUrl } from "@/lib/site";
import "../globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPortfolioContent();
  return { metadataBase: siteUrl, ...websiteMetadata(settings) };
}

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
          <SiteHeader name={settings.name} />
          {children}
          <a className="back-to-top" href="#top" aria-label="Volver arriba">↑</a>
          <SiteFooter settings={settings} />
        </ThemeProvider>
      </body>
    </html>
  );
}
