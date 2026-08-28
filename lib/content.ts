import { firstRecord, listRecords } from "@/lib/content-repository";
import { localizeRecord, localizeRecords } from "@/lib/content-i18n";
import type { AppLocale } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/site-settings-data";
import type { SiteSettings } from "@/lib/site-settings";
import type { About, Contact, Education, Experience, Language, SkillType, Training, Work } from "@/lib/types";

export type PortfolioData = {
  abouts: About[];
  experiences: Experience[];
  works: Work[];
  types: SkillType[];
  languages: Language[];
  contact: Contact | null;
  education: Education[];
  training: Training[];
  settings: SiteSettings;
};

export async function getPortfolioData(locale: AppLocale = "en"): Promise<PortfolioData> {
  const [abouts, experiences, works, types, languages, contact, education, training, settings] = await Promise.all([
    listRecords("about"),
    listRecords("experiences"),
    listRecords("work"),
    listRecords("types"),
    listRecords("languages"),
    firstRecord("contact"),
    listRecords("education"),
    listRecords("training"),
    getSiteSettings(locale),
  ]);
  const skills = await listRecords("skills");
  const [localizedAbouts, localizedExperiences, localizedWorks, localizedTypes, localizedLanguages, localizedContact, localizedEducation, localizedTraining, localizedSkills] = await Promise.all([
    localizeRecords("about", abouts, locale),
    localizeRecords("experiences", experiences, locale),
    localizeRecords("work", works, locale),
    localizeRecords("types", types, locale),
    localizeRecords("languages", languages, locale),
    localizeRecord("contact", contact, locale),
    localizeRecords("education", education, locale),
    localizeRecords("training", training, locale),
    localizeRecords("skills", skills, locale),
  ]);
  return {
    abouts: localizedAbouts.filter((about) => about.isVisible !== false) as unknown as About[],
    experiences: localizedExperiences.filter((experience) => experience.isVisible !== false) as unknown as Experience[],
    works: localizedWorks.filter((work) => work.isVisible !== false) as unknown as Work[],
    types: localizedTypes.filter((type) => type.isVisible !== false).map((type) => ({
      ...type,
      skills: localizedSkills.filter((skill) => skill.isVisible !== false && skill.type === type._id),
    })) as unknown as SkillType[],
    languages: localizedLanguages.filter((language) => language.isVisible !== false) as unknown as Language[],
    contact: localizedContact as unknown as Contact | null,
    education: localizedEducation.filter((record) => record.isVisible !== false) as unknown as Education[],
    training: localizedTraining.filter((record) => record.isVisible !== false) as unknown as Training[],
    settings,
  };
}
