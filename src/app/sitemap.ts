import type { MetadataRoute } from "next";
import { publicRoutes, siteUrl } from "@/lib/site";
import { getBlogPosts } from "@/features/blog/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();
  return [...publicRoutes.map((route) => ({
    url: new URL(route || "/", siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  })), ...posts.map((post) => ({ url: new URL(`/blog/${post.slug}`, siteUrl).href, lastModified: post.updatedAt }))];
}
