import type { Metadata } from "next";
import { CodeXml } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { getPortfolioContent } from "@/content/data";
import { ProjectExplorer } from "@/features/projects/project-explorer";

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Proyectos full stack de Felipe Henríquez construidos con React, Spring Boot, Node.js y bases de datos.",
  alternates: { canonical: "/proyectos" },
};

export default async function ProjectsPage() {
  const { projects } = await getPortfolioContent();

  return (
    <main id="main-content" className="page-main">
      <PageHeader
        eyebrow="Proyectos"
        title="Ideas convertidas en sistemas que funcionan."
        description="Ejercicios y productos con decisiones de interfaz, servicios, seguridad y datos. Los enlaces se publican solo cuando existe una entrega verificable."
        aside={<div className="page-stat glass-panel"><CodeXml aria-hidden="true" /><strong>{projects.length} proyectos</strong><span>frontend, backend y full stack</span></div>}
      />
      <div className="shell projects-page"><ProjectExplorer projects={projects} /></div>
    </main>
  );
}
