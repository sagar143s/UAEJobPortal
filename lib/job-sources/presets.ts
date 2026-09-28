import type { SourceType } from "@/lib/job-sources/types";

export const PROVIDER_PRESETS: Array<{
  id: string;
  name: string;
  provider: string;
  type: SourceType;
  attributionText: string;
  termsUrl: string;
  apiKeyEnv?: string;
  appIdEnv?: string;
  feedUrl?: string;
  syncMode: "snapshot" | "incremental";
  config: Record<string, unknown>;
  note: string;
}> = [
  {
    id: "adzuna",
    name: "Adzuna",
    provider: "adzuna",
    type: "API",
    attributionText: "Jobs by Adzuna",
    termsUrl: "https://developer.adzuna.com/docs/search",
    apiKeyEnv: "ADZUNA_APP_KEY",
    appIdEnv: "ADZUNA_APP_ID",
    syncMode: "incremental",
    config: { maxPages: 2, resultsPerPage: 50, maxDaysOld: 30 },
    note: "Uses the official Adzuna jobs API for country ae. Predicted salaries are ignored.",
  },
  {
    id: "jooble",
    name: "Jooble",
    provider: "jooble",
    type: "API",
    attributionText: "Jobs by Jooble",
    termsUrl: "https://jooble.org/api/about",
    apiKeyEnv: "JOOBLE_API_KEY",
    syncMode: "incremental",
    config: {
      keywords: ["it", "accountant", "sales", "engineer", "nurse", "driver"],
      pages: 1,
      locations: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Al Ain", "Fujairah", "Umm Al Quwain"],
    },
    note: "Official Jooble API. Each emirate is searched as “City, United Arab Emirates”. Keep the Jooble attribution.",
  },
  {
    id: "json-feed",
    name: "JSON feed",
    provider: "json-feed",
    type: "JSON",
    attributionText: "",
    termsUrl: "",
    syncMode: "snapshot",
    config: { assumeUae: false },
    note: "Authorized JSON, JSON Feed, or employer API. Set assumeUae only when the whole feed is UAE jobs.",
  },
  {
    id: "rss",
    name: "RSS feed",
    provider: "rss",
    type: "RSS",
    attributionText: "",
    termsUrl: "",
    syncMode: "snapshot",
    config: { assumeUae: false },
    note: "Authorized RSS or Atom feed. Private hosts are blocked.",
  },
  {
    id: "xml-feed",
    name: "XML feed",
    provider: "xml-feed",
    type: "XML",
    attributionText: "",
    termsUrl: "",
    syncMode: "snapshot",
    config: { itemsPath: "jobs.job", assumeUae: false },
    note: "Authorized XML job feed. Set itemsPath to the repeating job element.",
  },
  {
    id: "greenhouse",
    name: "Greenhouse board",
    provider: "ats",
    type: "ATS",
    attributionText: "Via the employer's Greenhouse board",
    termsUrl: "https://developers.greenhouse.io/job-board.html",
    syncMode: "snapshot",
    config: { ats: "greenhouse", board: "", companyName: "" },
    note: "Public Greenhouse job board published by the employer. Enter the board token and real company name.",
  },
  {
    id: "lever",
    name: "Lever board",
    provider: "ats",
    type: "ATS",
    attributionText: "Via the employer's Lever board",
    termsUrl: "https://github.com/lever/postings-api",
    syncMode: "snapshot",
    config: { ats: "lever", board: "", companyName: "" },
    note: "Public Lever postings feed published by the employer.",
  },
  {
    id: "remotive",
    name: "Remotive",
    provider: "remotive",
    type: "API",
    attributionText: "Jobs by Remotive",
    termsUrl: "https://remotive.com/api-documentation",
    feedUrl: "https://remotive.com/api/remote-jobs",
    syncMode: "snapshot",
    config: {},
    note: "Official Remotive API. Only listings whose location is in the UAE are imported.",
  },
  {
    id: "manual",
    name: "Direct employers",
    provider: "manual",
    type: "MANUAL",
    attributionText: "Posted directly on UAEJobPortal",
    termsUrl: "",
    syncMode: "incremental",
    config: {},
    note: "Jobs posted by registered employers. Sync does not invent listings.",
  },
];
