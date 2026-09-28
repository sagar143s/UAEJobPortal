import { Filters } from "@/components/jobs/filters";
import { JobCard } from "@/components/jobs/job-card";
import { Results } from "@/components/jobs/results";
import { searchJobs, type PublicJob } from "@/lib/jobs/queries";
import type { JobFilters } from "@/lib/validators";
import type { QueryFilter } from "mongoose";
import type { JobRecord } from "@/lib/models/Job";

export async function JobsBrowser({
  title,
  intro,
  filters,
  pathname,
  extra,
  saved,
}: {
  title: string;
  intro?: string;
  filters: JobFilters;
  pathname: string;
  extra?: QueryFilter<JobRecord>;
  saved?: string[];
}) {
  const result = await searchJobs(filters, { extra });
  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
      <div className="lg:col-start-2">
        <header className="mb-4 bg-white px-5 py-5">
          <h1 className="text-2xl font-bold text-heading sm:text-3xl">{title}</h1>
          {intro && <p className="mt-2 max-w-2xl text-sm text-muted">{intro}</p>}
        </header>
        <Results result={result} filters={filters} pathname={pathname} saved={saved} />
      </div>
      <aside className="lg:col-start-1 lg:row-start-1">
        <details className="border border-line bg-white lg:hidden">
          <summary className="cursor-pointer px-4 py-3 font-semibold text-heading">Filter jobs</summary>
          <Filters filters={filters} action={pathname} idSuffix="-mobile" />
        </details>
        <div className="hidden lg:block">
          <Filters filters={filters} action={pathname} />
        </div>
      </aside>
    </section>
  );
}

export function JobSection({ title, href, jobs, empty }: { title: string; href: string; jobs: PublicJob[]; empty: string }) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-4 bg-primary px-4 py-2.5 text-white">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <a className="text-sm text-white/90 hover:underline" href={href}>View all</a>
      </div>
      {jobs.length === 0 ? <p className="border border-dashed border-line bg-white px-5 py-8 text-sm text-muted">{empty}</p> : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <JobCard key={job.slug} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
