import type { QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db";
import type { JobRecord } from "@/lib/models/Job";
import { Category, Company, Job, JobSource, JobSyncLog, Settings } from "@/lib/models";
import type { JobFilters } from "@/lib/validators";
import { CATEGORIES } from "@/lib/uae/categories";
import { EMIRATES } from "@/lib/uae/emirates";
import { escapeRegex } from "@/lib/utils";
import { addDubaiDays, startOfDubaiDay } from "@/lib/time";
import type { SeoPage } from "@/lib/seo/routes";

export interface PublicJob {
  slug: string;
  title: string;
  company: string;
  companySlug: string;
  location: string;
  emirate: string;
  description: string;
  requirements?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryText?: string;
  currency?: string;
  salaryPeriod?: string;
  employmentType?: string;
  experience?: string;
  experienceText?: string;
  category?: string;
  categorySlug?: string;
  skills: string[];
  sourceName: string;
  sourceJobId: string;
  sourceUrl: string;
  applicationUrl: string;
  applicationType: "external" | "internal";
  publishedAt?: string;
  expiresAt?: string;
  attributionText?: string;
  isWalkIn: boolean;
  isUrgent: boolean;
  isFeatured: boolean;
  verifiedEmployer: boolean;
  walkIn?: {
    interviewDate: string;
    startTime?: string;
    endTime?: string;
    contact?: string;
    email?: string;
    address?: string;
    mapUrl?: string;
  };
}

export interface SearchResult {
  unavailable: boolean;
  jobs: PublicJob[];
  total: number;
  page: number;
  pages: number;
}

const SALARY_BUCKETS: Record<string, { min: number; max?: number }> = {
  "0-3000": { min: 1, max: 3000 },
  "3000-5000": { min: 3000, max: 5000 },
  "5000-8000": { min: 5000, max: 8000 },
  "8000-12000": { min: 8000, max: 12000 },
  "12000-20000": { min: 12000, max: 20000 },
  "20000+": { min: 20000 },
};

export async function searchJobs(
  filters: JobFilters,
  options?: { extra?: QueryFilter<JobRecord>; limit?: number },
): Promise<SearchResult> {
  const page = filters.page || 1;
  const settings = options?.limit ? null : await getSettings();
  const limit = options?.limit || settings?.jobsPerPage || 20;
  const db = await connectDB();
  if (!db) return { unavailable: true, jobs: [], total: 0, page, pages: 0 };

  const clauses = buildClauses(filters, options?.extra);
  const skip = (page - 1) * limit;
  try {
    return await runSearch(clauses, filters.q, skip, limit, page);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!filters.q || !/text/i.test(message)) throw error;
    return runSearch(clauses, undefined, skip, limit, page, filters.q);
  }
}

export async function getJobBySlug(slug: string): Promise<PublicJob | null> {
  const db = await connectDB();
  if (!db) return null;
  const job = await Job.findOne({ slug, ...activeQuery() }).lean();
  return job ? toPublicJob(job) : null;
}

export async function getHomeData() {
  const empty = {
    unavailable: true,
    latest: [] as PublicJob[],
    today: [] as PublicJob[],
    walkIns: [] as PublicJob[],
    categories: [] as { slug: string; name: string; count: number }[],
    locations: EMIRATES.map((emirate) => ({ ...emirate, count: 0 })),
    activeCount: 0,
  };
  const db = await connectDB();
  if (!db) return empty;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [latest, today, walkIns, activeCount, categoryRows, locationRows] = await Promise.all([
    Job.find(activeQuery()).sort({ publishedAt: -1, createdAt: -1 }).limit(12).lean(),
    Job.find({ ...activeQuery(), publishedAt: { $gte: since } }).sort({ publishedAt: -1 }).limit(6).lean(),
    Job.find({
      ...activeQuery(),
      isWalkIn: true,
      "walkIn.interviewDate": { $gte: startOfDubaiDay() },
    })
      .sort({ "walkIn.interviewDate": 1 })
      .limit(4)
      .lean(),
    Job.countDocuments(activeQuery()),
    Job.aggregate<{ _id: string; name: string; count: number }>([
      { $match: { ...activeQuery(), categorySlug: { $nin: [null, ""] } } },
      { $group: { _id: "$categorySlug", name: { $first: "$category" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]),
    Job.aggregate<{ _id: string; count: number }>([
      { $match: activeQuery() },
      { $group: { _id: "$emirate", count: { $sum: 1 } } },
    ]),
  ]);
  const locationMap = new Map(locationRows.map((row) => [row._id, row.count]));
  return {
    unavailable: false,
    latest: latest.map(toPublicJob),
    today: today.map(toPublicJob),
    walkIns: walkIns.map(toPublicJob),
    categories: categoryRows.map((row) => ({
      slug: row._id,
      name: row.name || CATEGORIES.find((category) => category.slug === row._id)?.name || row._id,
      count: row.count,
    })),
    locations: EMIRATES.map((emirate) => ({ ...emirate, count: locationMap.get(emirate.slug) ?? 0 })),
    activeCount,
  };
}

export async function listCompanies(page = 1) {
  const db = await connectDB();
  if (!db) return { unavailable: true, companies: [], total: 0, page, pages: 0 };
  const limit = 24;
  const rows = await Job.aggregate<{ _id: string; name: string; count: number }>([
    { $match: activeQuery() },
    { $group: { _id: "$companySlug", name: { $first: "$company" }, count: { $sum: 1 } } },
    { $sort: { count: -1, name: 1 } },
  ]);
  const verified = await Company.find({ slug: { $in: rows.map((row) => row._id) }, verified: true }).select("slug").lean();
  const verifiedSlugs = new Set(verified.map((company) => company.slug));
  const total = rows.length;
  const companies = rows.slice((page - 1) * limit, page * limit).map((row) => ({
    slug: row._id,
    name: row.name,
    count: row.count,
    verified: verifiedSlugs.has(row._id),
  }));
  return { unavailable: false, companies, total, page, pages: Math.ceil(total / limit) };
}

export async function getCompany(slug: string) {
  const db = await connectDB();
  if (!db) return null;
  const company = await Company.findOne({ slug }).lean();
  const jobs = await Job.find({ ...activeQuery(), companySlug: slug }).sort({ publishedAt: -1 }).limit(50).lean();
  if (!company && jobs.length === 0) return null;
  return {
    name: company?.name || jobs[0]?.company || slug,
    slug,
    website: company?.website,
    description: company?.description,
    verified: Boolean(company?.verified),
    jobs: jobs.map(toPublicJob),
  };
}

export async function countJobs(filter: QueryFilter<JobRecord>) {
  const db = await connectDB();
  if (!db) return 0;
  return Job.countDocuments({ ...activeQuery(), ...filter });
}

export async function countForSeo(page: SeoPage) {
  if (page.kind === "location") return countJobs({ emirate: page.emirate });
  if (page.kind === "walkin-location") return countJobs({ emirate: page.emirate, isWalkIn: true });
  return countJobs({ emirate: page.emirate, categorySlug: page.category });
}

export async function sitemapEntries() {
  const db = await connectDB();
  if (!db) return { jobs: [], seo: [] as { path: string; updatedAt?: Date }[], companies: [] as { slug: string; updatedAt?: Date }[], categories: [] as string[] };
  const jobs = await Job.find(activeQuery()).select("slug updatedAt").sort({ updatedAt: -1 }).limit(10000).lean();
  const pairs = await Job.aggregate<{ _id: { category?: string; emirate: string }; updatedAt: Date }>([
    { $match: activeQuery() },
    {
      $group: {
        _id: { category: "$categorySlug", emirate: "$emirate" },
        updatedAt: { $max: "$updatedAt" },
      },
    },
  ]);
  const seo: { path: string; updatedAt?: Date }[] = [];
  const seen = new Set<string>();
  for (const pair of pairs) {
    const emirate = pair._id.emirate;
    if (!emirate) continue;
    const locationPath = `/jobs-in-${emirate}`;
    if (!seen.has(locationPath)) {
      seen.add(locationPath);
      seo.push({ path: locationPath, updatedAt: pair.updatedAt });
    }
    if (pair._id.category) {
      seo.push({ path: `/${pair._id.category}-jobs-in-${emirate}`, updatedAt: pair.updatedAt });
    }
  }
  const walkIns = await Job.aggregate<{ _id: string; updatedAt: Date }>([
    { $match: { ...activeQuery(), isWalkIn: true } },
    { $group: { _id: "$emirate", updatedAt: { $max: "$updatedAt" } } },
  ]);
  for (const walkIn of walkIns) {
    if (walkIn._id) seo.push({ path: `/walk-in-interviews-in-${walkIn._id}`, updatedAt: walkIn.updatedAt });
  }
  const companies = await Job.aggregate<{ _id: string; updatedAt: Date }>([
    { $match: activeQuery() },
    { $group: { _id: "$companySlug", updatedAt: { $max: "$updatedAt" } } },
    { $limit: 2000 },
  ]);
  return {
    jobs: jobs.map((job) => ({ slug: job.slug, updatedAt: job.updatedAt })),
    seo,
    companies: companies.map((company) => ({ slug: company._id, updatedAt: company.updatedAt })),
    categories: [...new Set(pairs.map((pair) => pair._id.category).filter(Boolean))] as string[],
  };
}

export async function adminOverview() {
  const db = await connectDB();
  if (!db) {
    return { unavailable: true, active: 0, today: 0, walkIns: 0, sources: 0, lastSync: null as Date | null, failed: 0 };
  }
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [active, today, walkIns, sources, last, failed] = await Promise.all([
    Job.countDocuments(activeQuery()),
    Job.countDocuments({ ...activeQuery(), publishedAt: { $gte: since } }),
    Job.countDocuments({ ...activeQuery(), isWalkIn: true, "walkIn.interviewDate": { $gte: startOfDubaiDay() } }),
    JobSource.countDocuments(),
    JobSource.findOne({ lastSyncAt: { $ne: null } }).sort({ lastSyncAt: -1 }).select("lastSyncAt").lean(),
    JobSyncLog.countDocuments({ status: "failed", startedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
  ]);
  return {
    unavailable: false,
    active,
    today,
    walkIns,
    sources,
    lastSync: last?.lastSyncAt ?? null,
    failed,
  };
}

export async function getSettings() {
  const defaults = {
    siteName: "UAEJobPortal",
    tagline: "Find Your Next Job in the UAE",
    jobsPerPage: 20,
    expireUnseenAfterDays: 21,
    requireJobApproval: false,
  };
  const db = await connectDB();
  if (!db) return defaults;
  const settings = await Settings.findOne({ key: "site" }).lean();
  if (!settings) return defaults;
  return {
    siteName: settings.siteName || defaults.siteName,
    tagline: settings.tagline || defaults.tagline,
    jobsPerPage: settings.jobsPerPage || defaults.jobsPerPage,
    expireUnseenAfterDays: settings.expireUnseenAfterDays || defaults.expireUnseenAfterDays,
    requireJobApproval: Boolean(settings.requireJobApproval),
  };
}

export function walkInRange(range?: string) {
  const start = startOfDubaiDay();
  if (range === "today") return { $gte: start, $lt: addDubaiDays(start, 1) };
  if (range === "tomorrow") return { $gte: addDubaiDays(start, 1), $lt: addDubaiDays(start, 2) };
  if (range === "week") return { $gte: start, $lt: addDubaiDays(start, 7) };
  return { $gte: start };
}

function activeQuery(): QueryFilter<JobRecord> {
  return {
    status: "ACTIVE",
    $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
  };
}

function buildClauses(filters: JobFilters, extra?: QueryFilter<JobRecord>) {
  const clauses: QueryFilter<JobRecord>[] = [activeQuery()];
  if (extra) clauses.push(extra);
  if (filters.location) clauses.push({ emirate: filters.location });
  if (filters.category) clauses.push({ categorySlug: filters.category });
  if (filters.type) clauses.push({ employmentType: filters.type });
  if (filters.experience) clauses.push({ experience: filters.experience });
  if (filters.walkin === "1") clauses.push({ isWalkIn: true });
  if (filters.urgent === "1") clauses.push({ isUrgent: true });
  if (filters.verified === "1") clauses.push({ verifiedEmployer: true });
  if (filters.featured === "1") clauses.push({ isFeatured: true });
  if (filters.posted) {
    const days = Number(filters.posted);
    clauses.push({ publishedAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } });
  }
  const bucket = filters.salary ? SALARY_BUCKETS[filters.salary] : undefined;
  if (bucket) {
    const range: Record<string, number> = { $gte: bucket.min };
    if (bucket.max) range.$lte = bucket.max;
    clauses.push({ currency: "AED" });
    clauses.push({ $or: [{ salaryMin: range }, { salaryMax: range }] });
  }
  return clauses;
}

async function runSearch(
  clauses: QueryFilter<JobRecord>[],
  text: string | undefined,
  skip: number,
  limit: number,
  page: number,
  regex?: string,
): Promise<SearchResult> {
  const query: QueryFilter<JobRecord> = { $and: clauses };
  if (text) query.$text = { $search: text };
  if (regex) {
    const pattern = new RegExp(escapeRegex(regex), "i");
    query.$and = [...clauses, { $or: [{ title: pattern }, { company: pattern }, { skills: pattern }, { location: pattern }] }];
  }
  const [jobs, total] = await Promise.all([
    Job.find(query).sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments(query),
  ]);
  return {
    unavailable: false,
    jobs: jobs.map(toPublicJob),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

function toPublicJob(job: {
  slug: string;
  title: string;
  company: string;
  companySlug: string;
  location: string;
  emirate: string;
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryText?: string | null;
  currency?: string | null;
  salaryPeriod?: string | null;
  employmentType?: string | null;
  experience?: string | null;
  experienceText?: string | null;
  category?: string | null;
  categorySlug?: string | null;
  skills?: string[] | null;
  sourceName: string;
  sourceJobId: string;
  sourceUrl: string;
  applicationUrl: string;
  applicationType: "external" | "internal";
  publishedAt?: Date | null;
  expiresAt?: Date | null;
  attributionText?: string | null;
  isWalkIn?: boolean | null;
  isUrgent?: boolean | null;
  isFeatured?: boolean | null;
  verifiedEmployer?: boolean | null;
  walkIn?: {
    interviewDate: Date;
    startTime?: string | null;
    endTime?: string | null;
    contact?: string | null;
    email?: string | null;
    address?: string | null;
    mapUrl?: string | null;
  } | null;
}): PublicJob {
  return {
    slug: job.slug,
    title: job.title,
    company: job.company,
    companySlug: job.companySlug,
    location: job.location,
    emirate: job.emirate,
    description: job.description || "",
    requirements: job.requirements || undefined,
    benefits: job.benefits || undefined,
    salaryMin: job.salaryMin ?? undefined,
    salaryMax: job.salaryMax ?? undefined,
    salaryText: job.salaryText || undefined,
    currency: job.currency || undefined,
    salaryPeriod: job.salaryPeriod || undefined,
    employmentType: job.employmentType || undefined,
    experience: job.experience || undefined,
    experienceText: job.experienceText || undefined,
    category: job.category || undefined,
    categorySlug: job.categorySlug || undefined,
    skills: job.skills ?? [],
    sourceName: job.sourceName,
    sourceJobId: job.sourceJobId,
    sourceUrl: job.sourceUrl,
    applicationUrl: job.applicationUrl,
    applicationType: job.applicationType,
    publishedAt: job.publishedAt?.toISOString(),
    expiresAt: job.expiresAt?.toISOString(),
    attributionText: job.attributionText || undefined,
    isWalkIn: Boolean(job.isWalkIn),
    isUrgent: Boolean(job.isUrgent),
    isFeatured: Boolean(job.isFeatured),
    verifiedEmployer: Boolean(job.verifiedEmployer),
    walkIn: job.walkIn?.interviewDate
      ? {
          interviewDate: job.walkIn.interviewDate.toISOString(),
          startTime: job.walkIn.startTime || undefined,
          endTime: job.walkIn.endTime || undefined,
          contact: job.walkIn.contact || undefined,
          email: job.walkIn.email || undefined,
          address: job.walkIn.address || undefined,
          mapUrl: job.walkIn.mapUrl || undefined,
        }
      : undefined,
  };
}
