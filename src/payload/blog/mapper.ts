import type { Media, Post } from "../../payload-types";
import type { BlogImage, BlogPost, PostSummary } from "../../features/blog/types";
import { allowedMediaURL } from "../../features/blog/urls";

function mapImage(media: Media | number | null | undefined): BlogImage | null {
  if (!media || typeof media !== "object" || !media.url || !media.alt || !media.mimeType?.startsWith("image/")) return null;
  const url = allowedMediaURL(media.url, process.env.SUPABASE_STORAGE_PUBLIC_URL ?? "");
  return url ? { url, alt: media.alt, width: media.width || 1200, height: media.height || 800 } : null;
}

export function mapPostSummary(post: Omit<Post, "contentMarkdown">): PostSummary {
  return { title: post.title, slug: post.slug, excerpt: post.excerpt, tags: post.tags ?? [],
    publishedAt: post.publishedAt ?? post.createdAt, updatedAt: post.updatedAt, featuredImage: mapImage(post.featuredImage) };
}

export function mapPost(post: Post): BlogPost {
  return { ...mapPostSummary(post), contentMarkdown: post.contentMarkdown };
}
