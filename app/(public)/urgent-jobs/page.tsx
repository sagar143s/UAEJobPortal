import type { Metadata } from "next";
import { JobsBrowser } from "@/components/jobs/browser";
import { parseFilters } from "@/lib/validators";

export const metadata: Metadata = { title: "Urgent jobs in the UAE", alternates: { canonical: "/urgent-jobs" } };

export default async function UrgentJobsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseFilters({ ...(await searchParams), urgent: "1" });
  return (
    <JobsBrowser
      title="Urgent jobs"
      intro="Urgent is set only when the source says so, or when an admin marks a real listing."
      filters={filters}
      pathname="/urgent-jobs"
      extra={{ isUrgent: true }}
    />
  );
}
