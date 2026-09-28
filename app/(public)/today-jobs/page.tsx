import type { Metadata } from "next";
import { JobsBrowser } from "@/components/jobs/browser";
import { parseFilters } from "@/lib/validators";

export const metadata: Metadata = { title: "Jobs posted today", alternates: { canonical: "/today-jobs" } };

export default async function TodayJobsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseFilters(await searchParams);
  return (
    <JobsBrowser
      title="Today's jobs"
      intro="Jobs whose source published them in the last 24 hours."
      filters={filters}
      pathname="/today-jobs"
      extra={{ publishedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }}
    />
  );
}
