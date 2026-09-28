import { adminOverview } from "@/lib/jobs/queries";
import { formatWhen } from "@/lib/format";

export default async function AdminHomePage() {
  const stats = await adminOverview();
  const cards = [
    ["Active jobs", stats.active],
    ["Jobs today", stats.today],
    ["Walk-in interviews", stats.walkIns],
    ["Sources", stats.sources],
    ["Failed syncs (7 days)", stats.failed],
  ];
  return (
    <section>
      <h1 className="font-serif text-4xl">Dashboard</h1>
      {stats.unavailable && <p className="mt-3 text-sm text-danger">MongoDB is not connected.</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-card px-4 py-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 font-serif text-3xl">{Number(value).toLocaleString("en-AE")}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">Last sync: {formatWhen(stats.lastSync) || "No sync yet"}</p>
    </section>
  );
}
