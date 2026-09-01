import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import * as motion from "motion/react-client";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { CvDownloadButton } from "@/components/cv-download-button";
import { CvPreview } from "@/components/cv-preview";
import { SiteNav } from "@/components/site-nav";
import { getPortfolioData, type PortfolioData } from "@/lib/content";
import { defaultSiteSettings } from "@/lib/site-settings";
import { absoluteUrl } from "@/lib/site-url";
import type { Work } from "@/lib/types";
import { routing, type AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: value } = await params;
  const locale: AppLocale = hasLocale(routing.locales, value) ? value : "en";
  let settings = defaultSiteSettings;
  try {
    settings = (await getPortfolioData(locale)).settings;
  } catch (error) {
    console.error("Site metadata settings could not be loaded", error);
  }
  const canonical = absoluteUrl(`/${locale}`);
  const socialImage = absoluteUrl("/opengraph-image");
  return {
    title: settings.siteTitle,
    description: settings.siteDescription,
    keywords: ["Mohamed Zayani", "journalist", "content producer", "Tunisia", "research", "storytelling"],
    openGraph: {
      title: settings.siteTitle,
      description: settings.siteDescription,
      url: canonical,
      siteName: "Mohamed Zayani",
      locale: openGraphLocale(locale),
      type: "website",
      images: [{ url: socialImage, width: 1200, height: 630, alt: "Mohamed Zayani — Journalist and Content Producer" }],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteTitle,
      description: settings.siteDescription,
      images: [socialImage],
    },
    alternates: {
      canonical,
      languages: {
        en: absoluteUrl("/en"),
        ar: absoluteUrl("/ar"),
        tr: absoluteUrl("/tr"),
        "x-default": absoluteUrl("/en"),
      },
    },
  };
}

const emptyData: PortfolioData = { abouts: [], experiences: [], works: [], types: [], languages: [], contact: null, education: [], training: [], settings: defaultSiteSettings };

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!hasLocale(routing.locales, value)) notFound();
  const locale = value;
  const t = await getTranslations({ locale, namespace: "Portfolio" });
  let data: PortfolioData = emptyData;
  let unavailable = false;
  try {
    data = await getPortfolioData(locale);
  } catch (error) {
    unavailable = true;
    console.error("Portfolio data could not be loaded", error);
  }

  const displayName = data.contact ? `${data.contact.name} ${data.contact.lastname}`.trim() || t("fallbackName") : t("fallbackName");
  const initials = displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const cvFilename = `${displayName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "portfolio"}-CV.pdf`;
  const { settings } = data;
  const structuredData = portfolioStructuredData({ locale, displayName, settings, contact: data.contact });
  const navigation = [
    { href: "#about", label: settings.navAboutLabel },
    ...(settings.showExperience ? [{ href: "#experience", label: settings.navExperienceLabel }] : []),
    ...(settings.showEducation && (data.education.length || data.training.length) ? [{ href: "#education", label: settings.navEducationLabel }] : []),
    ...(settings.showWork ? [{ href: "#work", label: settings.navWorkLabel }] : []),
    ...(settings.showSkills ? [{ href: "#skills", label: settings.navSkillsLabel }] : []),
    ...(settings.showLanguages && data.languages.length ? [{ href: "#languages", label: settings.navLanguagesLabel }] : []),
    ...(settings.showContact ? [{ href: "#contact", label: settings.navContactLabel }] : []),
    ...(settings.showCv && data.contact?.cv ? [{ href: "#cv", label: settings.navCvLabel }] : []),
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <SiteNav
        name={displayName}
        title={data.contact?.title}
        linkedin={data.contact?.linkedin}
        x={data.contact?.x}
        facebook={data.contact?.facebook}
        locale={locale}
        links={navigation}
      />
      <main>
        <section id="about" className="section hero">
          <motion.div className="hero-copy" {...reveal("up")}>
            <p className="eyebrow">{settings.heroEyebrow}</p>
            <h1>{displayName}<span>.</span></h1>
            <p className="hero-role">{data.contact?.title || t("fallbackRole")}</p>
            {data.abouts.map((about) => (
              <div key={about._id} className="about-copy"><h2>{about.title}</h2><p>{about.content}</p></div>
            ))}
            {unavailable && <p className="data-notice">{t("dataUnavailable")}</p>}
            <a className="text-link" href={settings.heroCtaHref}>{settings.heroCtaLabel} <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}><ArrowDown size={18} /></motion.span></a>
          </motion.div>
          <motion.div className="portrait-wrap" {...reveal("scale", .16)}>
            <motion.div className="portrait-frame" animate={{ y: [0, -9, 0], rotate: [2, 1, 2] }} whileHover={{ scale: 1.02 }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
              {data.contact?.image
                ? <Image src={imagePath(data.contact.image)} alt={displayName} fill priority sizes="(max-width: 900px) 82vw, 420px" />
                : <span className="portrait-placeholder" aria-label={`${displayName} portrait placeholder`}>{initials}</span>}
            </motion.div>
            <span className="portrait-label">{settings.portraitLabelPrefix} {data.contact?.location || t("fallbackLocation")}</span>
          </motion.div>
        </section>

        {settings.showExperience && <section id="experience" className="section section-block">
          <SectionTitle kicker={settings.experienceKicker} title={settings.experienceTitle} />
          <div className="timeline">
            {data.experiences.map((experience, index) => (
              <motion.article className="timeline-item" key={experience._id} {...reveal(index % 2 === 0 ? "right" : "left", (index % 3) * .08)}>
                <div className="timeline-date">{experience.date}</div>
                <motion.div className="timeline-dot" initial={{ opacity: 0, scale: .3 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>{experience.image && <Image src={imagePath(experience.image)} alt="" fill sizes="48px" />}</motion.div>
                <div className="timeline-card"><h3>{experience.position}</h3><div className="timeline-context"><strong>{experience.name}</strong>{experience.category && <span>{experience.category === "Freelance" ? t("freelance") : t("professional")}</span>}{experience.location && <span><MapPin size={13} />{experience.location}</span>}</div><p>{experience.description}</p></div>
              </motion.article>
            ))}
          </div>
        </section>}

        {settings.showEducation && (data.education.length > 0 || data.training.length > 0) && <section id="education" className="section education-section">
          <SectionTitle kicker={settings.educationKicker} title={settings.educationTitle} />
          <div className="education-training-grid">
            {data.education.length > 0 && <motion.article {...reveal("left")}>
              <h3>{settings.educationDegreesHeading}</h3>
              <div className="credential-list">{data.education.map((record) => <div key={record._id}>
                <span>{record.date}</span><h4>{record.certificate}</h4><p>{record.institute}</p>{record.location && <small><MapPin size={13} />{record.location}</small>}
              </div>)}</div>
            </motion.article>}
            {data.training.length > 0 && <motion.article {...reveal("right", .08)}>
              <h3>{settings.educationTrainingHeading}</h3>
              <div className="credential-list">{data.training.map((record) => <div key={record._id}>
                <span>{record.date}</span><h4>{record.title}</h4><p>{record.provider}</p>{record.location && <small><MapPin size={13} />{record.location}</small>}
              </div>)}</div>
            </motion.article>}
          </div>
        </section>}

        {settings.showWork && <section id="work" className="section section-block">
          <SectionTitle kicker={settings.workKicker} title={settings.workTitle} />
          <div className="selected-work-grid">
            {data.works.map((work, index) => <SelectedWorkCard work={work} index={index} featuredLabel={t("featured")} placeholder={t("selectedWork")} key={work._id} />)}
          </div>
        </section>}

        {settings.showSkills && <section id="skills" className="section section-block">
          <SectionTitle kicker={settings.skillsKicker} title={settings.skillsTitle} />
          <div className="skills-grid">
            {data.types.map((type, index) => (
              <motion.article className="skill-group" key={type._id} {...reveal("scale", (index % 4) * .08)}><h3>{type.name}</h3><div className="skill-list">
                {type.skills.map((skill, skillIndex) => <motion.span key={skill._id} initial={{ opacity: 0, y: 9, scale: .96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} whileHover={{ y: -2 }} viewport={{ once: true }} transition={{ duration: .4, delay: skillIndex * .05 }}>{skill.name}{skill.level && <small>{skill.level}</small>}</motion.span>)}
              </div></motion.article>
            ))}
          </div>
        </section>}

        {settings.showLanguages && data.languages.length > 0 && <section id="languages" className="section languages-section">
          <SectionTitle kicker={settings.languagesKicker} title={settings.languagesTitle} />
          <div className="languages-grid">
            {data.languages.map((language, index) => <motion.article key={language._id} {...reveal("up", (index % 4) * .08)} whileHover={{ y: -6 }}>
              <span className="language-number">{String(index + 1).padStart(2, "0")}</span>
              <h3>{language.name}</h3>
              <p>{language.level}</p>
            </motion.article>)}
          </div>
        </section>}

        {settings.showContact && <section id="contact" className="section contact-section">
          <motion.div className="contact-intro" {...reveal("left")}><p className="eyebrow">{settings.contactKicker}</p><h2>{settings.contactTitle}<span>.</span></h2><p>{data.contact?.summary || settings.contactFallbackText}</p></motion.div>
          <motion.div {...reveal("right", .08)}><ContactForm settings={settings} /></motion.div>
        </section>}

        {settings.showCv && data.contact?.cv && <section id="cv" className="section cv-section">
          <motion.div className="cv-heading" {...reveal("up")}><SectionTitle kicker={settings.cvKicker} title={settings.cvTitle} /><CvDownloadButton file={data.contact.cv} filename={cvFilename} label={settings.cvDownloadLabel} /></motion.div>
          <motion.div {...reveal("up", .08)}><CvPreview file={data.contact.cv} /></motion.div>
        </section>}
      </main>
      <motion.footer {...reveal("up")}><span>© {new Date().getFullYear()} {settings.footerText}</span></motion.footer>
    </>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return <motion.div className="section-title" {...reveal("up")}><p className="eyebrow">{kicker}</p><h2>{title}<span>.</span></h2></motion.div>;
}

function SelectedWorkCard({ work, index, featuredLabel, placeholder }: { work: Work; index: number; featuredLabel: string; placeholder: string }) {
  const content = <>
    <div className="selected-work-image">
      {work.image
        ? <Image src={imagePath(work.image)} alt={work.title} fill sizes="(max-width: 680px) 100vw, (max-width: 900px) 50vw, 33vw" />
        : <span>{work.format || placeholder}</span>}
      {work.link && <ArrowUpRight />}
    </div>
    <div className="selected-work-copy">
      <div className="selected-work-tags">
        {work.isFeatured && <span className="featured">{featuredLabel}</span>}
        {work.format && <span>{work.format}</span>}
        {work.topic && <span>{work.topic}</span>}
      </div>
      <h3>{work.title}</h3>
      {(work.outlet || work.role || work.date) && <div className="selected-work-context">
        {work.outlet && <strong>{work.outlet}</strong>}
        {work.role && <span>{work.role}</span>}
        {work.date && <span>{work.date}</span>}
      </div>}
      {work.description && <p>{work.description}</p>}
    </div>
  </>;

  return work.link
    ? <motion.a className="selected-work-card" href={work.link} target="_blank" rel="noreferrer" {...reveal("up", (index % 4) * .08)} whileHover={{ y: -7 }}>{content}</motion.a>
    : <motion.article className="selected-work-card" {...reveal("up", (index % 4) * .08)} whileHover={{ y: -7 }}>{content}</motion.article>;
}

function reveal(direction: "up" | "left" | "right" | "scale", delay = 0) {
  const initial = direction === "left" ? { x: -48 } : direction === "right" ? { x: 48 } : direction === "scale" ? { y: 18, scale: .94 } : { y: 34 };
  return {
    initial: { opacity: 0, filter: "blur(5px)", ...initial },
    whileInView: { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" },
    viewport: { once: true, amount: .15 },
    transition: { duration: .72, delay, ease: [.22, 1, .36, 1] as const },
  };
}

function imagePath(value: string) {
  return value.startsWith("/") ? value : `/${value}`;
}

function openGraphLocale(locale: AppLocale) {
  return locale === "ar" ? "ar_TN" : locale === "tr" ? "tr_TR" : "en_US";
}

function portfolioStructuredData({ locale, displayName, settings, contact }: { locale: AppLocale; displayName: string; settings: PortfolioData["settings"]; contact: PortfolioData["contact"] }) {
  const profileUrl = absoluteUrl(`/${locale}`);
  const sameAs = [contact?.linkedin, contact?.x, contact?.facebook, contact?.website].filter((value): value is string => Boolean(value));
  const person = {
    "@type": "Person",
    "@id": `${profileUrl}#person`,
    name: displayName,
    url: profileUrl,
    jobTitle: contact?.title || undefined,
    description: contact?.summary || settings.siteDescription,
    image: contact?.image ? absoluteUrl(imagePath(contact.image)) : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": `${profileUrl}#website`,
        name: settings.siteTitle,
        url: profileUrl,
        description: settings.siteDescription,
        inLanguage: locale === "ar" ? "ar-TN" : locale === "tr" ? "tr-TR" : "en",
        publisher: { "@id": `${profileUrl}#person` },
      },
    ],
  };
}
