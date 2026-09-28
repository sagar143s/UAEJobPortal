import { finalizeJob } from "@/lib/job-sources/finalize";
import { fetchProviderJson } from "@/lib/job-sources/http";
import { pickJob } from "@/lib/job-sources/pick";
import type { AdapterFactory } from "@/lib/job-sources/types";
import { asArray, asRecord, assertPublicHttpUrl, cleanText } from "@/lib/utils";

export const createJsonFeedAdapter: AdapterFactory = (context) => ({
  async fetchJobs() {
    const feedUrl = context.source.feedUrl || context.source.apiUrl;
    if (!feedUrl) throw new Error("JSON source needs a feed URL.");
    assertPublicHttpUrl(feedUrl);
    const headers: Record<string, string> = {};
    if (context.secrets.apiKey) headers.Authorization = `Bearer ${context.secrets.apiKey}`;
    const payload = await fetchProviderJson<unknown>(feedUrl, { headers });
    return extractItems(payload, cleanText(context.source.config.itemsPath));
  },
  normalizeJob(job) {
    const mapping = stringMap(context.source.config.mapping);
    const picked = pickJob(job, mapping);
    if (!picked) return null;
    if (!picked.company) picked.company = cleanText(context.source.config.companyName);
    return finalizeJob(picked, context);
  },
});

export function extractItems(payload: unknown, itemsPath?: string): unknown[] {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  if (!record) return [];
  if (itemsPath) {
    const value = itemsPath.split(".").reduce<unknown>((current, part) => {
      const item = asRecord(current);
      return item ? item[part] : undefined;
    }, record);
    return asArray(value);
  }
  for (const key of ["jobs", "results", "data", "items", "postings"]) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
}

function stringMap(value: unknown): Record<string, string> | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  const entries = Object.entries(record).filter((entry): entry is [string, string] => typeof entry[1] === "string");
  return Object.fromEntries(entries);
}
