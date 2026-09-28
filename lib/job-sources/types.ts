import type { EmploymentType, ExperienceLevel, SalaryPeriod } from "@/lib/uae/classify";
import type { WalkInDetails } from "@/lib/uae/walk-in";

export type ApplicationType = "external" | "internal";
export type JobStatus = "ACTIVE" | "EXPIRED" | "PENDING" | "CLOSED";
export type SourceType = "API" | "JSON" | "XML" | "RSS" | "ATS" | "MANUAL";
export type SyncMode = "snapshot" | "incremental";

export interface NormalizedJob {
  title: string;
  company: string;
  location: string;
  emirate: string;
  description: string;
  requirements?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryText?: string;
  currency?: string;
  salaryPeriod?: SalaryPeriod;
  employmentType?: EmploymentType;
  experience?: ExperienceLevel;
  experienceText?: string;
  category?: string;
  categorySlug?: string;
  skills: string[];
  source: string;
  sourceName: string;
  sourceType: SourceType;
  sourceJobId: string;
  sourceUrl: string;
  applicationUrl: string;
  applicationType: ApplicationType;
  publishedAt?: Date;
  expiresAt?: Date;
  attributionText?: string;
  isWalkIn: boolean;
  isUrgent: boolean;
  walkIn?: WalkInDetails;
  closed: boolean;
}

export interface SourceConfig {
  id: string;
  name: string;
  slug: string;
  type: SourceType;
  provider: string;
  apiUrl?: string;
  feedUrl?: string;
  country: string;
  locationFilter: string[];
  attributionText?: string;
  termsUrl?: string;
  syncMode: SyncMode;
  config: Record<string, unknown>;
}

export interface AdapterSecrets {
  apiKey?: string;
  appId?: string;
}

export interface AdapterContext {
  source: SourceConfig;
  secrets: AdapterSecrets;
}

export interface JobSourceAdapter {
  fetchJobs(): Promise<unknown[]>;
  normalizeJob(job: unknown): NormalizedJob | null;
}

export type AdapterFactory = (context: AdapterContext) => JobSourceAdapter;

export interface SyncCounts {
  fetchedCount: number;
  uaeCount: number;
  importedCount: number;
  updatedCount: number;
  duplicateCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
}

export type DuplicateDecision = "create" | "update" | "duplicate";

export function decideDuplicate(input: {
  existingByExternalId: boolean;
  identicalContent: boolean;
  existingByFingerprint: boolean;
}): DuplicateDecision {
  if (input.existingByExternalId) {
    return input.identicalContent ? "duplicate" : "update";
  }
  if (input.existingByFingerprint) return "duplicate";
  return "create";
}
