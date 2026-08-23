import { notFound } from "next/navigation";
import { ResourceManager } from "@/components/admin/resource-manager";
import { adminResources } from "@/lib/admin-resources";

export default async function ResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const config = adminResources[resource];
  if (!config) notFound();
  return <ResourceManager resource={resource} config={config} />;
}
