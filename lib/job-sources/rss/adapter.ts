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

export const createRssAdapter: AdapterFactory = (context) => ({
  async fetchJobs() {
    const feedUrl = context.source.feedUrl || context.source.apiUrl;
    if (!feedUrl) throw new Error("RSS source needs a feed URL.");
    assertPublicHttpUrl(feedUrl);
    const { text } = await fetchProvider(feedUrl);
    const parsed = parser.parse(text) as unknown;
    return rssItems(parsed);
  },
  normalizeJob(job) {
    const picked = pickJob(job);
    if (!picked) return null;
    if (!picked.company) picked.company = cleanText(context.source.config.companyName);
    return finalizeJob(picked, context);
  },
});

export function rssItems(parsed: unknown): unknown[] {
  const root = asRecord(parsed);
  if (!root) return [];
  const rss = asRecord(root.rss);
  const channel = asRecord(rss?.channel) ?? asRecord(root.channel);
  if (channel?.item) return asArray(channel.item);
  const feed = asRecord(root.feed);
  if (feed?.entry) {
    return asArray(feed.entry).map((entry) => atomToItem(entry));
  }
  return [];
}

function atomToItem(entry: unknown): unknown {
  const record = asRecord(entry);
  if (!record) return entry;
  const link = asArray(record.link)
    .map((item) => {
      if (typeof item === "string") return item;
      const linkRecord = asRecord(item);
      return cleanText(linkRecord?.href);
    })
    .find(Boolean);
  return {
    ...record,
    link,
    description: record.content ?? record.summary,
    pubDate: record.updated ?? record.published,
    guid: record.id,
  };
}
