import mongoose, { Schema } from "mongoose";

const AboutSchema = new Schema({ title: String, content: String, order: { type: Number, default: 0 }, isVisible: { type: Boolean, default: true } });
const ContactSchema = new Schema({
  name: String, lastname: String, title: String, summary: String, email: String,
  phone: String, location: String, github: String, linkedin: String, website: String, image: String,
});
const EducationSchema = new Schema({ certificate: String, institute: String, date: String, location: String });
const ExperienceSchema = new Schema({
  name: String, position: String, date: String, description: String, image: String, showInCV: Boolean,
  order: { type: Number, default: 0 }, isVisible: { type: Boolean, default: true },
});
const TypeSchema = new Schema({ name: String, order: { type: Number, default: 0 }, isVisible: { type: Boolean, default: true } });
const SkillSchema = new Schema({
  type: { type: Schema.Types.ObjectId, ref: "Type" }, name: String, level: String,
  order: { type: Number, default: 0 }, isVisible: { type: Boolean, default: true },
});
const UserSchema = new Schema({ username: String, password: String });
const RateLimitSchema = new Schema({
  _id: String,
  count: { type: Number, required: true },
  resetAt: { type: Date, required: true },
}, { versionKey: false });
RateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });
const WorkSchema = new Schema({
  name: String, description: String, technologies: String, image: String, link: String, showInCV: Boolean,
  order: { type: Number, default: 0 }, isVisible: { type: Boolean, default: true },
});
const SiteSettingsSchema = new Schema({
  siteTitle: String, siteDescription: String, heroEyebrow: String, heroCtaLabel: String, heroCtaHref: String, portraitLabelPrefix: String,
  navAboutLabel: String, navExperienceLabel: String, navWorkLabel: String, navSkillsLabel: String, navContactLabel: String, navCvLabel: String,
  experienceKicker: String, experienceTitle: String, workKicker: String, workTitle: String, skillsKicker: String, skillsTitle: String,
  contactKicker: String, contactTitle: String, contactFallbackText: String,
  formNameLabel: String, formEmailLabel: String, formSubjectLabel: String, formMessageLabel: String, formSubmitLabel: String, formSendingLabel: String,
  formSuccessTitle: String, formSuccessMessage: String, formErrorTitle: String, formErrorMessage: String,
  cvKicker: String, cvTitle: String, cvContactHeading: String, cvEducationHeading: String, cvLinksHeading: String,
  cvExperienceHeading: String, cvProjectsHeading: String, cvSkillsHeading: String, cvDownloadLabel: String,
  footerText: String, showExperience: Boolean, showWork: Boolean, showSkills: Boolean, showContact: Boolean, showCv: Boolean,
});

export const AboutModel = mongoose.models.About || mongoose.model("About", AboutSchema, "about");
export const ContactModel = mongoose.models.Contact || mongoose.model("Contact", ContactSchema, "contact");
export const EducationModel = mongoose.models.Education || mongoose.model("Education", EducationSchema, "education");
export const ExperienceModel = mongoose.models.Experience || mongoose.model("Experience", ExperienceSchema, "experience");
export const TypeModel = mongoose.models.Type || mongoose.model("Type", TypeSchema);
export const SkillModel = mongoose.models.Skill || mongoose.model("Skill", SkillSchema);
export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export const RateLimitModel = mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema, "rateLimits");
export const WorkModel = mongoose.models.Work || mongoose.model("Work", WorkSchema, "work");
export const SiteSettingsModel = mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema, "siteSettings");
