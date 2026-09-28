import type { Metadata } from "next";
import Link from "next/link";
import { getHomeData } from "@/lib/jobs/queries";

export const metadata: Metadata = { title: "Jobs by UAE location", alternates: { canonical: "/locations" } };

export default async function LocationsPage() {
  const home = await getHomeData();
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl">Locations</h1>
      <p className="mt-3 text-muted">Job counts are calculated from the database.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {home.locations.map((location) => (
          <Link key={location.slug} href={location.count > 0 ? `/jobs-in-${location.slug}` : `/jobs?location=${location.slug}`} className="flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-4">
            <span>{location.name}</span>
            <span className="text-sm text-muted">{location.count.toLocaleString("en-AE")} jobs</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
