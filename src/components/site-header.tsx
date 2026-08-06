import Link from "next/link";
import { Braces } from "lucide-react";
import { DesktopNavigation } from "./desktop-navigation";
import { MobileNavigation } from "./mobile-navigation";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner glass-panel">
        <Link href="/" className="brand" aria-label="Felipe Henríquez, inicio">
          <span className="brand-mark" aria-hidden="true"><Braces /></span>
          <span>Felipe<span className="brand-dot">.</span></span>
        </Link>
        <DesktopNavigation />
        <div className="header-actions">
          <ThemeToggle />
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
