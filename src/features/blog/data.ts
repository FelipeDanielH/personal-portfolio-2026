import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { readPublishedPost, readPublishedPosts } from "../../payload/blog/repository";

export async function getBlogPosts() {
  "use cache";
  cacheTag("posts");
  cacheLife({ stale: 0, revalidate: 30, expire: 60 });
  return readPublishedPosts();
}

export async function getBlogPost(slug: string) {
  "use cache";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) return null;
  cacheTag("posts", `post:${slug}`);
  cacheLife({ stale: 0, revalidate: 30, expire: 60 });
  return readPublishedPost(slug);
}
