import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/jobs/queries";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const staticPaths = ["", "/jobs", "/walk-in-interviews", "/today-jobs", "/urgent-jobs", "/fresher-jobs", "/categories", "/locations", "/companies", "/about", "/terms", "/privacy", "/employers"];
  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${site}${path || "/"}`,
    changeFrequency: "hourly",
    priority: path === "" ? 1 : 0.7,
  }));
  try {
    const data = await sitemapEntries();
    for (const job of data.jobs) {
      entries.push({ url: `${site}/jobs/${job.slug}`, lastModified: job.updatedAt, changeFrequency: "daily", priority: 0.8 });
    }
    for (const page of data.seo) {
      entries.push({ url: `${site}${page.path}`, lastModified: page.updatedAt, changeFrequency: "daily", priority: 0.6 });
    }
    for (const company of data.companies) {
      if (!company.slug) continue;
      entries.push({ url: `${site}/companies/${company.slug}`, lastModified: company.updatedAt, changeFrequency: "daily", priority: 0.5 });
    }
    for (const category of data.categories) {
      entries.push({ url: `${site}/categories/${category}`, changeFrequency: "daily", priority: 0.5 });
    }
  } catch {
    return entries;
  }
  return entries;
}
