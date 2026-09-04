import { getPayload } from "payload";
import config from "../payload.config";
import { seedPortfolioContent } from "../src/payload/portfolio/seed";

const payload = await getPayload({ config });
const result = await seedPortfolioContent(payload);

console.log(JSON.stringify({
  ok: true,
  source: "src/content/fallback.ts",
  ...result,
}, null, 2));
