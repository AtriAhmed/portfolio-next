"use client";

import { useState } from "react";
import { Facebook, Globe2, Linkedin, Menu, Share2, X } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

type SiteNavProps = {
  name?: string;
  title?: string;
  linkedin?: string;
  x?: string;
  facebook?: string;
  locale: AppLocale;
  links: { href: string; label: string }[];
};

export function SiteNav({ name, title, linkedin, x, facebook, locale, links }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const [utilityOpen, setUtilityOpen] = useState<"languages" | "social" | null>(null);
  const t = useTranslations("LocaleSwitcher");
  const socialLinks = [
    linkedin ? { label: "LinkedIn", href: externalUrl(linkedin), icon: Linkedin } : null,
    x ? { label: "X", href: externalUrl(x), icon: X } : null,
    facebook ? { label: "Facebook", href: externalUrl(facebook), icon: Facebook } : null,
  ].filter((link): link is NonNullable<typeof link> => link !== null);

  return (
    <motion.header className="site-header" initial={{ opacity: 0, y: -72 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease: [.22, 1, .36, 1] }}>
      <nav className="nav-shell" aria-label="Primary navigation">
        <a className="brand" href="#about"><span>{name || "Mohamed Zayani"}</span><small>{title || "Journalist & Content Producer"}</small></a>
        <button className="menu-button" aria-label="Toggle navigation" onClick={() => { setOpen(!open); setUtilityOpen(null); }}>
          {open ? <X /> : <Menu />}
        </button>
        <div className={`nav-links ${open ? "open" : ""}`}>
          {links.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}
        </div>
        <div className="social-links">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} key={label}><Icon size={20} /></a>
          ))}
        </div>
        <div className="locale-switcher" aria-label={t("label")}>
          {routing.locales.map((targetLocale) => targetLocale === locale
            ? <span className="active" key={targetLocale} aria-current="page" title={t(localeName(targetLocale))} aria-label={t(localeName(targetLocale))}><strong aria-hidden="true">{localeFlag(targetLocale)}</strong></span>
            : <Link href="/" locale={targetLocale} title={t(localeName(targetLocale))} aria-label={t(localeName(targetLocale))} key={targetLocale}><strong aria-hidden="true">{localeFlag(targetLocale)}</strong></Link>)}
        </div>
        <div className="mobile-utility-menu">
          <button className="mobile-utility-button" type="button" aria-label="Social links" aria-expanded={utilityOpen === "social"} onClick={() => setUtilityOpen((current) => current === "social" ? null : "social")}><Share2 size={20} /></button>
          <button className="mobile-utility-button" type="button" aria-label={t("label")} aria-expanded={utilityOpen === "languages"} onClick={() => setUtilityOpen((current) => current === "languages" ? null : "languages")}><Globe2 size={20} /></button>
          {utilityOpen === "social" && <div className="mobile-utility-popover mobile-social-popover">
            {socialLinks.map(({ label, href, icon: Icon }) => <a href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} key={label}><Icon size={19} /><span>{label}</span></a>)}
          </div>}
          {utilityOpen === "languages" && <div className="mobile-utility-popover mobile-language-popover" aria-label={t("label")}>
            {routing.locales.map((targetLocale) => targetLocale === locale
              ? <span className="active" key={targetLocale} aria-current="page">{t(localeName(targetLocale))}</span>
              : <Link href="/" locale={targetLocale} key={targetLocale}>{t(localeName(targetLocale))}</Link>)}
          </div>}
        </div>
      </nav>
    </motion.header>
  );
}

function localeFlag(locale: AppLocale) {
  return locale === "ar" ? "🇸🇦" : locale === "tr" ? "🇹🇷" : "🇬🇧";
}

function localeName(locale: AppLocale): "english" | "arabic" | "turkish" {
  return locale === "ar" ? "arabic" : locale === "tr" ? "turkish" : "english";
}

function externalUrl(value: string) {
  const url = value.trim();
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
