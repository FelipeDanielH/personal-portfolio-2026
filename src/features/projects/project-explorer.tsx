"use client";

import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/content/types";

type Filters = { framework: string; language: string; role: string };
const all = "Todos";
const initialFilters: Filters = { framework: all, language: all, role: all };

function unique(values: string[]) {
  return [all, ...Array.from(new Set(values)).toSorted()];
}

export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const options = useMemo(
    () => ({
      frameworks: unique(projects.flatMap((project) => project.frameworks)),
      languages: unique(projects.flatMap((project) => project.languages)),
      roles: unique(projects.flatMap((project) => project.roles)),
    }),
    [projects],
  );

  const filtered = projects.filter(
    (project) =>
      (filters.framework === all || project.frameworks.includes(filters.framework)) &&
      (filters.language === all || project.languages.includes(filters.language)) &&
      (filters.role === all || project.roles.includes(filters.role)),
  );

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <section className="filter-panel glass-panel" aria-labelledby="filter-title">
        <div className="filter-heading">
          <div><p className="eyebrow">Explorar</p><h2 id="filter-title">Filtra por contexto técnico</h2></div>
          <button type="button" className="button button-secondary" onClick={() => setFilters(initialFilters)}>
            <RotateCcw aria-hidden="true" /> Limpiar
          </button>
        </div>
        <div className="filter-grid">
          <FilterGroup label="Framework" options={options.frameworks} value={filters.framework} onChange={(value) => updateFilter("framework", value)} />
          <FilterGroup label="Lenguaje" options={options.languages} value={filters.language} onChange={(value) => updateFilter("language", value)} />
          <FilterGroup label="Rol" options={options.roles} value={filters.role} onChange={(value) => updateFilter("role", value)} />
        </div>
        <p className="filter-count" aria-live="polite">{filtered.length} de {projects.length} proyectos</p>
      </section>
      {filtered.length ? (
        <div className="project-grid">
          {filtered.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      ) : (
        <div className="empty-state"><h2>Sin coincidencias</h2><p>Prueba otra combinación o limpia los filtros.</p></div>
      )}
    </>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <fieldset className="filter-group">
      <legend>{label}</legend>
      <div className="filter-options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={value === option ? "filter-chip active" : "filter-chip"}
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
