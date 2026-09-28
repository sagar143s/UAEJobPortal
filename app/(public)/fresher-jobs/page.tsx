import type { Metadata } from "next";
import { JobsBrowser } from "@/components/jobs/browser";
import { parseFilters } from "@/lib/validators";

export const metadata: Metadata = { title: "Fresher jobs in the UAE", alternates: { canonical: "/fresher-jobs" } };

export default async function FresherJobsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseFilters({ ...(await searchParams), experience: "fresher" });
  return (
    <JobsBrowser
      title="Fresher jobs"
      intro="Roles whose source text identifies them as fresher or entry level."
      filters={filters}
      pathname="/fresher-jobs"
      extra={{ experience: "fresher" }}
    />
  );
}
