import { ArrowDown, ArrowUpRight, Github, Globe2, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import * as motion from "motion/react-client";
import Image from "next/image";
import { ContactForm } from "@/components/contact-form";
import { PrintCvButton } from "@/components/print-cv-button";
import { SiteNav } from "@/components/site-nav";
import { getPortfolioData, type PortfolioData } from "@/lib/content";
import { defaultSiteSettings } from "@/lib/site-settings";
import { getSiteSettings } from "@/lib/site-settings-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let settings = defaultSiteSettings;
  try {
    settings = await getSiteSettings();
  } catch (error) {
    console.error("Site metadata settings could not be loaded", error);
  }
  return {
    title: settings.siteTitle,
    description: settings.siteDescription,
    openGraph: { title: settings.siteTitle, description: settings.siteDescription, type: "website" },
  };
}

const emptyData: PortfolioData = { abouts: [], experiences: [], works: [], types: [], contact: null, education: null, settings: defaultSiteSettings };

export default async function Home() {
  let data: PortfolioData = emptyData;
  let unavailable = false;
  try {
    data = await getPortfolioData();
  } catch (error) {
    unavailable = true;
    console.error("Portfolio data could not be loaded", error);
  }

  const displayName = data.contact ? `${data.contact.name} ${data.contact.lastname}`.trim() : "Ahmed Atri";
  const { settings } = data;
  const navigation = [
    { href: "#about", label: settings.navAboutLabel },
    ...(settings.showExperience ? [{ href: "#experience", label: settings.navExperienceLabel }] : []),
    ...(settings.showWork ? [{ href: "#work", label: settings.navWorkLabel }] : []),
    ...(settings.showSkills ? [{ href: "#skills", label: settings.navSkillsLabel }] : []),
    ...(settings.showContact ? [{ href: "#contact", label: settings.navContactLabel }] : []),
    ...(settings.showCv ? [{ href: "#cv", label: settings.navCvLabel }] : []),
  ];
  return (
    <>
      <SiteNav
        name={displayName}
        title={data.contact?.title}
        github={data.contact?.github}
        linkedin={data.contact?.linkedin}
        links={navigation}
      />
      <main>
        <section id="about" className="section hero">
          <motion.div className="hero-copy" {...reveal("up")}>
            <p className="eyebrow">{settings.heroEyebrow}</p>
            <h1>{displayName}<span>.</span></h1>
            <p className="hero-role">{data.contact?.title || "Full-stack Developer"}</p>
            {data.abouts.map((about) => (
              <div key={about._id} className="about-copy"><h2>{about.title}</h2><p>{about.content}</p></div>
            ))}
            {unavailable && <p className="data-notice">Connect MongoDB to load portfolio content.</p>}
            <a className="text-link" href={settings.heroCtaHref}>{settings.heroCtaLabel} <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}><ArrowDown size={18} /></motion.span></a>
          </motion.div>
          <motion.div className="portrait-wrap" {...reveal("scale", .16)}>
            <motion.div className="portrait-frame" animate={{ y: [0, -9, 0], rotate: [2, 1, 2] }} whileHover={{ scale: 1.02 }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}><Image src={data.contact?.image ? imagePath(data.contact.image) : "/img/me.jpg"} alt={displayName} fill priority sizes="(max-width: 900px) 82vw, 420px" /></motion.div>
            <span className="portrait-label">{settings.portraitLabelPrefix} {data.contact?.location || "Istanbul"}</span>
          </motion.div>
        </section>

        {settings.showExperience && <section id="experience" className="section section-block">
          <SectionTitle kicker={settings.experienceKicker} title={settings.experienceTitle} />
          <div className="timeline">
            {data.experiences.map((experience, index) => (
              <motion.article className="timeline-item" key={experience._id} {...reveal(index % 2 === 0 ? "right" : "left", (index % 3) * .08)}>
                <div className="timeline-date">{experience.date}</div>
                <motion.div className="timeline-dot" initial={{ opacity: 0, scale: .3 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>{experience.image && <Image src={imagePath(experience.image)} alt="" fill sizes="48px" />}</motion.div>
                <div className="timeline-card"><h3>{experience.position}</h3><strong>{experience.name}</strong><p>{experience.description}</p></div>
              </motion.article>
            ))}
          </div>
        </section>}

        {settings.showWork && <section id="work" className="section section-block">
          <SectionTitle kicker={settings.workKicker} title={settings.workTitle} />
          <div className="project-grid">
            {data.works.map((work, index) => (
              <motion.a className="project-card" href={work.link || "#work"} target={work.link ? "_blank" : undefined} rel="noreferrer" key={work._id} {...reveal("up", (index % 4) * .08)} whileHover={{ y: -7 }}>
                <div className="project-image">{work.image && <Image src={imagePath(work.image)} alt={work.name} fill sizes="(max-width: 680px) 100vw, (max-width: 900px) 50vw, 33vw" />}<ArrowUpRight /></div>
                <div className="project-copy"><h3>{work.name}</h3><p>{work.description}</p><span>{work.technologies}</span></div>
              </motion.a>
            ))}
          </div>
        </section>}

        {settings.showSkills && <section id="skills" className="section section-block">
          <SectionTitle kicker={settings.skillsKicker} title={settings.skillsTitle} />
          <div className="skills-grid">
            {data.types.map((type, index) => (
              <motion.article className="skill-group" key={type._id} {...reveal("scale", (index % 4) * .08)}><h3>{type.name}</h3><div className="skill-list">
                {type.skills.map((skill, skillIndex) => <motion.span key={skill._id} initial={{ opacity: 0, y: 9, scale: .96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} whileHover={{ y: -2 }} viewport={{ once: true }} transition={{ duration: .4, delay: skillIndex * .05 }}>{skill.name}<small>{skill.level}</small></motion.span>)}
              </div></motion.article>
            ))}
          </div>
        </section>}

        {settings.showContact && <section id="contact" className="section contact-section">
          <motion.div className="contact-intro" {...reveal("left")}><p className="eyebrow">{settings.contactKicker}</p><h2>{settings.contactTitle}<span>.</span></h2><p>{data.contact?.summary || settings.contactFallbackText}</p></motion.div>
          <motion.div {...reveal("right", .08)}><ContactForm settings={settings} /></motion.div>
        </section>}

        {settings.showCv && <section id="cv" className="section cv-section">
          <motion.div className="cv-heading" {...reveal("up")}><SectionTitle kicker={settings.cvKicker} title={settings.cvTitle} /><PrintCvButton data={data} label={settings.cvDownloadLabel} /></motion.div>
          <div className="cv-grid">
            <motion.article {...reveal("up")}><h3>{settings.cvContactHeading}</h3>{data.contact?.email && <a href={`mailto:${data.contact.email}`}><Mail size={16} />{data.contact.email}</a>}{data.contact?.phone && <span><Phone size={16} />{data.contact.phone}</span>}{data.contact?.location && <span><MapPin size={16} />{data.contact.location}</span>}</motion.article>
            <motion.article {...reveal("up", .08)}><h3>{settings.cvEducationHeading}</h3>{data.education && <><strong>{data.education.certificate}</strong><p>{data.education.institute}</p><small>{data.education.date} · {data.education.location}</small></>}</motion.article>
            <motion.article {...reveal("up", .16)}><h3>{settings.cvLinksHeading}</h3><a href={externalUrl(data.contact?.github, "https://github.com/AtriAhmed")} target="_blank" rel="noreferrer"><Github size={16} />GitHub</a><a href={externalUrl(data.contact?.linkedin, "https://www.linkedin.com/in/ahmed-atri-5564601b2")} target="_blank" rel="noreferrer"><Linkedin size={16} />LinkedIn</a><a href={externalUrl(data.contact?.website, "https://ahmedatri.com")} target="_blank" rel="noreferrer"><Globe2 size={16} />Website</a></motion.article>
          </div>
          <div className="cv-details">
            <motion.article {...reveal("left")}><h3>{settings.cvExperienceHeading}</h3>{data.experiences.filter((item) => item.showInCV).map((item) => <div key={item._id}><strong>{item.position} · {item.name}</strong><small>{item.date}</small><p>{item.description}</p></div>)}</motion.article>
            <motion.article {...reveal("right")}><h3>{settings.cvProjectsHeading}</h3>{data.works.filter((item) => item.showInCV).map((item) => <div key={item._id}><strong>{item.name}</strong><small>{item.technologies}</small><p>{item.description}</p></div>)}</motion.article>
            <motion.article {...reveal("up")}><h3>{settings.cvSkillsHeading}</h3>{data.types.map((type) => <div key={type._id}><strong>{type.name}</strong><p>{type.skills.map((skill) => skill.name).join(" · ")}</p></div>)}</motion.article>
          </div>
        </section>}
      </main>
      <motion.footer {...reveal("up")}><span>© {new Date().getFullYear()} {settings.footerText}</span><a href="/login">Admin</a></motion.footer>
    </>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return <motion.div className="section-title" {...reveal("up")}><p className="eyebrow">{kicker}</p><h2>{title}<span>.</span></h2></motion.div>;
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

function externalUrl(value: string | undefined, fallback: string) {
  const url = value?.trim() || fallback;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
