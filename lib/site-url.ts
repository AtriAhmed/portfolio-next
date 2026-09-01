const developmentSiteUrl = "http://localhost:3000";

/** The public origin used for canonical URLs, sitemaps, and social cards. */
export function getSiteUrl() {
  const configuredUrl = process.env.SITE_URL?.trim();

  if (configuredUrl) {
    try {
      return new URL(configuredUrl);
    } catch {
      console.warn("SITE_URL is invalid; falling back to the local development URL.");
    }
  }

  return new URL(developmentSiteUrl);
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}
