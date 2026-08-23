import Link from "next/link";
import { BriefcaseBusiness, FileText, Layers3, Sparkles } from "lucide-react";
import { connectDb } from "@/lib/db";
import { ExperienceModel, SkillModel, TypeModel, WorkModel } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let counts = [0, 0, 0, 0];
  try { await connectDb(); counts = await Promise.all([ExperienceModel.countDocuments(), WorkModel.countDocuments(), TypeModel.countDocuments(), SkillModel.countDocuments()]); } catch (error) { console.error(error); }
  const cards = [
    ["Experiences", counts[0], "/admin/experiences", BriefcaseBusiness], ["Projects", counts[1], "/admin/work", FileText],
    ["Skill groups", counts[2], "/admin/types", Layers3], ["Skills", counts[3], "/admin/skills", Sparkles],
  ] as const;
  return <><div className="admin-heading"><div><p className="eyebrow">Overview</p><h1>Your portfolio at a glance</h1></div></div><div className="stats-grid">{cards.map(([label, count, href, Icon]) => <Link href={href} key={label}><Icon /><strong>{count}</strong><span>{label}</span></Link>)}</div></>;
}
