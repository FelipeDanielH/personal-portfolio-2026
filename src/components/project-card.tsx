import { ArrowUpRight, Code2 } from "lucide-react";
import Image from "next/image";
import type { Project } from "@/content/types";
import { TagList } from "./tag-list";

export function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  return (
    <article className="project-card glass-panel" id={`proyecto-${project.id}`}>
      <div className="project-visual">
        {project.image ? (
          <Image
            src={project.image.url}
            alt={project.image.alt}
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
            className="project-image"
          />
        ) : (
          <div className="project-fallback" aria-hidden="true">
            <Code2 />
            <span>{project.name.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
        <span className={`status-badge ${project.status === "Completado" ? "done" : "building"}`}>
          {project.status}
        </span>
      </div>
      <div className="project-body">
        <div className="project-meta"><span>{project.year}</span><span>{project.roles.join(" · ")}</span></div>
        <h3>{project.name}</h3>
        <p className="project-summary">{project.description}</p>
        {!compact ? <p className="project-description">{project.longDescription}</p> : null}
        <TagList items={project.technologies} label={`Tecnologías de ${project.name}`} />
        {project.links.length ? (
          <div className="project-links">
            {project.links.map((link) => (
              <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">
                {link.label} <ArrowUpRight aria-hidden="true" />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
