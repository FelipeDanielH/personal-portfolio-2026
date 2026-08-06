import type { Metadata } from "next";
import { Heart, Lightbulb, Sparkles, Target } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { getPortfolioContent } from "@/content/data";

export const metadata: Metadata = {
  title: "Sobre mí",
  description: "Historia, objetivos y filosofía de trabajo de Felipe Henríquez.",
  alternates: { canonical: "/sobre-mi" },
};

const icons = [Sparkles, Target, Heart, Lightbulb];

export default async function AboutPage() {
  const { settings } = await getPortfolioContent();

  return (
    <main id="main-content" className="page-main">
      <PageHeader
        eyebrow="Sobre mí"
        title="Curiosidad técnica, criterio práctico."
        description="Me interesa entender el sistema completo, simplificar lo complejo y trabajar con personas que cuidan tanto el producto como su base técnica."
        aside={<div className="page-stat glass-panel"><strong>Full stack</strong><span>de la interfaz al despliegue</span></div>}
      />
      <div className="shell about-layout">
        <aside className="section-index glass-panel" aria-label="Secciones de esta página">
          <p className="eyebrow">En esta página</p>
          {settings.aboutSections.map((section, index) => <a key={section.id} href={`#${section.id}`}><span>0{index + 1}</span>{section.title}</a>)}
        </aside>
        <div className="about-sections">
          {settings.aboutSections.map((section, index) => {
            const Icon = icons[index] ?? Sparkles;
            return (
              <Reveal key={section.id} delay={index * 70}>
                <article id={section.id} className="about-card glass-panel">
                  <div className="about-card-icon"><Icon aria-hidden="true" /></div>
                  <div><p className="eyebrow">0{index + 1}</p><h2>{section.title}</h2>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </main>
  );
}
