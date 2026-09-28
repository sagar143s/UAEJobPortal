import { z } from "zod";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "@/lib/uae/classify";
import { EMIRATES } from "@/lib/uae/emirates";

const emirateSlugs = [...EMIRATES.map((emirate) => emirate.slug), "uae"] as const;

export const jobFilterSchema = z.object({
  q: z.string().trim().max(120).optional().catch(undefined),
  location: z.enum(emirateSlugs).optional().catch(undefined),
  category: z.string().trim().max(80).optional().catch(undefined),
  type: z.enum(EMPLOYMENT_TYPES).optional().catch(undefined),
  experience: z.enum(EXPERIENCE_LEVELS).optional().catch(undefined),
  salary: z.enum(["0-3000", "3000-5000", "5000-8000", "8000-12000", "12000-20000", "20000+"]).optional().catch(undefined),
  posted: z.enum(["1", "3", "7", "14", "30"]).optional().catch(undefined),
  walkin: z.literal("1").optional().catch(undefined),
  urgent: z.literal("1").optional().catch(undefined),
  verified: z.literal("1").optional().catch(undefined),
  featured: z.literal("1").optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(1000).optional().catch(1),
});

export type JobFilters = z.infer<typeof jobFilterSchema>;

export function parseFilters(input: Record<string, string | string[] | undefined>): JobFilters {
  const flat = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  return jobFilterSchema.parse(flat);
}

export const credentialsSchema = z.object({
  email: z.email().max(160),
  password: z.string().min(8).max(200),
  name: z.string().trim().min(2).max(80).optional(),
  role: z.enum(["candidate", "employer"]).optional(),
});

export const sourceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  provider: z.string().trim().min(2).max(40),
  type: z.enum(["API", "JSON", "XML", "RSS", "ATS", "MANUAL"]),
  apiUrl: z.string().trim().url().optional().or(z.literal("")),
  feedUrl: z.string().trim().url().optional().or(z.literal("")),
  apiKey: z.string().trim().max(400).optional().or(z.literal("")),
  apiKeyEnv: z.string().trim().max(80).optional().or(z.literal("")),
  appIdEnv: z.string().trim().max(80).optional().or(z.literal("")),
  enabled: z.boolean().optional(),
  locationFilter: z.array(z.string()).optional(),
  syncInterval: z.coerce.number().int().min(5).max(10080).optional(),
  syncMode: z.enum(["snapshot", "incremental"]).optional(),
  attributionText: z.string().trim().max(240).optional().or(z.literal("")),
  termsUrl: z.string().trim().url().optional().or(z.literal("")),
  config: z.string().trim().max(20000).optional().or(z.literal("")),
});

export const employerJobSchema = z.object({
  title: z.string().trim().min(3).max(140),
  company: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(160),
  description: z.string().trim().min(30).max(20000),
  requirements: z.string().trim().max(10000).optional().or(z.literal("")),
  benefits: z.string().trim().max(10000).optional().or(z.literal("")),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  experience: z.enum(EXPERIENCE_LEVELS).optional(),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  salaryMin: z.coerce.number().positive().optional().or(z.literal("")),
  salaryMax: z.coerce.number().positive().optional().or(z.literal("")),
  currency: z.literal("AED").optional(),
  salaryPeriod: z.enum(["HOUR", "DAY", "WEEK", "MONTH", "YEAR"]).optional(),
  applicationUrl: z.string().trim().url().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
});

export const applicationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
});

export const alertSchema = z.object({
  keyword: z.string().trim().max(120).optional().or(z.literal("")),
  emirate: z.enum(emirateSlugs).optional().or(z.literal("")),
  categorySlug: z.string().trim().max(80).optional().or(z.literal("")),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional().or(z.literal("")),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  emirate: z.enum(emirateSlugs).optional().or(z.literal("")),
  headline: z.string().trim().max(140).optional().or(z.literal("")),
  skills: z.string().trim().max(400).optional().or(z.literal("")),
  about: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const settingsSchema = z.object({
  siteName: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(2).max(160),
  jobsPerPage: z.coerce.number().int().min(5).max(50),
  expireUnseenAfterDays: z.coerce.number().int().min(1).max(180),
  requireJobApproval: z.boolean().optional(),
});
