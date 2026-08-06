import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPortfolioContent } from "@/content/data";
import { SanityBridge } from "@/sanity/components/sanity-bridge";

export default async function WebsiteLayout({ children }: { children: ReactNode }) {
  const { settings } = await getPortfolioContent();

  return (
    <>
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <SiteHeader />
      {children}
      <a className="back-to-top" href="#top" aria-label="Volver arriba">↑</a>
      <SiteFooter settings={settings} />
      <SanityBridge />
    </>
  );
}
