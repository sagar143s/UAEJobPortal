import type { Metadata } from "next";
import Link from "next/link";
import { getHomeData } from "@/lib/jobs/queries";

export const metadata: Metadata = { title: "Job categories", alternates: { canonical: "/categories" } };

export default async function CategoriesPage() {
  const home = await getHomeData();
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl">Categories</h1>
      <p className="mt-3 max-w-2xl text-muted">Counts come from active jobs in the database.</p>
      {home.categories.length === 0 ? (
        <p className="mt-8 text-muted">No categories yet. They appear when real jobs are imported.</p>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {home.categories.map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}`} className="flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-4">
              <span>{category.name}</span>
              <span className="text-sm text-muted">{category.count.toLocaleString("en-AE")} jobs</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
