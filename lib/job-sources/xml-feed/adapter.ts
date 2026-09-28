import { XMLParser } from "fast-xml-parser";
import { finalizeJob } from "@/lib/job-sources/finalize";
import { fetchProvider } from "@/lib/job-sources/http";
import { pickJob } from "@/lib/job-sources/pick";
import type { AdapterFactory } from "@/lib/job-sources/types";
import { asArray, asRecord, assertPublicHttpUrl, cleanText } from "@/lib/utils";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
});

export const createXmlFeedAdapter: AdapterFactory = (context) => ({
  async fetchJobs() {
    const feedUrl = context.source.feedUrl || context.source.apiUrl;
    if (!feedUrl) throw new Error("XML source needs a feed URL.");
    assertPublicHttpUrl(feedUrl);
    const { text } = await fetchProvider(feedUrl);
    const parsed = parser.parse(text) as unknown;
    const itemsPath = cleanText(context.source.config.itemsPath) || "jobs.job";
    return xmlItems(parsed, itemsPath);
  },
  normalizeJob(job) {
    const picked = pickJob(job);
    if (!picked) return null;
    if (!picked.company) picked.company = cleanText(context.source.config.companyName);
    return finalizeJob(picked, context);
  },
});

export function xmlItems(parsed: unknown, itemsPath: string): unknown[] {
  const value = itemsPath.split(".").reduce<unknown>((current, part) => {
    const record = asRecord(current);
    return record ? record[part] : undefined;
  }, parsed);
  return asArray(value);
}
