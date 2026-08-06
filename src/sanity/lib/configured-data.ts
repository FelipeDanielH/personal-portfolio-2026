import { draftMode } from "next/headers";
import type { LivePerspective } from "next-sanity/live";
import type { PortfolioContent } from "@/content/types";
import { normalizeContent } from "@/content/selectors";
import { PORTFOLIO_QUERY } from "./queries";
import { sanityFetch } from "./live";
import { mapSanityContent } from "./mapper";
import type { PORTFOLIO_QUERY_RESULT } from "../sanity.types";

async function fetchCachedContent(perspective: LivePerspective, stega: boolean): Promise<PortfolioContent> {
  "use cache";

  const { data } = await sanityFetch({
    query: PORTFOLIO_QUERY,
    perspective,
    stega,
  });

  // Stega strings are branded strings at the fetch boundary and remain compatible
  // with the generated query shape consumed by the presentation mapper.
  return normalizeContent(mapSanityContent(data as PORTFOLIO_QUERY_RESULT));
}

export async function getConfiguredContent() {
  const { isEnabled } = await draftMode();
  const perspective: LivePerspective = isEnabled ? "drafts" : "published";
  return fetchCachedContent(perspective, isEnabled);
}
