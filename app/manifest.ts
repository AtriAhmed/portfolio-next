import type { MetadataRoute } from "next";
import { defaultSiteSettings } from "@/lib/site-settings";
import { getSiteSettings } from "@/lib/site-settings-data";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let settings = defaultSiteSettings;
  try {
    settings = await getSiteSettings();
  } catch (error) {
    console.error("Manifest settings could not be loaded", error);
  }
  return {
    name: settings.siteTitle,
    short_name: settings.footerText,
    description: settings.siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 24x24 32x32 64x64",
        type: "image/x-icon",
      },
    ],
  };
}
