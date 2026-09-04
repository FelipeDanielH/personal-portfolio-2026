import type { PortfolioContent } from "./types";
import { getPublishedPayloadContent } from "@/payload/portfolio/data";

export async function getPortfolioContent(): Promise<PortfolioContent> {
  return getPublishedPayloadContent();
}
