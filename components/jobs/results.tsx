import Link from "next/link";
import { JobCard } from "@/components/jobs/job-card";
import { EmptyState } from "@/components/ui";
import type { SearchResult } from "@/lib/jobs/queries";
import type { JobFilters } from "@/lib/validators";

export function Results({
  result,
  filters,
  pathname,
  saved,
}: {
  result: SearchResult;
  filters: JobFilters;
  pathname: string;
  saved?: string[];
}) {
  if (result.unavailable) {
    return (
      <EmptyState
        title="Job listings are temporarily unavailable."
        body="Connect MongoDB with MONGODB_URI, then refresh. No sample jobs are shown in the meantime."
      />
    );
  }
  if (result.jobs.length === 0) {
    const filtered = Object.entries(filters).some(([key, value]) => key !== "page" && value);
    return (
      <EmptyState
        title={filtered ? "No jobs match these filters." : "No jobs found."}
        body={
          filtered
            ? "Try a broader keyword or clear a filter. Only imported and directly posted jobs are searched."
            : "We're connecting new UAE job sources. Please check again soon."
        }
      />
    );
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{result.total.toLocaleString("en-AE")} jobs</p>
      {result.jobs.map((job) => (
        <JobCard key={job.slug} job={job} saved={saved?.includes(job.slug)} />
      ))}
      <Pagination page={result.page} pages={result.pages} filters={filters} pathname={pathname} />
    </div>
  );
}

export function Pagination({
  page,
  pages,
  filters,
  pathname,
}: {
  page: number;
  pages: number;
  filters: JobFilters;
  pathname: string;
}) {
  if (pages <= 1) return null;
  const href = (next: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (!value || key === "page") continue;
      params.set(key, String(value));
    }
    if (next > 1) params.set("page", String(next));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };
  return (
    <nav className="flex items-center justify-between pt-2 text-sm" aria-label="Pagination">
      {page > 1 ? <Link className="rounded-full border border-line px-4 py-2" href={href(page - 1)}>Previous</Link> : <span />}
      <span className="text-muted">Page {page} of {pages}</span>
      {page < pages ? <Link className="rounded-full border border-line px-4 py-2" href={href(page + 1)}>Next</Link> : <span />}
    </nav>
  );
}
