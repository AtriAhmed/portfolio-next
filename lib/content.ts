import { connectDb } from "@/lib/db";
import {
  AboutModel, ContactModel, EducationModel, ExperienceModel, SkillModel, TypeModel, WorkModel,
} from "@/lib/models";
import { getSiteSettings } from "@/lib/site-settings-data";
import type { SiteSettings } from "@/lib/site-settings";
import type { About, Contact, Education, Experience, SkillType, Work } from "@/lib/types";

export type PortfolioData = {
  abouts: About[];
  experiences: Experience[];
  works: Work[];
  types: SkillType[];
  contact: Contact | null;
  education: Education | null;
  settings: SiteSettings;
};

export async function getPortfolioData(): Promise<PortfolioData> {
  await connectDb();
  const [abouts, experiences, works, types, contact, education, settings] = await Promise.all([
    AboutModel.find().sort({ order: 1, _id: 1 }).lean(),
    ExperienceModel.find().sort({ order: 1, _id: 1 }).lean(),
    WorkModel.find().sort({ order: 1, _id: 1 }).lean(),
    TypeModel.find().sort({ order: 1, _id: 1 }).lean(),
    ContactModel.findOne().lean(),
    EducationModel.findOne().lean(),
    getSiteSettings(),
  ]);
  const skills = await SkillModel.find().sort({ order: 1, _id: 1 }).lean();
  return JSON.parse(JSON.stringify({
    abouts: abouts.filter((about) => about.isVisible !== false),
    experiences: experiences.filter((experience) => experience.isVisible !== false),
    works: works.filter((work) => work.isVisible !== false),
    types: types.filter((type) => type.isVisible !== false).map((type) => ({
      ...type,
      skills: skills.filter((skill) => skill.isVisible !== false && String(skill.type) === String(type._id)),
    })),
    contact,
    education,
    settings,
  })) as PortfolioData;
}
