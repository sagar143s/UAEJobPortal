import { categoryBySlug, CATEGORIES } from "@/lib/uae/categories";
import { slugify } from "@/lib/utils";

export const EMPLOYMENT_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "temporary",
  "internship",
  "freelance",
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const EXPERIENCE_LEVELS = ["fresher", "0-1", "1-3", "3-5", "5-10", "10+"] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const SALARY_PERIODS = ["HOUR", "DAY", "WEEK", "MONTH", "YEAR"] as const;

export type SalaryPeriod = (typeof SALARY_PERIODS)[number];

export function classifyEmployment(value?: string | null): EmploymentType | undefined {
  if (!value) return undefined;
  const text = value.toLowerCase();
  if (text.includes("intern")) return "internship";
  if (text.includes("part")) return "part-time";
  if (text.includes("freelance") || text.includes("contractor")) return "freelance";
  if (text.includes("temp")) return "temporary";
  if (text.includes("contract")) return "contract";
  if (text.includes("full") || text.includes("permanent")) return "full-time";
  return undefined;
}

export function employmentLabel(value?: string | null): string | undefined {
  switch (value) {
    case "full-time":
      return "Full Time";
    case "part-time":
      return "Part Time";
    case "contract":
      return "Contract";
    case "temporary":
      return "Temporary";
    case "internship":
      return "Internship";
    case "freelance":
      return "Freelance";
    default:
      return undefined;
  }
}

export function schemaEmploymentType(value?: string | null): string | undefined {
  switch (value) {
    case "full-time":
      return "FULL_TIME";
    case "part-time":
      return "PART_TIME";
    case "contract":
    case "freelance":
      return "CONTRACTOR";
    case "temporary":
      return "TEMPORARY";
    case "internship":
      return "INTERN";
    default:
      return undefined;
  }
}

export function classifyExperience(text?: string | null): ExperienceLevel | undefined {
  if (!text) return undefined;
  const value = text.toLowerCase();
  if (/\b(fresher|freshers|fresh graduate|no experience|entry[\s-]?level)\b/.test(value)) {
    return "fresher";
  }
  const range = value.match(/(\d+)\s*(?:-|–|to|and)\s*(\d+)\s*\+?\s*(?:years|yrs|year|yr)/);
  if (range) return bucketExperience(Number(range[1]), Number(range[2]));
  const plus = value.match(/(\d+)\s*\+\s*(?:years|yrs|year|yr)/);
  if (plus) return bucketExperience(Number(plus[1]), 30);
  const single = value.match(/(\d+)\s*(?:years|yrs|year|yr)/);
  if (single) {
    const years = Number(single[1]);
    return bucketExperience(years, years);
  }
  return undefined;
}

export function experienceLabel(value?: string | null): string | undefined {
  switch (value) {
    case "fresher":
      return "Fresher";
    case "0-1":
      return "0-1 Years";
    case "1-3":
      return "1-3 Years";
    case "3-5":
      return "3-5 Years";
    case "5-10":
      return "5-10 Years";
    case "10+":
      return "10+ Years";
    default:
      return undefined;
  }
}

function bucketExperience(min: number, max: number): ExperienceLevel {
  if (max <= 1) return "0-1";
  if (max <= 3) return "1-3";
  if (max <= 5) return "3-5";
  if (max <= 10) return "5-10";
  return "10+";
}

export function classifyCategory(explicit?: string | null, text?: string) {
  if (explicit?.trim()) {
    const known = CATEGORIES.find(
      (category) =>
        category.slug === slugify(explicit) ||
        category.name.toLowerCase() === explicit.trim().toLowerCase() ||
        category.keywords.some((keyword) => explicit.toLowerCase().includes(keyword.trim())),
    );
    if (known) return { name: known.name, slug: known.slug };
    const slug = slugify(explicit);
    if (slug) return { name: explicit.trim(), slug };
  }
  const haystack = (text ?? "").toLowerCase();
  for (const category of CATEGORIES) {
    if (category.keywords.some((keyword) => haystack.includes(keyword.trim()))) {
      return { name: category.name, slug: category.slug };
    }
  }
  return undefined;
}

export function categoryName(slug?: string | null, fallback?: string | null) {
  return categoryBySlug(slug)?.name ?? fallback ?? slug ?? "Jobs";
}

export function classifyCurrency(value?: string | null): string | undefined {
  if (!value) return undefined;
  const text = value.toLowerCase();
  if (/\b(aed|dhs|dh|dirhams?)\b/.test(text)) return "AED";
  if (/\b(usd|us\$)\b/.test(text)) return "USD";
  if (/\b(eur|€)\b/.test(text)) return "EUR";
  if (/\b(gbp|£)\b/.test(text)) return "GBP";
  if (/\b(inr|₹)\b/.test(text)) return "INR";
  const iso = value.trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(iso)) return iso;
  return undefined;
}

export function classifySalaryPeriod(value?: string | null): SalaryPeriod | undefined {
  if (!value) return undefined;
  const text = value.toLowerCase();
  if (text.includes("hour")) return "HOUR";
  if (text.includes("day") || text.includes("daily")) return "DAY";
  if (text.includes("week")) return "WEEK";
  if (text.includes("month")) return "MONTH";
  if (text.includes("year") || text.includes("annual") || text.includes("annum")) return "YEAR";
  const upper = value.trim().toUpperCase();
  if (SALARY_PERIODS.includes(upper as SalaryPeriod)) return upper as SalaryPeriod;
  return undefined;
}
