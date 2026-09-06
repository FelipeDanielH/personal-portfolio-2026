import type { Metadata } from "next";
import { ArrowUpRight, Award, BookOpen, GraduationCap, MapPin } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { TagList } from "@/components/tag-list";
import { getPortfolioContent } from "@/content/data";

export const metadata: Metadata = {
  title: "Formación",
  description: "Formación académica y certificaciones profesionales.",
  alternates: { canonical: "/formacion" },
};

export default async function EducationPage() {
  const { credentials } = await getPortfolioContent();
  const education = credentials.filter((item) => item.type === "education");
  const certifications = credentials.filter((item) => item.type === "certification");

  return (
    <main id="main-content" className="page-main">
      <PageHeader
        eyebrow="Formación"
        title="Fundamentos sólidos. Aprendizaje constante."
        description="La formación formal me dio estructura; los proyectos, cursos y equipos convierten esa base en criterio aplicable."
        aside={<div className="page-stat glass-panel"><BookOpen aria-hidden="true" /><strong>{credentials.length} hitos</strong><span>academia y especialización</span></div>}
      />
      <div className="shell education-sections">
        <CredentialSection title="Formación académica" eyebrow="Base" items={education} icon="education" />
        <CredentialSection title="Certificaciones" eyebrow="Profundización" items={certifications} icon="certification" />
      </div>
    </main>
  );
}

type CredentialItems = Awaited<ReturnType<typeof getPortfolioContent>>["credentials"];

function CredentialSection({ title, eyebrow, items, icon }: { title: string; eyebrow: string; items: CredentialItems; icon: "education" | "certification" }) {
  const Icon = icon === "education" ? GraduationCap : Award;
  return (
    <section className="credential-section">
      <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div></div>
      <div className="credential-list">
        {items.map((item, index) => (
          <Reveal key={item.id} delay={index * 70}>
            <article className="credential-card glass-panel">
              <div className="credential-icon"><Icon aria-hidden="true" /></div>
              <div className="credential-main">
                <div className="credential-top"><div><p className="eyebrow">{item.year} · {item.status}</p><h3>{item.title}</h3><p className="credential-institution">{item.institution}</p></div>{item.certificateUrl ? <a className="text-link" href={item.certificateUrl} target="_blank" rel="noreferrer">Certificado <ArrowUpRight aria-hidden="true" /></a> : null}</div>
                <p>{item.description}</p>
                {item.location ? <p className="credential-location"><MapPin aria-hidden="true" />{item.location}{item.duration ? ` · ${item.duration}` : ""}</p> : null}
                {item.details.length ? <ul className="credential-details">{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ul> : null}
                <TagList items={item.skills} label={`Habilidades de ${item.title}`} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
