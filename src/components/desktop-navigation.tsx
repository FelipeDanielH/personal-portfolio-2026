import Link from "next/link";
import { navigation } from "./navigation";

export function DesktopNavigation() {
  return (
    <nav className="desktop-nav" aria-label="Navegación principal">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="nav-link"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
