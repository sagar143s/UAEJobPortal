import Link from "next/link";
import { SearchForm } from "@/components/jobs/filters";
import { JobSection } from "@/components/jobs/browser";
import { getHomeData } from "@/lib/jobs/queries";

export default async function HomePage() {
  const home = await getHomeData();
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="bg-white px-5 py-6 sm:px-8">
        <h1 className="text-2xl font-bold text-heading sm:text-3xl">Jobs in the UAE</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Search Dubai, Abu Dhabi, Sharjah and the other emirates. A listing appears only after an authorized source is synced or an employer posts it here.
        </p>
        <div className="mt-5">
          <SearchForm />
        </div>
        <p className="mt-3 text-sm text-muted">
          {home.unavailable ? "Database not connected yet." : `${home.activeCount.toLocaleString("en-AE")} active jobs`}
        </p>
      </div>

      <JobSection
        title="Latest UAE Jobs"
        href="/jobs"
        jobs={home.latest}
        empty="No jobs available yet. Connect a job source or post the first job to start displaying listings."
      />
      {home.today.length > 0 && (
        <JobSection title="Today's New Jobs" href="/today-jobs" jobs={home.today} empty="" />
      )}
      {home.walkIns.length > 0 && (
        <JobSection title="Walk in Interviews" href="/walk-in-interviews" jobs={home.walkIns} empty="" />
      )}

      <section className="mt-8 bg-white px-5 py-6 sm:px-8">
        <h2 className="text-2xl font-bold text-heading">Jobs by city</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Link href="/jobs" className="flex items-center justify-between border border-line px-4 py-3 text-sm hover:border-primary">
            <span className="font-semibold text-heading">All UAE</span>
            <span className="text-muted">{home.activeCount.toLocaleString("en-AE")}</span>
          </Link>
          {home.locations.map((location) => (
            <Link
              key={location.slug}
              href={location.count > 0 ? `/jobs-in-${location.slug}` : `/jobs?location=${location.slug}`}
              className="flex items-center justify-between border border-line px-4 py-3 text-sm hover:border-primary"
            >
              <span className="font-semibold text-heading">Jobs in {location.name}</span>
              <span className="text-muted">{location.count.toLocaleString("en-AE")}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 bg-white px-5 py-6 sm:px-8">
        <h2 className="text-2xl font-bold text-heading">Job categories</h2>
        {home.categories.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Categories fill in from real imported jobs.</p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {home.categories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="flex items-center justify-between border border-line px-4 py-3 text-sm hover:border-primary">
                <span className="font-semibold text-heading">{category.name}</span>
                <span className="text-muted">{category.count.toLocaleString("en-AE")} jobs</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <aside className="mt-6 border-l-4 border-accent bg-[#fff6ee] px-5 py-4 text-sm leading-6 text-[#6b3d16]">
        Never pay anyone to get a job. Apply only through the employer or the original listing. If a post asks for money, skip it and use the contact on the About page to report it.
      </aside>
    </div>
  );
}
