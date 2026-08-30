"use client";

import { BriefcaseBusiness, Contact, FileText, GraduationCap, Home, Info, Languages, Layers3, LogOut, Settings2, Sparkles, University } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/training", label: "Training", icon: University },
  { href: "/admin/types", label: "Skill types", icon: Layers3 },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/languages", label: "Languages", icon: Languages },
  { href: "/admin/experiences", label: "Experience", icon: BriefcaseBusiness },
  { href: "/admin/work", label: "Selected work", icon: FileText },
  { href: "/admin/about", label: "About", icon: Info },
  { href: "/admin/contact", label: "Profile & Contact", icon: Contact },
  { href: "/admin/settings", label: "Site settings", icon: Settings2 },
];

export function AdminShell({ children, username }: { children: React.ReactNode; username: string }) {
  const pathname = usePathname(); const router = useRouter();
  useEffect(() => {
    let refreshing = false;
    const refresh = async () => {
      if (refreshing || document.visibilityState !== "visible") return;
      refreshing = true;
      try {
        await fetch("/api/auth/refresh", { method: "POST", cache: "no-store" });
      } finally {
        refreshing = false;
      }
    };
    void refresh();
    window.addEventListener("focus", refresh);
    const interval = window.setInterval(refresh, 12 * 60 * 60 * 1_000);
    return () => { window.removeEventListener("focus", refresh); window.clearInterval(interval); };
  }, []);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }
  return <div className="admin-shell">
    <aside className="admin-sidebar"><Link className="admin-brand" href="/admin"><span>MZ</span><div>Mohamed Zayani<small>Content studio</small></div></Link><nav>{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={pathname === href ? "active" : ""}><Icon size={18} />{label}</Link>)}</nav><div className="admin-user"><div><small>Signed in as</small><strong>{username}</strong></div><button onClick={logout} title="Sign out"><LogOut size={18} /></button></div></aside>
    <div className="admin-main"><header><div><p>Content management</p><strong>{items.find((item) => item.href === pathname)?.label || "Dashboard"}</strong></div><Link href="/" target="_blank">View site ↗</Link></header><div className="admin-content">{children}</div></div>
  </div>;
}
