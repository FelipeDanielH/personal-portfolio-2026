export function isSanityRuntimeConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() &&
      process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() &&
      process.env.SANITY_API_READ_TOKEN?.trim(),
  );
}
