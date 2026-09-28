import { stableHash } from "@/lib/utils";
import type { NormalizedJob } from "@/lib/job-sources/types";

export function jobFingerprint(job: Pick<NormalizedJob, "company" | "title" | "location" | "applicationUrl">) {
  return [job.company, job.title, job.location, job.applicationUrl]
    .map((part) => part.toLowerCase().replace(/\s+/g, " ").trim())
    .join("|");
}

export function jobContentHash(job: NormalizedJob) {
  return stableHash(
    JSON.stringify({
      title: job.title,
      company: job.company,
      location: job.location,
      emirate: job.emirate,
      description: job.description,
      salaryMin: job.salaryMin ?? null,
      salaryMax: job.salaryMax ?? null,
      salaryText: job.salaryText ?? null,
      currency: job.currency ?? null,
      employmentType: job.employmentType ?? null,
      applicationUrl: job.applicationUrl,
      closed: job.closed,
      walkIn: job.walkIn?.interviewDate.toISOString() ?? null,
    }),
  );
}

export function jobSlug(title: string, source: string, sourceJobId: string) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return `${base || "job"}-${stableHash(`${source}:${sourceJobId}`).slice(0, 6)}`;
}
