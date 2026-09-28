export function getSiteUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://uaejobportal.online";
  return url.replace(/\/$/, "");
}

export const site = {
  name: "UAEJobPortal",
  domain: "UAEJobPortal.online",
  tagline: "Find Your Next Job in the UAE",
};
