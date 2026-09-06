import type { Metadata } from "next";
import { Award, Building2, ChevronDown, MapPin, Target } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { TagList } from "@/components/tag-list";
import { getPortfolioContent } from "@/content/data";

export const metadata: Metadata = {
  title: "Experiencia",
  description: "Experiencia profesional en desarrollo web, e-commerce y soporte técnico.",
  alternates: { canonical: "/experiencia" },
};

export default async function ExperiencePage() {
  const { experience } = await getPortfolioContent();

  return (
    <main id="main-content" className="page-main">
      <PageHeader
        eyebrow="Experiencia"
        title="Tecnología dentro de un contexto real."
        description="He trabajado donde el código se cruza con clientes, operación y negocio. Esa perspectiva guía cómo diagnostico, comunico y construyo."
        aside={<div className="page-stat glass-panel"><Building2 aria-hidden="true" /><strong>{experience.length} experiencias</strong><span>producto, soporte y comercio</span></div>}
      />
      <div className="shell experience-list">
        {experience.map((item, index) => (
          <Reveal key={item.id} delay={index * 80}>
            <article className="experience-card glass-panel">
              <div className="experience-rail"><span>0{index + 1}</span><i /></div>
              <div className="experience-content">
                <div className="experience-top">
                  <div><p className="eyebrow">{item.projectType}</p><h2>{item.title}</h2><p className="experience-company">{item.company}</p></div>
                  <div className="experience-facts"><strong>{item.period}</strong><span><MapPin aria-hidden="true" />{item.location}</span></div>
                </div>
                <p className="experience-summary">{item.summary}</p>
                <TagList items={item.technologies} label={`Tecnologías de ${item.title}`} />
                <details className="experience-details">
                  <summary>Ver responsabilidades y logros <ChevronDown aria-hidden="true" /></summary>
                  <div className="details-grid">
                    <div><h3><Target aria-hidden="true" />Responsabilidades</h3><ul>{item.responsibilities.map((entry) => <li key={entry}>{entry}</li>)}</ul></div>
                    <div><h3><Award aria-hidden="true" />Resultados</h3><ul>{item.achievements.map((entry) => <li key={entry}>{entry}</li>)}</ul></div>
                  </div>
                </details>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
