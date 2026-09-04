import { Mail, MapPin } from "lucide-react";
import Link from "next/link";
import type { SiteSettings } from "@/content/types";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link href="/" className="footer-name">{settings.name}</Link>
          <p>{settings.role}. Construyendo software con propósito y una base clara.</p>
        </div>
        <div className="footer-contact" aria-label="Contacto">
          <a href={`mailto:${settings.email}`}><Mail aria-hidden="true" /> {settings.email}</a>
          <span><MapPin aria-hidden="true" /> {settings.location}</span>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {settings.name}</span>
        <span>Next.js · TypeScript · Payload</span>
      </div>
    </footer>
  );
}
