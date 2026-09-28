import { formatDistanceToNowStrict } from "date-fns";
import { employmentLabel, experienceLabel } from "@/lib/uae/classify";
import { emirateName } from "@/lib/uae/emirates";

export function formatSalary(job: {
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryText?: string | null;
  currency?: string | null;
}): string | null {
  const currency = job.currency || "";
  const format = (value: number) =>
    `${currency ? `${currency} ` : ""}${new Intl.NumberFormat("en-AE").format(value)}`.trim();
  if (job.salaryMin && job.salaryMax && job.salaryMin !== job.salaryMax) {
    return `${format(job.salaryMin)} – ${format(job.salaryMax)}`;
  }
  if (job.salaryMin) return `From ${format(job.salaryMin)}`;
  if (job.salaryMax) return `Up to ${format(job.salaryMax)}`;
  if (job.salaryText) return job.salaryText;
  return null;
}

export function postedLabel(value?: string | Date | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `Posted ${formatDistanceToNowStrict(date, { addSuffix: true })}`;
}

export function formatWhen(value?: string | Date | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dubai",
  }).format(date);
}

export function locationLabel(location?: string | null, emirate?: string | null): string {
  const region = emirateName(emirate);
  const place = location?.trim() || "";
  const countryOnly = !place || /^(uae|u\.a\.e\.?|united arab emirates)$/i.test(place);
  if (countryOnly) return region === "UAE" ? "UAE" : `${region}, UAE`;
  if (region !== "UAE" && !place.toLowerCase().includes(region.toLowerCase())) return `${region}, UAE`;
  return place;
}

export function metaLine(job: { employmentType?: string | null; experience?: string | null }) {
  return [employmentLabel(job.employmentType), experienceLabel(job.experience)].filter(Boolean);
}
