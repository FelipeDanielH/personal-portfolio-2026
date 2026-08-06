export type ExternalLink = {
  label: string;
  url: string;
};

export type SiteSettings = {
  name: string;
  role: string;
  eyebrow: string;
  summary: string;
  bio: string;
  location: string;
  availability: string;
  email: string;
  phone?: string;
  cvUrl?: string;
  socialLinks: ExternalLink[];
  aboutSections: Array<{
    id: string;
    title: string;
    body: string[];
  }>;
  seo: {
    title: string;
    description: string;
  };
  avatar?: {
    url: string;
    alt: string;
  };
};

export type SkillCategory = {
  id: string;
  title: string;
  description: string;
  order: number;
  skills: Array<{
    name: string;
    highlights: string[];
  }>;
};

export type Experience = {
  id: string;
  title: string;
  company?: string;
  period: string;
  location: string;
  summary: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  projectType: string;
  order: number;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  technologies: string[];
  frameworks: string[];
  languages: string[];
  roles: string[];
  links: ExternalLink[];
  status: "Completado" | "En desarrollo";
  year: string;
  featured: boolean;
  order: number;
  image?: {
    url: string;
    alt: string;
  };
};

export type Credential = {
  id: string;
  type: "education" | "certification";
  title: string;
  institution: string;
  year: string;
  date: string;
  description: string;
  details: string[];
  duration?: string;
  location?: string;
  certificateUrl?: string;
  skills: string[];
  status: "Completado" | "En progreso";
  order: number;
};

export type PortfolioContent = {
  settings: SiteSettings;
  skills: SkillCategory[];
  experience: Experience[];
  projects: Project[];
  credentials: Credential[];
};
