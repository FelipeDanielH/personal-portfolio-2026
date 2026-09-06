import { cache } from "react";
import type { PortfolioContent } from "./types";
import { getPublishedPayloadContent } from "@/payload/portfolio/data";

export const getPortfolioContent = cache(async (): Promise<PortfolioContent> => {
  return getPublishedPayloadContent();
});
