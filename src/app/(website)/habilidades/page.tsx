import type { Metadata } from "next";
import { Blocks, Check, Layers3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { getPortfolioContent } from "@/content/data";

export const metadata: Metadata = {
  title: "Habilidades",
  description: "Habilidades técnicas y prácticas de desarrollo full stack de Felipe Henríquez.",
  alternates: { canonical: "/habilidades" },
};

export default async function SkillsPage() {
  const { skills } = await getPortfolioContent();

  return (
    <main id="main-content" className="page-main">
      <PageHeader
        eyebrow="Habilidades"
        title="Capacidad aplicada, no porcentajes."
        description="Agrupo mis herramientas por el tipo de problema que ayudan a resolver. La profundidad se demuestra en decisiones, entregables y aprendizaje continuo."
        aside={<div className="page-stat glass-panel"><Layers3 aria-hidden="true" /><strong>{skills.length} áreas</strong><span>una visión conectada</span></div>}
      />
      <div className="shell skills-grid">
        {skills.map((category, index) => (
          <Reveal key={category.id} delay={index * 60}>
            <section className="skill-category glass-panel" aria-labelledby={`skill-${category.id}`}>
              <div className="skill-category-heading"><span>0{index + 1}</span><Blocks aria-hidden="true" /></div>
              <h2 id={`skill-${category.id}`}>{category.title}</h2>
              <p>{category.description}</p>
              <div className="skill-items">
                {category.skills.map((skill) => (
                  <article key={skill.name} className="skill-item">
                    <h3>{skill.name}</h3>
                    <ul>{skill.highlights.map((highlight) => <li key={highlight}><Check aria-hidden="true" />{highlight}</li>)}</ul>
                  </article>
                ))}
              </div>
            </section>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
