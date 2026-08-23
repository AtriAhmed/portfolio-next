"use client";

import { useState } from "react";
import { Github, Linkedin, Menu, X } from "lucide-react";
import { motion } from "motion/react";

type SiteNavProps = {
  name?: string;
  title?: string;
  github?: string;
  linkedin?: string;
  links: { href: string; label: string }[];
};

export function SiteNav({ name, title, github, linkedin, links }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const socialLinks = [
    { label: "GitHub", href: externalUrl(github, "https://github.com/AtriAhmed"), icon: Github },
    { label: "LinkedIn", href: externalUrl(linkedin, "https://www.linkedin.com/in/ahmed-atri-5564601b2"), icon: Linkedin },
  ];

  return (
    <motion.header className="site-header" initial={{ opacity: 0, y: -72 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease: [.22, 1, .36, 1] }}>
      <nav className="nav-shell" aria-label="Primary navigation">
        <a className="brand" href="#about"><span>{name || "Ahmed Atri"}</span><small>{title || "Full-stack Developer"}</small></a>
        <button className="menu-button" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
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
      </nav>
    </motion.header>
  );
}

function externalUrl(value: string | undefined, fallback: string) {
  const url = value?.trim() || fallback;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
