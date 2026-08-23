"use client";

import { BriefcaseBusiness, Contact, FileText, GraduationCap, Home, Info, Layers3, LogOut, Settings2, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/types", label: "Skill types", icon: Layers3 },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/experiences", label: "Experience", icon: BriefcaseBusiness },
  { href: "/admin/work", label: "Work", icon: FileText },
  { href: "/admin/about", label: "About", icon: Info },
  { href: "/admin/contact", label: "Contact", icon: Contact },
  { href: "/admin/settings", label: "Site settings", icon: Settings2 },
];

export function AdminShell({ children, username }: { children: React.ReactNode; username: string }) {
  const pathname = usePathname(); const router = useRouter();
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }
  return <div className="admin-shell">
    <aside className="admin-sidebar"><Link className="admin-brand" href="/admin"><span>AA</span><div>Portfolio<small>Content studio</small></div></Link><nav>{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={pathname === href ? "active" : ""}><Icon size={18} />{label}</Link>)}</nav><div className="admin-user"><div><small>Signed in as</small><strong>{username}</strong></div><button onClick={logout} title="Sign out"><LogOut size={18} /></button></div></aside>
    <div className="admin-main"><header><div><p>Content management</p><strong>{items.find((item) => item.href === pathname)?.label || "Dashboard"}</strong></div><Link href="/" target="_blank">View site ↗</Link></header><div className="admin-content">{children}</div></div>
  </div>;
}
