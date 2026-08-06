import { defineCliConfig } from "sanity/cli";
import { sanityEnv } from "./src/sanity/env";

export default defineCliConfig({
  api: {
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
  },
  typegen: {
    path: "./src/**/*.{ts,tsx}",
    schema: "./src/sanity/extract.json",
    generates: "./src/sanity/sanity.types.ts",
    overloadClientMethods: true,
  },
});
