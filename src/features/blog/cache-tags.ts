export const postsCacheTag = "posts";

export function postCacheTag(slug: string): string {
  return `post:${slug}`;
}
