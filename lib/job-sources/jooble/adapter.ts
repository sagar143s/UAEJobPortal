import { finalizeJob } from "@/lib/job-sources/finalize";
import { fetchProviderJson } from "@/lib/job-sources/http";
import { pickJob } from "@/lib/job-sources/pick";
import type { AdapterContext, AdapterFactory } from "@/lib/job-sources/types";
import { detectEmirate, emirateName } from "@/lib/uae/emirates";
import { asArray, asRecord, cleanText } from "@/lib/utils";

export const createJoobleAdapter: AdapterFactory = (context) => ({
  async fetchJobs() {
    const apiKey = context.secrets.apiKey;
    if (!apiKey) {
      throw new Error("Jooble requires JOOBLE_API_KEY on the server.");
    }
    const keywords = stringList(context.source.config.keywords);
    const terms = keywords.length ? keywords : ["manager"];
    const locations = searchLocations(context);
    const pages = Math.min(numberConfig(context, "pages", 1), 2);
    const seen = new Map<string, Record<string, unknown>>();
    const jobs: unknown[] = [];

    for (const location of locations) {
      for (const keyword of terms) {
        for (let page = 1; page <= pages; page += 1) {
          let payload: unknown;
          try {
            payload = await fetchProviderJson<unknown>(`https://jooble.org/api/${encodeURIComponent(apiKey)}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ keywords: keyword, location, page }),
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : "";
            if (message.includes("rate limit")) return jobs;
            throw error;
          }
          const record = asRecord(payload);
          const batch = asArray(record?.jobs);
          if (!batch.length) break;
          for (const job of batch) {
            const item = asRecord(job);
            if (!item) continue;
            const id = cleanText(item.id);
            if (id && seen.has(id)) {
              const previous = seen.get(id);
              if (previous && previous.searchPlace && previous.searchPlace !== location) previous.searchPlace = "";
              continue;
            }
            item.searchPlace = location;
            if (id) seen.set(id, item);
            jobs.push(item);
          }
        }
      }
    }
    return jobs;
  },
  normalizeJob(job) {
    const picked = pickJob(job);
    if (!picked) return null;
    const record = asRecord(job);
    const stated = detectEmirate(picked.location || "");
    const found = detectEmirate(`${picked.title ?? ""}\n${picked.description ?? ""}\n${picked.location ?? ""}`);
    const searched = detectEmirate(cleanText(record?.searchPlace));
    const emirate = found && found !== "uae" ? found : searched && searched !== "uae" ? searched : stated;
    if (emirate && emirate !== "uae") picked.location = emirateName(emirate);
    return finalizeJob(picked, context);
  },
});

function searchLocations(context: AdapterContext): string[] {
  const configured = context.source.locationFilter.length
    ? context.source.locationFilter
    : stringList(context.source.config.locations);
  const places = configured.length
    ? configured.map((item) => item.replace(/-/g, " "))
    : ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Al Ain", "Fujairah", "Umm Al Quwain"];
  return places.map((place) => (/united arab emirates|uae/i.test(place) ? place : `${place}, United Arab Emirates`));
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => cleanText(item)).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function numberConfig(context: AdapterContext, key: string, fallback: number): number {
  const value = context.source.config[key];
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}
