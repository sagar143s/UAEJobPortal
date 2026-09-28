import { getSiteUrl } from "@/lib/site";
import { schemaEmploymentType } from "@/lib/uae/classify";
import { emirateName } from "@/lib/uae/emirates";

export interface JobPostingInput {
  title: string;
  description: string;
  company: string;
  companyWebsite?: string | null;
  location: string;
  emirate: string;
  employmentType?: string | null;
  publishedAt?: Date | string | null;
  expiresAt?: Date | string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  salaryPeriod?: string | null;
  applicationUrl: string;
  applicationType: "external" | "internal";
  sourceName: string;
  sourceJobId: string;
  slug: string;
}

export function buildJobPosting(job: JobPostingInput) {
  if (!job.description.trim() || !job.publishedAt) return null;
  const datePosted = new Date(job.publishedAt);
  if (Number.isNaN(datePosted.getTime())) return null;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: datePosted.toISOString(),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
      ...(job.companyWebsite ? { sameAs: job.companyWebsite } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "AE",
        ...(job.emirate !== "uae" ? { addressLocality: emirateName(job.emirate) } : {}),
        ...(job.location ? { streetAddress: job.location } : {}),
      },
    },
    url: `${getSiteUrl()}/jobs/${job.slug}`,
    directApply: job.applicationType === "internal",
    identifier: {
      "@type": "PropertyValue",
      name: job.sourceName,
      value: job.sourceJobId,
    },
  };

  if (job.expiresAt) {
    const expires = new Date(job.expiresAt);
    if (!Number.isNaN(expires.getTime())) data.validThrough = expires.toISOString();
  }
  const employmentType = schemaEmploymentType(job.employmentType);
  if (employmentType) data.employmentType = employmentType;
  if (job.applicationType === "external") data.applicationContact = undefined;

  const period = job.salaryPeriod;
  if (
    job.currency &&
    period &&
    (job.salaryMin || job.salaryMax) &&
    ["HOUR", "DAY", "WEEK", "MONTH", "YEAR"].includes(period)
  ) {
    data.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.currency,
      value: {
        "@type": "QuantitativeValue",
        ...(job.salaryMin ? { minValue: job.salaryMin } : {}),
        ...(job.salaryMax ? { maxValue: job.salaryMax } : {}),
        unitText: period,
      },
    };
  }

  return data;
}
