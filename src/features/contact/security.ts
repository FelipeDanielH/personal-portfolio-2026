import { createHash } from "node:crypto";
import type { ContactInput } from "./schema";

export function isTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const allowed = new Set<string>([new URL(request.url).origin]);
  const configuredSite = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredSite) {
    try {
      allowed.add(new URL(configuredSite).origin);
    } catch {
      return false;
    }
  }

  return allowed.has(origin);
}

export function createContactIdempotencyKey(input: ContactInput, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  const canonical = [input.email.toLowerCase(), input.name, input.subject ?? "", input.message, day].join("\n");
  return `portfolio-contact/${createHash("sha256").update(canonical).digest("hex").slice(0, 40)}`;
}
