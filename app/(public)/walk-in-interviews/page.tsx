import type { Metadata } from "next";
import Link from "next/link";
import { JobsBrowser } from "@/components/jobs/browser";
import { walkInRange } from "@/lib/jobs/queries";
import { EMIRATES } from "@/lib/uae/emirates";
import { parseFilters } from "@/lib/validators";

export const metadata: Metadata = {
  title: "Walk-in interviews in the UAE",
  description: "Walk-in interviews published by authorized UAE job sources.",
  alternates: { canonical: "/walk-in-interviews" },
};

export default async function WalkInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters({ ...params, walkin: "1" });
  const when = typeof params.when === "string" ? params.when : undefined;
  return (
    <div>
      <div className="mx-auto flex w-full max-w-6xl flex-wrap gap-2 px-4 pt-8 text-sm">
        {[
          ["", "Upcoming"],
          ["today", "Today"],
          ["tomorrow", "Tomorrow"],
          ["week", "This week"],
        ].map(([value, label]) => (
          <Link key={label} href={value ? `/walk-in-interviews?when=${value}` : "/walk-in-interviews"} className="rounded-full border border-line bg-card px-3 py-1.5">
            {label}
          </Link>
        ))}
        {EMIRATES.map((emirate) => (
          <Link key={emirate.slug} href={`/walk-in-interviews?location=${emirate.slug}${when ? `&when=${when}` : ""}`} className="rounded-full border border-line px-3 py-1.5">
            {emirate.short}
          </Link>
        ))}
      </div>
      <JobsBrowser
        title="Walk-in interviews"
        intro="Only interviews with a real date from the source are listed. Nothing is invented."
        filters={filters}
        pathname="/walk-in-interviews"
        extra={{ isWalkIn: true, "walkIn.interviewDate": walkInRange(when) }}
      />
    </div>
  );
}
