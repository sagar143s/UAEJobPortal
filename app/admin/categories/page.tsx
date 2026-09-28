import { getHomeData } from "@/lib/jobs/queries";
import { CATEGORIES } from "@/lib/uae/categories";

export default async function AdminCategoriesPage() {
  const home = await getHomeData();
  const counts = new Map(home.categories.map((category) => [category.slug, category.count]));
  return (
    <section>
      <h1 className="font-serif text-4xl">Categories</h1>
      <p className="mt-2 text-sm text-muted">Categories are assigned from source data during import.</p>
      <ul className="mt-6 grid gap-2 text-sm">
        {CATEGORIES.map((category) => (
          <li key={category.slug} className="flex justify-between rounded-xl border border-line bg-card px-3 py-2">
            <span>{category.name}</span>
            <span>{(counts.get(category.slug) || 0).toLocaleString("en-AE")} jobs</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
