import { firstRecord, upsertSingleton } from "@/lib/content-repository";
import { localizeRecord } from "@/lib/content-i18n";
import type { AppLocale } from "@/i18n/routing";
import { defaultSiteSettings, type SiteSettings } from "@/lib/site-settings";

export async function getSiteSettings(locale: AppLocale = "en"): Promise<SiteSettings> {
  const record = await firstRecord("settings");
  const localized = await localizeRecord("settings", record, locale);

  return {
    ...defaultSiteSettings,
    ...localized,
  } as SiteSettings;
}

export async function ensureSiteSettings(): Promise<SiteSettings> {
  const existing = await firstRecord("settings");
  const record = existing ?? await upsertSingleton("settings", defaultSiteSettings);

  return {
    ...defaultSiteSettings,
    ...record,
  } as SiteSettings;
}
