import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { TagList } from "@/components/tag-list";
import { getPortfolioContent } from "@/content/data";
import { selectFeatured } from "@/content/selectors";
import { ContactForm } from "@/features/contact/contact-form";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const principles = [
  ["01", "Claridad", "Decisiones explícitas y código que se entiende."],
  ["02", "Calidad", "Accesibilidad, pruebas y rendimiento desde el inicio."],
  ["03", "Colaboración", "Comunicación directa y aprendizaje compartido."],
] as const;

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
    <main id="main-content" className="landing-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJson }} />

      <section className="landing-hero shell" aria-labelledby="hero-title">
        <Reveal className="landing-hero-copy">
          <p className="availability"><span /> {settings.availability}</p>
          <h1 id="hero-title">{settings.role}<span>.</span></h1>
          <p className="landing-hero-summary">{settings.summary}</p>
          <div className="landing-hero-actions">
            <Link className="button button-primary" href="/proyectos">
              Ver proyectos <ArrowRight aria-hidden="true" />
            </Link>
            <a className="button button-secondary" href="#contacto">
              Hablemos <Mail aria-hidden="true" />
            </a>
            {settings.cvUrl ? (
              <a className="button button-quiet" href={settings.cvUrl} target="_blank" rel="noreferrer">
                Descargar CV <Download aria-hidden="true" />
              </a>
            ) : null}
          </div>
          <div className="landing-tool-strip" aria-label="Tecnologías principales">
            {featured.skills.slice(0, 7).map((skill) => <span key={skill}>{skill}</span>)}
          </div>
        </Reveal>

        <Reveal className="landing-hero-visual" delay={120}>
          {settings.avatar ? (
            <div className="landing-portrait">
              <Image
                src={settings.avatar.url}
                alt={settings.avatar.alt}
                fill
                priority
                sizes="(max-width: 980px) 100vw, 42vw"
              />
            </div>
          ) : (
            <div className="landing-system-card">
              <div className="landing-system-top">
                <span className="system-dots" aria-hidden="true"><i /><i /><i /></span>
                <code>enfoque.ts</code>
              </div>
              <p className="landing-system-label">Cómo trabajo</p>
              <ol className="landing-system-list">
                <li><span>01</span><div><strong>Entender</strong><p>Problema, personas y restricciones.</p></div></li>
                <li><span>02</span><div><strong>Construir</strong><p>La solución más simple que cumple bien.</p></div></li>
                <li><span>03</span><div><strong>Mejorar</strong><p>Medir, aprender y volver a iterar.</p></div></li>
              </ol>
              <div className="landing-system-status"><CheckCircle2 aria-hidden="true" /> Listo para colaborar</div>
            </div>
          )}
        </Reveal>
      </section>

      <section className="landing-section landing-section-raised">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="Stack"
              title="Herramientas con las que construyo"
              description="Una selección enfocada de tecnologías para crear experiencias web claras, rápidas y mantenibles."
              action={<Link className="text-link" href="/habilidades">Ver habilidades <ArrowRight aria-hidden="true" /></Link>}
            />
          </Reveal>
          <div className="landing-tools-grid">
            {featured.skills.map((skill, index) => (
              <Reveal key={skill} delay={index * 35}>
                <article className="landing-tool-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{skill}</h3>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-projects">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="Proyectos"
              title="Productos que he llevado a código"
              description="Una selección de proyectos donde conecto interfaz, servicios y datos para resolver necesidades concretas."
              action={<Link className="text-link" href="/proyectos">Ver todos <ArrowRight aria-hidden="true" /></Link>}
            />
          </Reveal>
          <div className="project-grid landing-project-grid">
            {featured.projects.map((project, index) => (
              <Reveal key={project.id} delay={index * 70}>
                <ProjectCard project={project} compact />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-raised">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="Experiencia"
              title="Donde tecnología y negocio se encuentran"
              description="Experiencias que han fortalecido mi criterio técnico, mi comunicación y mi orientación a producto."
              action={<Link className="text-link" href="/experiencia">Ver trayectoria <ArrowRight aria-hidden="true" /></Link>}
            />
          </Reveal>
          <div className="landing-experience-list">
            {featured.experience.map((experience, index) => (
              <Reveal key={experience.id} delay={index * 70}>
                <article className="landing-experience-row">
                  <div className="landing-experience-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="landing-experience-role">
                    <h3>{experience.title}</h3>
                    <p>{experience.company}</p>
                  </div>
                  <div className="landing-experience-copy">
                    <span>{experience.period}</span>
                    <p>{experience.summary}</p>
                    <TagList items={experience.technologies.slice(0, 5)} label={`Tecnologías de ${experience.title}`} />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="perfil" className="landing-section landing-profile shell">
        <Reveal>
          <div className="landing-profile-copy">
            <p className="eyebrow">Perfil</p>
            <h2>Menos complejidad accidental. Más valor entregado.</h2>
            <p>{settings.bio}</p>
            <Link className="text-link" href="/sobre-mi">Conocer mi historia <ArrowRight aria-hidden="true" /></Link>
          </div>
        </Reveal>
        <div className="landing-principles">
          {principles.map(([number, title, description], index) => (
            <Reveal key={number} delay={index * 60}>
              <article>
                <span>{number}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section-raised">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="Formación"
              title="Fundamentos y aprendizaje continuo"
              description="Una base técnica formal que sigo ampliando con práctica, proyectos y especialización."
              action={<Link className="text-link" href="/formacion">Ver formación <ArrowRight aria-hidden="true" /></Link>}
            />
          </Reveal>
          <div className="landing-credentials">
            {featured.credentials.map((credential, index) => (
              <Reveal key={credential.id} delay={index * 60}>
                <article>
                  <span>{credential.year}</span>
                  <div><h3>{credential.title}</h3><p>{credential.institution}</p></div>
                  <ArrowRight aria-hidden="true" />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="landing-section landing-contact">
        <div className="shell">
          <Reveal>
            <div className="landing-contact-intro">
              <div>
                <p className="eyebrow">Contacto</p>
                <h2>Construyamos algo que valga la pena.</h2>
              </div>
              <div>
                <p>Cuéntame el contexto. Respondo con honestidad sobre cómo puedo aportar y cuál sería el siguiente paso.</p>
                <div className="landing-contact-meta">
                  <span><MapPin aria-hidden="true" /> {settings.location}</span>
                  <span><BriefcaseBusiness aria-hidden="true" /> Full stack · Producto · Cloud</span>
                </div>
              </div>
            </div>
          </Reveal>
          <div className="landing-contact-grid">
            <Reveal>
              <div className="landing-contact-note">
                <Sparkles aria-hidden="true" />
                <p>Especial interés en equipos de producto, plataformas web y experiencias full stack.</p>
              </div>
            </Reveal>
            <Reveal delay={90}>
              <div className="contact-card glass-panel"><ContactForm email={settings.email} /></div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
