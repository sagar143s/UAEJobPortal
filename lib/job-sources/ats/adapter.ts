import { finalizeJob, type RawJobInput } from "@/lib/job-sources/finalize";
import { fetchProviderJson } from "@/lib/job-sources/http";
import type { AdapterFactory } from "@/lib/job-sources/types";
import { asArray, asRecord, cleanText } from "@/lib/utils";

export const createAtsAdapter: AdapterFactory = (context) => ({
  async fetchJobs() {
    const companyName = cleanText(context.source.config.companyName);
    if (!companyName) {
      throw new Error("ATS sources need config.companyName, the employer's real name.");
    }
    const board = cleanText(context.source.config.board);
    if (!board || !/^[a-z0-9_-]{1,80}$/i.test(board)) {
      throw new Error("ATS sources need a public board token in config.board.");
    }
    const ats = cleanText(context.source.config.ats).toLowerCase();
    if (ats === "lever") {
      const payload = await fetchProviderJson<unknown>(
        `https://api.lever.co/v0/postings/${encodeURIComponent(board)}?mode=json`,
      );
      return asArray(payload);
    }
    if (ats === "greenhouse") {
      const payload = await fetchProviderJson<unknown>(
        `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=true`,
      );
      const record = asRecord(payload);
      return asArray(record?.jobs);
    }
    throw new Error("ATS provider must be greenhouse or lever.");
  },
  normalizeJob(job) {
    const record = asRecord(job);
    if (!record) return null;
    const ats = cleanText(context.source.config.ats).toLowerCase();
    const company = cleanText(context.source.config.companyName);
    if (ats === "lever") {
      const categories = asRecord(record.categories);
      const input: RawJobInput = {
        title: record.text,
        company,
        location: categories?.location,
        description: record.descriptionPlain || record.description,
        employmentType: categories?.commitment,
        category: categories?.team,
        sourceJobId: record.id,
        sourceUrl: record.hostedUrl,
        applicationUrl: record.applyUrl || record.hostedUrl,
        publishedAt: record.createdAt,
      };
      return finalizeJob(input, context);
    }
    const location = asRecord(record.location);
    const input: RawJobInput = {
      title: record.title,
      company,
      location: location?.name,
      description: record.content,
      sourceJobId: record.id,
      sourceUrl: record.absolute_url,
      applicationUrl: record.absolute_url,
      publishedAt: record.updated_at,
      category: categoryFrom(record.departments),
    };
    return finalizeJob(input, context);
  },
});

function categoryFrom(value: unknown): string | undefined {
  const first = asRecord(asArray(value)[0]);
  return cleanText(first?.name) || undefined;
}
