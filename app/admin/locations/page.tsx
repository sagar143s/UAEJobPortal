import { getHomeData } from "@/lib/jobs/queries";

export default async function AdminLocationsPage() {
  const home = await getHomeData();
  return (
    <section>
      <h1 className="font-serif text-4xl">Locations</h1>
      <p className="mt-2 text-sm text-muted">Counts are calculated from active jobs.</p>
      <ul className="mt-6 grid gap-2">
        {home.locations.map((location) => (
          <li key={location.slug} className="flex justify-between rounded-xl border border-line bg-card px-3 py-2 text-sm">
            <span>{location.name}</span>
            <span>{location.count.toLocaleString("en-AE")} jobs</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
