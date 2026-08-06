"use client";

import { presentationTool } from "sanity/presentation";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { sanityEnv } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

const previewOrigin = process.env.SANITY_STUDIO_PREVIEW_URL || "http://localhost:3000";

export default defineConfig({
  name: "default",
  title: "Portafolio de Felipe",
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Contenido")
          .items([
            S.listItem().title("Perfil y sitio").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.divider(),
            ...S.documentTypeListItems().filter((item) => item.getId() !== "siteSettings"),
          ]),
    }),
    presentationTool({
      previewUrl: {
        origin: previewOrigin,
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
  ],
  schema: { types: schemaTypes },
});
