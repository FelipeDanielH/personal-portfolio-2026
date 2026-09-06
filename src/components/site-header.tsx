import Link from "next/link";
import { Suspense } from "react";
import { Braces, Menu } from "lucide-react";
import { DesktopNavigation } from "./desktop-navigation";
import { MobileNavigation } from "./mobile-navigation";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({ name }: { name: string }) {
  return (
    <header className="site-header">
      <div className="header-inner glass-panel">
        <Link href="/" className="brand" aria-label={`${name}, inicio`}>
          <span className="brand-mark" aria-hidden="true"><Braces /></span>
          <span>{name}<span className="brand-dot">.</span></span>
        </Link>
        <DesktopNavigation />
        <div className="header-actions">
          <ThemeToggle />
          <Suspense fallback={<div className="mobile-nav"><button type="button" className="icon-button" aria-label="Cargando menú" disabled><Menu aria-hidden="true" /></button></div>}>
            <MobileNavigation />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
