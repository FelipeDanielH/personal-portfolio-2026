import Image from "next/image";
import Link from "next/link";
import type { PostSummary } from "./types";

export function PostDate({ value }: { value: string }) {
  return <time dateTime={value}>{new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value))}</time>;
}

export function PostCard({ post }: { post: PostSummary }) {
  return <article className="blog-card glass-panel">
    {post.featuredImage && <Image alt={post.featuredImage.alt} width={post.featuredImage.width} height={post.featuredImage.height} src={post.featuredImage.url} sizes="(max-width: 720px) 100vw, 50vw" className="blog-cover" />}
    <div className="blog-card-body">
      <PostDate value={post.publishedAt} />
      <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
      <p>{post.excerpt}</p>
      <ul className="blog-tags" aria-label="Tags">{post.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
    </div>
  </article>;
}
