import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, BriefcaseBusiness, CheckCircle2, Download, Mail, MapPin, Sparkles } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { TagList } from "@/components/tag-list";
import { getPortfolioContent } from "@/content/data";
import { selectFeatured } from "@/content/selectors";
import { ContactForm } from "@/features/contact/contact-form";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const content = await getPortfolioContent();
  const { settings } = content;
  const featured = selectFeatured(content);
  const personJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.name,
    jobTitle: settings.role,
    email: `mailto:${settings.email}`,
    address: { "@type": "PostalAddress", addressLocality: settings.location },
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    sameAs: settings.socialLinks.map((link) => link.url),
    knowsAbout: featured.skills,
  }).replaceAll("<", "\\u003c");

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJson }} />
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <Reveal className="hero-copy">
          <p className="availability"><span /> {settings.availability}</p>
          <p className="eyebrow">{settings.eyebrow}</p>
          <h1 id="hero-title">Código claro.<br /><span>Productos que avanzan.</span></h1>
          <p className="hero-summary">{settings.summary}</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/proyectos">Ver proyectos <ArrowRight aria-hidden="true" /></Link>
            <a className="button button-secondary" href="#contacto">Hablemos <Mail aria-hidden="true" /></a>
            {settings.cvUrl ? <a className="button button-quiet" href={settings.cvUrl} target="_blank" rel="noreferrer">Descargar CV <Download aria-hidden="true" /></a> : null}
          </div>
          <div className="hero-meta">
            <span><MapPin aria-hidden="true" /> {settings.location}</span>
            <span><BriefcaseBusiness aria-hidden="true" /> Full stack · Producto · Cloud</span>
          </div>
        </Reveal>
        <Reveal className="hero-system" delay={120}>
          <div className="system-card glass-panel">
            <div className="system-top"><span className="system-dots"><i /><i /><i /></span><code>enfoque.ts</code></div>
            <ol className="system-list">
              <li><span>01</span><div><strong>Entender</strong><p>Primero el problema, el usuario y las restricciones.</p></div></li>
              <li><span>02</span><div><strong>Construir</strong><p>La solución más simple que cumple bien el objetivo.</p></div></li>
              <li><span>03</span><div><strong>Medir</strong><p>Calidad, rendimiento y aprendizaje verificable.</p></div></li>
            </ol>
            <div className="system-status"><CheckCircle2 aria-hidden="true" /> listo para colaborar</div>
          </div>
        </Reveal>
        <a className="scroll-cue" href="#perfil"><ArrowDown aria-hidden="true" /><span>Descubrir</span></a>
      </section>

      <section id="perfil" className="section shell about-preview">
        <Reveal>
          <div className="statement-card glass-panel">
            <p className="eyebrow">Perfil</p>
            <h2>Menos complejidad accidental. Más valor entregado.</h2>
            <p>{settings.bio}</p>
            <Link className="text-link" href="/sobre-mi">Conocer mi historia <ArrowRight aria-hidden="true" /></Link>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="principles-grid">
            {[
              ["01", "Claridad", "Decisiones explícitas y código que se entiende."],
              ["02", "Calidad", "Accesibilidad, pruebas y rendimiento desde el inicio."],
              ["03", "Colaboración", "Comunicación directa y aprendizaje compartido."],
            ].map(([number, title, description]) => (
              <article key={number} className="principle"><span>{number}</span><h3>{title}</h3><p>{description}</p></article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section section-tinted">
        <div className="shell">
          <Reveal><SectionHeading eyebrow="Stack" title="Herramientas con contexto" description="Tecnología al servicio de decisiones de producto y una entrega sostenible." action={<Link className="text-link" href="/habilidades">Ver habilidades <ArrowRight aria-hidden="true" /></Link>} /></Reveal>
          <Reveal delay={80}><div className="skill-cloud glass-panel"><TagList items={featured.skills} label="Habilidades principales" /></div></Reveal>
        </div>
      </section>

      <section className="section shell">
        <Reveal><SectionHeading eyebrow="Trayectoria" title="Experiencia donde negocio y tecnología se encuentran" action={<Link className="text-link" href="/experiencia">Ver trayectoria <ArrowRight aria-hidden="true" /></Link>} /></Reveal>
        <div className="timeline-preview">
          {featured.experience.map((experience, index) => (
            <Reveal key={experience.id} delay={index * 80}>
              <article className="timeline-row glass-panel">
                <div className="timeline-period">{experience.period}</div>
                <div><p className="eyebrow">{experience.projectType}</p><h3>{experience.title}</h3><p className="timeline-company">{experience.company}</p><p>{experience.summary}</p><TagList items={experience.technologies.slice(0, 5)} label={`Tecnologías de ${experience.title}`} /></div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-tinted">
        <div className="shell">
          <Reveal><SectionHeading eyebrow="Proyectos" title="Construir para aprender. Aprender para construir mejor." description="Una selección de productos que conectan interfaz, servicios y datos." action={<Link className="text-link" href="/proyectos">Ver todos <ArrowRight aria-hidden="true" /></Link>} /></Reveal>
          <div className="project-grid">
            {featured.projects.map((project, index) => <Reveal key={project.id} delay={index * 70}><ProjectCard project={project} compact /></Reveal>)}
          </div>
        </div>
      </section>

      <section className="section shell education-preview">
        <Reveal><SectionHeading eyebrow="Formación" title="Fundamentos y aprendizaje continuo" action={<Link className="text-link" href="/formacion">Ver formación <ArrowRight aria-hidden="true" /></Link>} /></Reveal>
        <div className="credential-mini-grid">
          {featured.credentials.map((credential) => (
            <article className="credential-mini glass-panel" key={credential.id}>
              <span>{credential.year}</span><div><h3>{credential.title}</h3><p>{credential.institution}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section id="contacto" className="section contact-section">
        <div className="shell contact-grid">
          <Reveal>
            <div className="contact-copy">
              <p className="eyebrow">Contacto</p>
              <h2>¿Tienes un desafío donde pueda aportar?</h2>
              <p>Cuéntame el contexto. Respondo con honestidad sobre cómo puedo ayudar y cuál sería el siguiente paso.</p>
              <div className="contact-note"><Sparkles aria-hidden="true" /><span>Especial interés en equipos de producto, plataformas web y experiencias full stack.</span></div>
            </div>
          </Reveal>
          <Reveal delay={90}><div className="contact-card glass-panel"><ContactForm email={settings.email} /></div></Reveal>
        </div>
      </section>
    </main>
  );
}
