import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getBlogPost } from "@/features/blog/data";
import { Markdown } from "@/features/blog/markdown";
import { PostDate } from "@/features/blog/post-card";
import { getPortfolioContent } from "@/content/data";
import { siteUrl } from "@/lib/site";
import "../styles.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost((await params).slug);
  if (!post) notFound();
  const url = new URL(`/blog/${post.slug}`, siteUrl).href;
  const images = post.featuredImage ? [{ url: post.featuredImage.url, alt: post.featuredImage.alt }] : [{ url: "/og.png" }];
  return { title: post.title, description: post.excerpt, alternates: { canonical: url },
    openGraph: { type: "article", title: post.title, description: post.excerpt, url, images, publishedTime: post.publishedAt, modifiedTime: post.updatedAt, tags: post.tags },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images },
  };
}

async function Article({ params }: Props) {
  const post = await getBlogPost((await params).slug);
  if (!post) notFound();
  const { settings } = await getPortfolioContent();
  const jsonLd = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title,
    description: post.excerpt, datePublished: post.publishedAt, dateModified: post.updatedAt,
    mainEntityOfPage: new URL(`/blog/${post.slug}`, siteUrl).href,
    author: { "@type": "Person", name: settings.name, url: siteUrl.href },
    ...(post.featuredImage ? { image: post.featuredImage.url } : {}),
  };
  return <article className="shell blog-article">
    <Link href="/blog">← Volver al blog</Link>
    <header><PostDate value={post.publishedAt} /><h1>{post.title}</h1><p>{post.excerpt}</p>
      <ul className="blog-tags" aria-label="Tags">{post.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
    </header>
    {post.featuredImage && <Image src={post.featuredImage.url} alt={post.featuredImage.alt} width={post.featuredImage.width} height={post.featuredImage.height} sizes="(max-width: 800px) 100vw, 760px" className="blog-cover" />}
    <Markdown content={post.contentMarkdown} publicMediaBase={process.env.SUPABASE_STORAGE_PUBLIC_URL ?? ""} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
  </article>;
}

export default function PostPage(props: Props) {
  return <main id="main-content" className="page-main"><Suspense fallback={<p className="shell" role="status">Cargando artículo…</p>}><Article {...props} /></Suspense></main>;
}
