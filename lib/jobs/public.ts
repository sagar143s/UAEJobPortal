import type { PublicJob } from "@/lib/jobs/queries";

type LeanJob = {
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
  publishedAt?: Date | string | null;
  expiresAt?: Date | string | null;
  attributionText?: string | null;
  isWalkIn?: boolean | null;
  isUrgent?: boolean | null;
  isFeatured?: boolean | null;
  verifiedEmployer?: boolean | null;
  walkIn?: {
    interviewDate?: Date | string | null;
    startTime?: string | null;
    endTime?: string | null;
    contact?: string | null;
    email?: string | null;
    address?: string | null;
    mapUrl?: string | null;
  } | null;
};

export function toPublic(job: LeanJob): PublicJob {
  const published = job.publishedAt ? new Date(job.publishedAt) : undefined;
  const expires = job.expiresAt ? new Date(job.expiresAt) : undefined;
  const interview = job.walkIn?.interviewDate ? new Date(job.walkIn.interviewDate) : undefined;
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
    publishedAt: published && !Number.isNaN(published.getTime()) ? published.toISOString() : undefined,
    expiresAt: expires && !Number.isNaN(expires.getTime()) ? expires.toISOString() : undefined,
    attributionText: job.attributionText || undefined,
    isWalkIn: Boolean(job.isWalkIn),
    isUrgent: Boolean(job.isUrgent),
    isFeatured: Boolean(job.isFeatured),
    verifiedEmployer: Boolean(job.verifiedEmployer),
    walkIn: interview && !Number.isNaN(interview.getTime())
      ? {
          interviewDate: interview.toISOString(),
          startTime: job.walkIn?.startTime || undefined,
          endTime: job.walkIn?.endTime || undefined,
          contact: job.walkIn?.contact || undefined,
          email: job.walkIn?.email || undefined,
          address: job.walkIn?.address || undefined,
          mapUrl: job.walkIn?.mapUrl || undefined,
        }
      : undefined,
  };
}
