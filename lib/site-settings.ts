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
  navWorkLabel: string;
  navSkillsLabel: string;
  navContactLabel: string;
  navCvLabel: string;
  experienceKicker: string;
  experienceTitle: string;
  workKicker: string;
  workTitle: string;
  skillsKicker: string;
  skillsTitle: string;
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
  showWork: boolean;
  showSkills: boolean;
  showContact: boolean;
  showCv: boolean;
};

export const defaultSiteSettings: SiteSettings = {
  siteTitle: "Ahmed Atri | Full-stack Developer",
  siteDescription: "Portfolio, experience, projects, and skills of Ahmed Atri.",
  heroEyebrow: "Hello, I'm",
  heroCtaLabel: "Explore my work",
  heroCtaHref: "#work",
  portraitLabelPrefix: "Based in",
  navAboutLabel: "About",
  navExperienceLabel: "Experience",
  navWorkLabel: "Work",
  navSkillsLabel: "Skills",
  navContactLabel: "Contact",
  navCvLabel: "CV",
  experienceKicker: "My journey",
  experienceTitle: "Work experience",
  workKicker: "Selected work",
  workTitle: "Projects",
  skillsKicker: "My expertise",
  skillsTitle: "Skills & tools",
  contactKicker: "Let's work together",
  contactTitle: "I'd love to hear from you",
  contactFallbackText: "Have a project or opportunity in mind? Send me a message.",
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
  cvProjectsHeading: "Selected projects",
  cvSkillsHeading: "Skills",
  cvDownloadLabel: "Download CV",
  footerText: "Ahmed Atri",
  showExperience: true,
  showWork: true,
  showSkills: true,
  showContact: true,
  showCv: true,
};
