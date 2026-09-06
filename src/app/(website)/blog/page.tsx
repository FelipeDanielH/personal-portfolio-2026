import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { getBlogPosts } from "@/features/blog/data";
import { PostCard } from "@/features/blog/post-card";
import "./styles.css";

export const metadata: Metadata = {
  title: "Blog", description: "Notas sobre desarrollo, decisiones técnicas y aprendizajes.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "Blog", description: "Notas de desarrollo y aprendizajes.", url: "/blog" },
};

async function PostList() {
  const posts = await getBlogPosts();
  return <div className="shell blog-grid">
      {posts.length ? posts.map((post) => <PostCard key={post.slug} post={post} />) : <p className="glass-panel blog-empty">Todavía no hay artículos publicados. Pronto compartiré nuevos aprendizajes.</p>}
    </div>;
}

export default function BlogPage() {
  return <main id="main-content" className="page-main">
    <PageHeader eyebrow="Blog" title="Notas desde el código." description="Decisiones técnicas, ideas y aprendizajes de construir software." />
    <Suspense fallback={<p className="shell" role="status">Cargando artículos…</p>}><PostList /></Suspense>
  </main>;
}
