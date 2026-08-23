import { connectDb } from "@/lib/db";
import { SiteSettingsModel } from "@/lib/models";
import { defaultSiteSettings, type SiteSettings } from "@/lib/site-settings";

export async function getSiteSettings(): Promise<SiteSettings> {
  await connectDb();
  const record = await SiteSettingsModel.findOne().lean();

  return {
    ...defaultSiteSettings,
    ...JSON.parse(JSON.stringify(record)),
  } as SiteSettings;
}

export async function ensureSiteSettings(): Promise<SiteSettings> {
  await connectDb();
  const record = await SiteSettingsModel.findOneAndUpdate(
    {},
    { $setOnInsert: defaultSiteSettings },
    { new: true, upsert: true },
  ).lean();

  return {
    ...defaultSiteSettings,
    ...JSON.parse(JSON.stringify(record)),
  } as SiteSettings;
}
