export type BlogImage = { url: string; alt: string; width: number; height: number };
export type PostSummary = {
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  featuredImage: BlogImage | null;
};
export type BlogPost = PostSummary & { contentMarkdown: string };
