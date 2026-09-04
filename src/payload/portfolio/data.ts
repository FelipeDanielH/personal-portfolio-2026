import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { normalizeContent } from "../../content/selectors";
import type { PortfolioContent } from "../../content/types";
import { mapPayloadPortfolio } from "./mapper";
import { readPublishedPortfolioSnapshot } from "./repository";

export const portfolioContentCacheTag = "portfolio-content";

export async function getPublishedPayloadContent(): Promise<PortfolioContent> {
  "use cache";

  cacheLife({ revalidate: 60, expire: 3600 });
  cacheTag(portfolioContentCacheTag);

  return normalizeContent(mapPayloadPortfolio(await readPublishedPortfolioSnapshot()));
}
