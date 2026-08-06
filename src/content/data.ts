import { fallbackContent } from "./fallback";
import { normalizeContent } from "./selectors";
import type { PortfolioContent } from "./types";
import { isSanityRuntimeConfigured } from "@/sanity/lib/configured";

export async function getPortfolioContent(): Promise<PortfolioContent> {
  if (!isSanityRuntimeConfigured()) {
    return normalizeContent(fallbackContent);
  }

  const { getConfiguredContent } = await import("@/sanity/lib/configured-data");
  return getConfiguredContent();
}
