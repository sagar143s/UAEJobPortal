import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/profile", "/saved", "/alerts", "/history", "/employers/jobs", "/employers/applications"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
