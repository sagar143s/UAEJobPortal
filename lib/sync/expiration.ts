import type { JobStatus } from "@/lib/job-sources/types";

export function shouldExpire(
  job: {
    status: JobStatus;
    expiresAt?: Date | null;
    lastSeenAt?: Date | null;
    sourceType?: string | null;
  },
  now: Date,
  unseenDays: number,
): boolean {
  if (job.status !== "ACTIVE") return false;
  if (job.expiresAt && job.expiresAt.getTime() <= now.getTime()) return true;
  if (job.sourceType === "MANUAL") return false;
  if (!job.lastSeenAt) return false;
  const cutoff = now.getTime() - unseenDays * 24 * 60 * 60 * 1000;
  return job.lastSeenAt.getTime() < cutoff;
}
