import type { ResourceName } from "@/lib/content-repository";

export const translatableFields: Record<ResourceName, readonly string[]> = {
  about: ["title", "content"],
  contact: ["name", "lastname", "title", "summary", "location"],
  education: ["certificate", "institute", "date", "location"],
  experiences: ["name", "position", "date", "location", "description"],
  languages: ["name", "level"],
  skills: ["name", "level"],
  settings: [
    "siteTitle", "siteDescription", "heroEyebrow", "heroCtaLabel", "portraitLabelPrefix",
    "navAboutLabel", "navExperienceLabel", "navEducationLabel", "navWorkLabel", "navSkillsLabel", "navLanguagesLabel", "navContactLabel", "navCvLabel",
    "experienceKicker", "experienceTitle", "educationKicker", "educationTitle", "educationDegreesHeading", "educationTrainingHeading",
    "workKicker", "workTitle", "skillsKicker", "skillsTitle", "languagesKicker", "languagesTitle",
    "contactKicker", "contactTitle", "contactFallbackText", "formNameLabel", "formEmailLabel", "formSubjectLabel", "formMessageLabel",
    "formSubmitLabel", "formSendingLabel", "formSuccessTitle", "formSuccessMessage", "formErrorTitle", "formErrorMessage",
    "cvKicker", "cvTitle", "cvDownloadLabel", "footerText",
  ],
  training: ["title", "provider", "date", "location"],
  types: ["name"],
  work: ["title", "format", "outlet", "role", "date", "topic", "description"],
};

export function cleanTranslationData(resource: ResourceName, input: Record<string, unknown>) {
  const allowed = new Set(translatableFields[resource]);
  return Object.fromEntries(Object.entries(input).filter(([field, value]) => allowed.has(field) && typeof value === "string" && value.trim() !== ""));
}
