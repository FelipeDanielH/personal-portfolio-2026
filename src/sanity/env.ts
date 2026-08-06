const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim();

export const sanityEnv = {
  projectId: projectId || "projectid",
  dataset: dataset || "production",
  apiVersion: "2026-08-05",
};

export const hasSanityProject = Boolean(projectId && dataset);
