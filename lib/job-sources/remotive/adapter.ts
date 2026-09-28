import { finalizeJob } from "@/lib/job-sources/finalize";
import { fetchProviderJson } from "@/lib/job-sources/http";
import { pickJob } from "@/lib/job-sources/pick";
import type { AdapterFactory } from "@/lib/job-sources/types";
import { asArray, asRecord } from "@/lib/utils";

export const createRemotiveAdapter: AdapterFactory = (context) => ({
  async fetchJobs() {
    const payload = await fetchProviderJson<unknown>("https://remotive.com/api/remote-jobs");
    const record = asRecord(payload);
    return asArray(record?.jobs);
  },
  normalizeJob(job) {
    const record = asRecord(job);
    if (!record) return null;
    const picked = pickJob({
      ...record,
      company: record.company_name,
      location: record.candidate_required_location,
      description: record.description,
      employmentType: record.job_type,
      category: record.category,
      publishedAt: record.publication_date,
      url: record.url,
      id: record.id,
    });
    if (!picked) return null;
    return finalizeJob(
      {
        ...picked,
        salaryText: typeof record.salary === "string" ? record.salary : undefined,
      },
      context,
    );
  },
});
