import { finalizeJob, type RawJobInput } from "@/lib/job-sources/finalize";
import { fetchProviderJson } from "@/lib/job-sources/http";
import type { AdapterContext, AdapterFactory } from "@/lib/job-sources/types";
import { asRecord, cleanText } from "@/lib/utils";

interface AdzunaResponse {
  results?: unknown[];
}

export const createAdzunaAdapter: AdapterFactory = (context) => ({
  async fetchJobs() {
    const appId = context.secrets.appId;
    const appKey = context.secrets.apiKey;
    if (!appId || !appKey) {
      throw new Error("Adzuna requires ADZUNA_APP_ID and ADZUNA_APP_KEY on the server.");
    }
    const maxPages = numberConfig(context, "maxPages", 3);
    const resultsPerPage = Math.min(numberConfig(context, "resultsPerPage", 50), 50);
    const locations = searchLocations(context);
    const seen = new Set<string>();
    const jobs: unknown[] = [];

    for (const where of locations) {
      for (let page = 1; page <= maxPages; page += 1) {
        const params = new URLSearchParams({
          app_id: appId,
          app_key: appKey,
          results_per_page: String(resultsPerPage),
          sort_by: "date",
          max_days_old: String(numberConfig(context, "maxDaysOld", 30)),
        });
        const keyword = cleanText(context.source.config.what);
        if (keyword) params.set("what", keyword);
        if (where) params.set("where", where);
        const url = `https://api.adzuna.com/v1/api/jobs/ae/search/${page}?${params.toString()}`;
        const payload = await fetchProviderJson<AdzunaResponse>(url);
        const results = payload.results ?? [];
        if (!results.length) break;
        for (const result of results) {
          const id = cleanText(asRecord(result)?.id);
          if (id && seen.has(id)) continue;
          if (id) seen.add(id);
          jobs.push(result);
        }
        if (results.length < resultsPerPage) break;
      }
    }
    return jobs;
  },
  normalizeJob(job) {
    const record = asRecord(job);
    if (!record) return null;
    const company = asRecord(record.company);
    const location = asRecord(record.location);
    const category = asRecord(record.category);
    const area = Array.isArray(location?.area) ? location.area.filter((item) => typeof item === "string").join(", ") : "";
    const input: RawJobInput = {
      title: record.title,
      company: company?.display_name,
      location: cleanText(location?.display_name) || area,
      description: record.description,
      salaryMin: record.salary_is_predicted ? undefined : record.salary_min,
      salaryMax: record.salary_is_predicted ? undefined : record.salary_max,
      predictedSalary: record.salary_is_predicted === true,
      currency: record.salary_is_predicted ? undefined : "AED",
      employmentType: cleanText(record.contract_time) || cleanText(record.contract_type),
      category: category?.label,
      sourceJobId: record.id,
      sourceUrl: record.redirect_url,
      applicationUrl: record.redirect_url,
      publishedAt: record.created,
    };
    return finalizeJob(input, context);
  },
});

function searchLocations(context: AdapterContext): string[] {
  const configured = context.source.locationFilter.filter(Boolean);
  if (configured.length) {
    return configured.map((item) => item.replace(/-/g, " "));
  }
  return [""];
}

function numberConfig(context: AdapterContext, key: string, fallback: number): number {
  const value = context.source.config[key];
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}
