import { getPayload } from "payload";
import config from "../../../payload.config";
import type {
  Credential,
  Experience,
  Project,
  SiteSetting,
  SkillCategory,
} from "../../payload-types";

export type PayloadPortfolioSnapshot = {
  settings: SiteSetting;
  skills: SkillCategory[];
  experience: Experience[];
  projects: Project[];
  credentials: Credential[];
};

export async function readPublishedPortfolioSnapshot(): Promise<PayloadPortfolioSnapshot> {
  const payload = await getPayload({ config });
  const [settings, skills, experience, projects, credentials] = await Promise.all([
    payload.findGlobal({ slug: "site-settings", draft: false, depth: 1, overrideAccess: false }),
    payload.find({ collection: "skill-categories", draft: false, depth: 0, limit: 100, sort: "order", overrideAccess: false }),
    payload.find({ collection: "experiences", draft: false, depth: 0, limit: 100, sort: "order", overrideAccess: false }),
    payload.find({ collection: "projects", draft: false, depth: 1, limit: 100, sort: "order", overrideAccess: false }),
    payload.find({ collection: "credentials", draft: false, depth: 0, limit: 100, sort: "order", overrideAccess: false }),
  ]);

  return {
    settings,
    skills: skills.docs,
    experience: experience.docs,
    projects: projects.docs,
    credentials: credentials.docs,
  };
}
