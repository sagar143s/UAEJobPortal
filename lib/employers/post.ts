import { revalidatePath } from "next/cache";
import { finalizeJob } from "@/lib/job-sources/finalize";
import { getSettings } from "@/lib/jobs/queries";
import { jobContentHash, jobFingerprint, jobSlug } from "@/lib/jobs/identity";
import { Category, Company, Job, JobSource } from "@/lib/models";
import { getSiteUrl } from "@/lib/site";
import { slugify } from "@/lib/utils";

export async function createDirectJob(input: {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string;
  benefits?: string;
  employmentType?: string;
  experienceText?: string;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  salaryPeriod?: string;
  applicationUrl?: string;
  expiresAt?: string;
  employerId: string;
}) {
  const settings = await getSettings();
  await JobSource.findOneAndUpdate(
    { slug: "direct" },
    {
      $setOnInsert: {
        name: "Direct employers",
        slug: "direct",
        type: "MANUAL",
        provider: "manual",
        enabled: true,
        country: "AE",
        syncInterval: 1440,
        syncMode: "incremental",
        status: "connected",
        attributionText: "Posted directly on UAEJobPortal",
      },
    },
    { upsert: true },
  );
  const sourceId = crypto.randomUUID();
  const normalized = finalizeJob(
    {
      ...input,
      sourceJobId: sourceId,
      sourceUrl: input.applicationUrl || `${getSiteUrl()}/employers`,
      applicationUrl: input.applicationUrl || `${getSiteUrl()}/employers`,
      applicationType: input.applicationUrl ? "external" : "internal",
      publishedAt: new Date(),
      expiresAt: input.expiresAt || undefined,
      currency: input.salaryMin || input.salaryMax ? input.currency || "AED" : undefined,
      salaryPeriod: input.salaryMin || input.salaryMax ? input.salaryPeriod : undefined,
    },
    {
      source: {
        id: "direct",
        name: "UAEJobPortal",
        slug: "direct",
        type: "MANUAL",
        provider: "manual",
        country: "AE",
        locationFilter: [],
        syncMode: "incremental",
        attributionText: "Posted directly on UAEJobPortal",
        config: {},
      },
      secrets: {},
    },
  );
  if (!normalized) {
    return { error: "Enter a UAE location such as Dubai, Abu Dhabi or Sharjah." as const };
  }
  const companySlug = slugify(normalized.company) || "company";
  const company = await Company.findOneAndUpdate(
    { slug: companySlug },
    { $setOnInsert: { name: normalized.company, slug: companySlug, source: "direct", verified: false } },
    { upsert: true, returnDocument: "after" },
  );
  if (normalized.categorySlug && normalized.category) {
    await Category.updateOne(
      { slug: normalized.categorySlug },
      { $setOnInsert: { name: normalized.category, slug: normalized.categorySlug } },
      { upsert: true },
    );
  }
  const slug = jobSlug(normalized.title, "direct", sourceId);
  if (!input.applicationUrl) {
    normalized.applicationUrl = `${getSiteUrl()}/jobs/${slug}`;
    normalized.sourceUrl = normalized.applicationUrl;
    normalized.applicationType = "internal";
  }
  const job = await Job.create({
    ...normalized,
    slug,
    companySlug,
    lastSeenAt: new Date(),
    status: settings.requireJobApproval ? "PENDING" : "ACTIVE",
    fingerprint: jobFingerprint(normalized),
    contentHash: jobContentHash(normalized),
    employerId: input.employerId,
    verifiedEmployer: Boolean(company?.verified),
    isFeatured: false,
  });
  revalidatePath("/jobs");
  return { slug: job.slug };
}
