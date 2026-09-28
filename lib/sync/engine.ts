import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { jobContentHash, jobFingerprint, jobSlug } from "@/lib/jobs/identity";
import { createJobSourceAdapter, resolveSecrets } from "@/lib/job-sources/registry";
import { decideDuplicate, type SourceConfig, type SyncCounts } from "@/lib/job-sources/types";
import { Category, Company, Job, JobSource, JobSyncLog, Settings } from "@/lib/models";
import { slugify } from "@/lib/utils";

export interface SyncResult extends SyncCounts {
  sourceId: string;
  sourceName: string;
  status: "success" | "partial" | "failed";
  message?: string;
}

const EMPTY: SyncCounts = {
  fetchedCount: 0,
  uaeCount: 0,
  importedCount: 0,
  updatedCount: 0,
  duplicateCount: 0,
  skippedCount: 0,
  errorCount: 0,
  errors: [],
};

export async function syncSource(sourceId: string, trigger: "manual" | "cron" | "worker"): Promise<SyncResult> {
  const db = await connectDB();
  if (!db) {
    return {
      ...EMPTY,
      sourceId,
      sourceName: "Unknown",
      status: "failed",
      errors: ["MongoDB is not connected. Set MONGODB_URI."],
      errorCount: 1,
    };
  }

  const source = await JobSource.findById(sourceId).select("+apiKey");
  if (!source) {
    return { ...EMPTY, sourceId, sourceName: "Unknown", status: "failed", errors: ["Job source was not found."], errorCount: 1 };
  }
  if (!source.enabled) {
    return {
      ...EMPTY,
      sourceId,
      sourceName: source.name,
      status: "failed",
      errors: ["Enable the source before syncing."],
      errorCount: 1,
    };
  }

  const startedAt = new Date();
  const log = await JobSyncLog.create({
    sourceId: source._id,
    sourceName: source.name,
    trigger,
    startedAt,
    status: "running",
  });

  const counts: SyncCounts = { ...EMPTY, errors: [] };
  try {
    const secrets = resolveSecrets(source);
    const context = {
      source: toSourceConfig(source),
      secrets: { apiKey: secrets.apiKey, appId: secrets.appId },
    };
    const adapter = createJobSourceAdapter(context);
    const rawJobs = await adapter.fetchJobs();
    counts.fetchedCount = rawJobs.length;
    const seenIds: string[] = [];

    for (const raw of rawJobs) {
      try {
        const normalized = adapter.normalizeJob(raw);
        if (!normalized) {
          counts.skippedCount += 1;
          continue;
        }
        counts.uaeCount += 1;
        const outcome = await upsertNormalizedJob(normalized);
        seenIds.push(normalized.sourceJobId);
        if (outcome === "create") counts.importedCount += 1;
        else if (outcome === "update") counts.updatedCount += 1;
        else counts.duplicateCount += 1;
      } catch (error) {
        counts.errorCount += 1;
        if (counts.errors.length < 20) {
          counts.errors.push(error instanceof Error ? error.message : "Job could not be saved.");
        }
      }
    }

    if (source.syncMode === "snapshot" && counts.errorCount === 0) {
      await Job.updateMany(
        {
          source: source.slug,
          status: "ACTIVE",
          sourceJobId: { $nin: seenIds },
        },
        { $set: { status: "EXPIRED" } },
      );
    }

    const status = counts.errorCount > 0 ? "partial" : "success";
    source.lastSyncAt = new Date();
    source.status = "connected";
    source.lastError = counts.errors[0];
    source.lastSync = { ...counts, errors: undefined, status };
    await source.save();
    await finishLog(log.id, status, counts);
    revalidateJobPages();
    return { ...counts, sourceId: String(source._id), sourceName: source.name, status };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed.";
    counts.errorCount += 1;
    counts.errors.push(message);
    source.status = "error";
    source.lastError = message;
    source.lastSyncAt = new Date();
    source.lastSync = { ...counts, errors: undefined, status: "failed" };
    await source.save();
    await finishLog(log.id, "failed", counts);
    return { ...counts, sourceId: String(source._id), sourceName: source.name, status: "failed", message };
  }
}

export async function syncDueSources(trigger: "cron" | "worker" = "cron") {
  const db = await connectDB();
  if (!db) return { ok: false, error: "MongoDB is not connected.", results: [] as SyncResult[] };
  const sources = await JobSource.find({ enabled: true }).select("_id lastSyncAt syncInterval");
  const now = Date.now();
  const due = sources.filter((source) => {
    if (!source.lastSyncAt) return true;
    const interval = Math.max(source.syncInterval || 60, 5) * 60 * 1000;
    return source.lastSyncAt.getTime() + interval <= now;
  });
  const results: SyncResult[] = [];
  for (const source of due) {
    results.push(await syncSource(String(source._id), trigger));
  }
  return { ok: true, synced: results.length, results };
}

export async function expireStaleJobs() {
  const db = await connectDB();
  if (!db) return { ok: false, error: "MongoDB is not connected." };
  const settings = await Settings.findOne({ key: "site" }).lean();
  const days = settings?.expireUnseenAfterDays || 21;
  const now = new Date();
  const dated = await Job.updateMany(
    { status: "ACTIVE", expiresAt: { $ne: null, $lte: now } },
    { $set: { status: "EXPIRED" } },
  );
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const unseen = await Job.updateMany(
    { status: "ACTIVE", sourceType: { $ne: "MANUAL" }, lastSeenAt: { $lt: cutoff } },
    { $set: { status: "EXPIRED" } },
  );
  revalidateJobPages();
  return {
    ok: true,
    expiredByDate: dated.modifiedCount,
    expiredUnseen: unseen.modifiedCount,
  };
}

async function upsertNormalizedJob(job: import("@/lib/job-sources/types").NormalizedJob) {
  const fingerprint = jobFingerprint(job);
  const contentHash = jobContentHash(job);
  const existing = await Job.findOne({ source: job.source, sourceJobId: job.sourceJobId });
  const fingerprintMatch = existing
    ? null
    : await Job.findOne({ fingerprint, status: { $in: ["ACTIVE", "PENDING"] } });
  const decision = decideDuplicate({
    existingByExternalId: Boolean(existing),
    identicalContent: existing?.contentHash === contentHash && existing.status !== "EXPIRED",
    existingByFingerprint: Boolean(fingerprintMatch),
  });
  if (decision === "duplicate" && !existing) return "duplicate" as const;

  const companySlug = slugify(job.company) || `company-${job.source}`;
  const company = await Company.findOneAndUpdate(
    { slug: companySlug },
    { $setOnInsert: { name: job.company, slug: companySlug, source: job.source, verified: false } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  if (job.categorySlug && job.category) {
    await Category.updateOne(
      { slug: job.categorySlug },
      { $setOnInsert: { name: job.category, slug: job.categorySlug } },
      { upsert: true },
    );
  }

  const status = job.closed || (job.expiresAt && job.expiresAt.getTime() <= Date.now()) ? "EXPIRED" : "ACTIVE";
  const fields = {
    title: job.title,
    company: job.company,
    companySlug,
    location: job.location,
    emirate: job.emirate,
    description: job.description,
    requirements: job.requirements,
    benefits: job.benefits,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryText: job.salaryText,
    currency: job.currency,
    salaryPeriod: job.salaryPeriod,
    employmentType: job.employmentType,
    experience: job.experience,
    experienceText: job.experienceText,
    category: job.category,
    categorySlug: job.categorySlug,
    skills: job.skills,
    source: job.source,
    sourceName: job.sourceName,
    sourceType: job.sourceType,
    sourceJobId: job.sourceJobId,
    sourceUrl: job.sourceUrl,
    applicationUrl: job.applicationUrl,
    applicationType: job.applicationType,
    publishedAt: job.publishedAt,
    expiresAt: job.expiresAt,
    lastSeenAt: new Date(),
    status,
    attributionText: job.attributionText,
    isWalkIn: job.isWalkIn,
    isUrgent: job.isUrgent || existing?.isUrgent || false,
    verifiedEmployer: Boolean(company?.verified || existing?.verifiedEmployer),
    walkIn: job.walkIn,
    fingerprint,
    contentHash,
  };

  if (!existing) {
    await Job.create({
      ...fields,
      slug: jobSlug(job.title, job.source, job.sourceJobId),
      isFeatured: false,
    });
    return "create" as const;
  }

  if (decision === "duplicate") {
    existing.lastSeenAt = new Date();
    if (status === "EXPIRED") existing.status = "EXPIRED";
    await existing.save();
    return "duplicate" as const;
  }

  existing.set(fields);
  await existing.save();
  return "update" as const;
}

function toSourceConfig(source: {
  id: string;
  name: string;
  slug: string;
  type: SourceConfig["type"];
  provider: string;
  apiUrl?: string | null;
  feedUrl?: string | null;
  country?: string | null;
  locationFilter?: string[] | null;
  attributionText?: string | null;
  termsUrl?: string | null;
  syncMode?: string | null;
  config?: unknown;
}): SourceConfig {
  return {
    id: source.id,
    name: source.name,
    slug: source.slug,
    type: source.type,
    provider: source.provider,
    apiUrl: source.apiUrl || undefined,
    feedUrl: source.feedUrl || undefined,
    country: source.country || "AE",
    locationFilter: source.locationFilter ?? [],
    attributionText: source.attributionText || undefined,
    termsUrl: source.termsUrl || undefined,
    syncMode: source.syncMode === "snapshot" ? "snapshot" : "incremental",
    config: source.config && typeof source.config === "object" ? (source.config as Record<string, unknown>) : {},
  };
}

async function finishLog(id: string, status: "success" | "partial" | "failed", counts: SyncCounts) {
  await JobSyncLog.findByIdAndUpdate(id, {
    status,
    completedAt: new Date(),
    ...counts,
  });
}

export function revalidateJobPages() {
  try {
    for (const path of ["/", "/jobs", "/walk-in-interviews", "/today-jobs", "/urgent-jobs", "/fresher-jobs", "/categories", "/locations", "/companies", "/admin"]) {
      revalidatePath(path);
    }
  } catch {
    // Scripts run outside a Next.js request.
  }
}
