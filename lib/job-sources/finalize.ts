import { classifyCategory, classifyCurrency, classifyEmployment, classifyExperience, classifySalaryPeriod } from "@/lib/uae/classify";
import { mapProviderLocation, passesLocationFilter, resolveEmirate } from "@/lib/uae/emirates";
import { extractWalkIn } from "@/lib/uae/walk-in";
import type { AdapterContext, NormalizedJob } from "@/lib/job-sources/types";
import { cleanText, htmlToText, isHttpUrl, parseDate, positiveNumber } from "@/lib/utils";

export interface RawJobInput {
  title?: unknown;
  company?: unknown;
  location?: unknown;
  description?: unknown;
  requirements?: unknown;
  benefits?: unknown;
  salaryMin?: unknown;
  salaryMax?: unknown;
  salaryText?: unknown;
  currency?: unknown;
  salaryPeriod?: unknown;
  employmentType?: unknown;
  experienceText?: unknown;
  category?: unknown;
  skills?: unknown;
  sourceJobId?: unknown;
  sourceUrl?: unknown;
  applicationUrl?: unknown;
  publishedAt?: unknown;
  expiresAt?: unknown;
  closed?: boolean;
  isUrgent?: boolean;
  predictedSalary?: boolean;
  walkIn?: Parameters<typeof extractWalkIn>[0]["structured"];
  applicationType?: "external" | "internal";
}

export function finalizeJob(input: RawJobInput, context: AdapterContext, now = new Date()): NormalizedJob | null {
  const title = cleanText(input.title);
  const company = cleanText(input.company);
  const sourceJobId = cleanText(input.sourceJobId);
  const applicationUrl = cleanText(input.applicationUrl) || cleanText(input.sourceUrl);
  const sourceUrl = cleanText(input.sourceUrl) || applicationUrl;
  if (!title || !company || !sourceJobId || !isHttpUrl(applicationUrl)) return null;

  const mapping = recordOfStrings(context.source.config.locationMapping);
  const location = mapProviderLocation(cleanText(input.location), mapping);
  const emirate = resolveEmirate(location, {
    assumeUae: context.source.config.assumeUae === true || context.source.config.assumeCountry === "AE",
    defaultEmirate: cleanText(context.source.config.defaultEmirate) || undefined,
  });
  if (!emirate) return null;
  if (!passesLocationFilter(emirate, context.source.locationFilter)) return null;

  const description = htmlToText(input.description);
  const requirements = htmlToText(input.requirements) || undefined;
  const benefits = htmlToText(input.benefits) || undefined;
  const category = classifyCategory(cleanText(input.category), `${title}\n${description}`);
  const experienceText = cleanText(input.experienceText) || undefined;
  const experience = classifyExperience(`${experienceText ?? ""}\n${title}\n${description.slice(0, 2000)}`);
  const walkIn = extractWalkIn(
    { title, description, structured: input.walkIn },
    now,
  );
  const skills = uniqueSkills(input.skills);
  const salary = input.predictedSalary
    ? {}
    : {
        salaryMin: positiveNumber(input.salaryMin),
        salaryMax: positiveNumber(input.salaryMax),
        salaryText: cleanText(input.salaryText) || undefined,
        currency: classifyCurrency(cleanText(input.currency) || cleanText(input.salaryText)),
        salaryPeriod: classifySalaryPeriod(cleanText(input.salaryPeriod) || cleanText(input.salaryText)),
      };

  if (salary.salaryMin && salary.salaryMax && salary.salaryMin > salary.salaryMax) {
    const swap = salary.salaryMin;
    salary.salaryMin = salary.salaryMax;
    salary.salaryMax = swap;
  }

  const locationLabel = location || (emirate === "uae" ? "UAE" : emirate);

  return {
    title,
    company,
    location: locationLabel,
    emirate,
    description,
    requirements,
    benefits,
    ...salary,
    employmentType: classifyEmployment(cleanText(input.employmentType)),
    experience,
    experienceText,
    category: category?.name,
    categorySlug: category?.slug,
    skills,
    source: context.source.slug,
    sourceName: context.source.name,
    sourceType: context.source.type,
    sourceJobId,
    sourceUrl,
    applicationUrl,
    applicationType: input.applicationType ?? "external",
    publishedAt: parseDate(input.publishedAt),
    expiresAt: parseDate(input.expiresAt),
    attributionText: context.source.attributionText,
    isWalkIn: Boolean(walkIn),
    isUrgent: Boolean(input.isUrgent) || /\burgent hiring\b/i.test(title),
    walkIn,
    closed: Boolean(input.closed),
  };
}

function uniqueSkills(value: unknown): string[] {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,|/]/)
      : [];
  const skills = list
    .map((item) => cleanText(item))
    .filter((item) => item.length > 1 && item.length < 40);
  return [...new Set(skills)].slice(0, 30);
}

function recordOfStrings(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entries = Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string");
  return Object.fromEntries(entries);
}
