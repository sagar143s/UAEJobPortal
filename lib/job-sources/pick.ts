import { asArray, asRecord, cleanText, positiveNumber } from "@/lib/utils";

export interface PickedJob {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryText?: string;
  currency?: string;
  salaryPeriod?: string;
  employmentType?: string;
  experienceText?: string;
  category?: string;
  skills?: string[];
  sourceJobId?: string;
  sourceUrl?: string;
  applicationUrl?: string;
  publishedAt?: unknown;
  expiresAt?: unknown;
  closed?: boolean;
}

export function pickJob(record: unknown, mapping?: Record<string, string>): PickedJob | null {
  const item = asRecord(record);
  if (!item) return null;
  const read = (key: string) => pickPath(item, mapping?.[key]) ?? pickAlias(item, key);

  const companyValue = read("company");
  const locationValue = read("location");
  const link = firstString(read("applicationUrl"), read("url"), read("link"));
  const skillsValue = read("skills");

  return {
    title: firstString(read("title")),
    company: companyName(companyValue),
    location: locationName(locationValue),
    description: firstString(read("description"), read("content")),
    requirements: firstString(read("requirements")),
    benefits: firstString(read("benefits")),
    salaryMin: positiveNumber(nestedNumber(read("salaryMin"))),
    salaryMax: positiveNumber(nestedNumber(read("salaryMax"))),
    salaryText: salaryText(read("salary")),
    currency: firstString(read("currency")),
    salaryPeriod: firstString(read("salaryPeriod")),
    employmentType: firstString(read("employmentType")),
    experienceText: firstString(read("experience")),
    category: firstString(read("category")) || categoryName(read("category")),
    skills: skills(skillsValue),
    sourceJobId: firstString(read("id"), read("guid")),
    sourceUrl: firstString(read("sourceUrl"), link),
    applicationUrl: link,
    publishedAt: read("publishedAt"),
    expiresAt: read("expiresAt"),
    closed: isClosed(read("status")),
  };
}

const ALIASES: Record<string, string[]> = {
  title: ["title", "name", "position", "jobTitle", "job_title", "text"],
  company: ["company", "company_name", "companyName", "employer", "hiring_organization", "organization", "author"],
  location: ["location", "city", "job_location", "jobLocation", "area", "candidate_required_location"],
  description: ["description", "content_text", "content_html", "content", "snippet", "details", "descriptionPlain"],
  requirements: ["requirements", "requirement"],
  benefits: ["benefits", "benefit"],
  salaryMin: ["salary_min", "salaryMin", "min_salary", "minimum_salary"],
  salaryMax: ["salary_max", "salaryMax", "max_salary", "maximum_salary"],
  salary: ["salary", "salary_text", "compensation"],
  currency: ["currency", "salary_currency"],
  salaryPeriod: ["salary_period", "salaryPeriod", "pay_period"],
  employmentType: ["employment_type", "employmentType", "job_type", "jobType", "type", "contract_time", "commitment"],
  experience: ["experience", "experience_level", "required_experience"],
  category: ["category", "department", "categories"],
  skills: ["skills", "tags", "skill"],
  id: ["id", "guid", "uuid", "job_id", "jobId", "sourceJobId"],
  url: ["url", "link", "apply_url", "applyUrl", "application_url", "applicationUrl", "hostedUrl"],
  applicationUrl: ["application_url", "applicationUrl", "apply_url", "applyUrl"],
  sourceUrl: ["source_url", "sourceUrl", "absolute_url", "redirect_url"],
  publishedAt: ["publishedAt", "published_at", "date", "created", "created_at", "createdAt", "date_published", "pubDate", "updated"],
  expiresAt: ["expiresAt", "expires_at", "validThrough", "closing_date"],
  status: ["status", "state"],
};

function pickAlias(item: Record<string, unknown>, key: string): unknown {
  for (const alias of ALIASES[key] ?? [key]) {
    if (alias in item && item[alias] != null && item[alias] !== "") return item[alias];
  }
  return undefined;
}

function pickPath(item: Record<string, unknown>, path?: string): unknown {
  if (!path) return undefined;
  let current: unknown = item;
  for (const part of path.split(".")) {
    const record = asRecord(current);
    if (!record) return undefined;
    current = record[part];
  }
  return current;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    const record = asRecord(value);
    if (record) {
      const nested = firstString(record["#text"], record.name, record.display_name, record.label, record.href, record.url);
      if (nested) return nested;
    }
  }
  return undefined;
}

function companyName(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  const record = asRecord(value);
  if (!record) return undefined;
  return firstString(record.display_name, record.name, record.title, record.company);
}

function locationName(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => locationName(item)).filter(Boolean).join(", ");
  const record = asRecord(value);
  if (!record) return undefined;
  return firstString(record.display_name, record.name, record.city, record.area) || locationName(record.area);
}

function categoryName(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  const record = asRecord(value);
  if (record) return firstString(record.label, record.name, record.tag);
  if (!Array.isArray(value) || value.length === 0) return undefined;
  return categoryName(value[0]);
}

function salaryText(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function nestedNumber(value: unknown): unknown {
  const record = asRecord(value);
  if (!record) return value;
  return record.min ?? record.minimum ?? record.value ?? value;
}

function skills(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === "string") return [item];
      const record = asRecord(item);
      const name = record ? firstString(record.name, record.label) : undefined;
      return name ? [name] : [];
    });
  }
  if (typeof value === "string") return value.split(/[,|/]/).map((item) => item.trim());
  return undefined;
}

function isClosed(value: unknown): boolean {
  const status = cleanText(value).toLowerCase();
  return ["closed", "expired", "filled", "inactive", "archived"].includes(status);
}
