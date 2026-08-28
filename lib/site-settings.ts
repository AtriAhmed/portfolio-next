export type SiteSettings = {
  _id?: string;
  siteTitle: string;
  siteDescription: string;
  heroEyebrow: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  portraitLabelPrefix: string;
  navAboutLabel: string;
  navExperienceLabel: string;
  navEducationLabel: string;
  navWorkLabel: string;
  navSkillsLabel: string;
  navLanguagesLabel: string;
  navContactLabel: string;
  navCvLabel: string;
  experienceKicker: string;
  experienceTitle: string;
  educationKicker: string;
  educationTitle: string;
  educationDegreesHeading: string;
  educationTrainingHeading: string;
  workKicker: string;
  workTitle: string;
  skillsKicker: string;
  skillsTitle: string;
  languagesKicker: string;
  languagesTitle: string;
  contactKicker: string;
  contactTitle: string;
  contactFallbackText: string;
  formNameLabel: string;
  formEmailLabel: string;
  formSubjectLabel: string;
  formMessageLabel: string;
  formSubmitLabel: string;
  formSendingLabel: string;
  formSuccessTitle: string;
  formSuccessMessage: string;
  formErrorTitle: string;
  formErrorMessage: string;
  cvKicker: string;
  cvTitle: string;
  cvContactHeading: string;
  cvEducationHeading: string;
  cvLinksHeading: string;
  cvExperienceHeading: string;
  cvProjectsHeading: string;
  cvSkillsHeading: string;
  cvDownloadLabel: string;
  footerText: string;
  showExperience: boolean;
  showEducation: boolean;
  showWork: boolean;
  showSkills: boolean;
  showLanguages: boolean;
  showContact: boolean;
  showCv: boolean;
};

export const defaultSiteSettings: SiteSettings = {
  siteTitle: "Mohamed Zayani | Journalist & Content Producer",
  siteDescription: "Journalism, content production, research, and selected work by Mohamed Zayani.",
  heroEyebrow: "Hello, I'm",
  heroCtaLabel: "Explore my work",
  heroCtaHref: "#work",
  portraitLabelPrefix: "Based in",
  navAboutLabel: "About",
  navExperienceLabel: "Experience",
  navEducationLabel: "Education",
  navWorkLabel: "Selected Work",
  navSkillsLabel: "Expertise",
  navLanguagesLabel: "Languages",
  navContactLabel: "Contact",
  navCvLabel: "CV",
  experienceKicker: "My journey",
  experienceTitle: "Work experience",
  educationKicker: "Background",
  educationTitle: "Education & training",
  educationDegreesHeading: "Academic education",
  educationTrainingHeading: "Professional training",
  workKicker: "Selected work",
  workTitle: "Selected work",
  skillsKicker: "My expertise",
  skillsTitle: "Journalistic expertise",
  languagesKicker: "Global communication",
  languagesTitle: "Four languages",
  contactKicker: "Let's work together",
  contactTitle: "I'd love to hear from you",
  contactFallbackText: "Have a story, production, or opportunity in mind? Send me a message.",
  formNameLabel: "Name",
  formEmailLabel: "Email",
  formSubjectLabel: "Subject",
  formMessageLabel: "Message",
  formSubmitLabel: "Send message",
  formSendingLabel: "Sending…",
  formSuccessTitle: "Message sent!",
  formSuccessMessage: "Thanks for reaching out. I’ll get back to you soon.",
  formErrorTitle: "Could not send your message",
  formErrorMessage: "Please try again in a moment.",
  cvKicker: "Curriculum vitae",
  cvTitle: "Career outline",
  cvContactHeading: "Contact",
  cvEducationHeading: "Education",
  cvLinksHeading: "Links",
  cvExperienceHeading: "Professional experience",
  cvProjectsHeading: "Selected work",
  cvSkillsHeading: "Skills",
  cvDownloadLabel: "Download CV",
  footerText: "Mohamed Zayani",
  showExperience: true,
  showEducation: true,
  showWork: true,
  showSkills: true,
  showLanguages: true,
  showContact: true,
  showCv: true,
};
