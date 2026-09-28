import Link from "next/link";
import { deleteSourceAction, toggleSourceAction } from "@/app/actions/admin";
import { SyncButton } from "@/components/admin/sync-button";
import { connectDB } from "@/lib/db";
import { Job, JobSource } from "@/lib/models";
import { formatWhen } from "@/lib/format";

export default async function JobSourcesPage() {
  const db = await connectDB();
  const sources = db ? await JobSource.find().sort({ name: 1 }).lean() : [];
  const counts = db ? await Job.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$source", count: { $sum: 1 } } }]) : [];
  const countMap = new Map(counts.map((row) => [row._id, row.count]));
  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Job sources</h1>
        <Link className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground" href="/admin/job-sources/new">Add source</Link>
      </div>
      <div className="mt-6 grid gap-4">
        {sources.length === 0 ? <p className="text-muted">No sources yet. Add an authorized API or feed to start importing.</p> : sources.map((source) => (
          <article key={String(source._id)} className="rounded-3xl border border-line bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl"><Link href={`/admin/job-sources/${source._id}`}>{source.name}</Link></h2>
                <p className="text-sm text-muted">Type: {source.type} · Status: {source.enabled ? source.status : "Disabled"}</p>
                <p className="text-sm text-muted">Last sync: {formatWhen(source.lastSyncAt) || "Never"}</p>
              </div>
              <SyncButton sourceId={String(source._id)} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              <Stat label="Jobs imported" value={countMap.get(source.slug) || 0} />
              <Stat label="New" value={source.lastSync?.importedCount || 0} />
              <Stat label="Updated" value={source.lastSync?.updatedCount || 0} />
              <Stat label="Failed" value={source.lastSync?.errorCount || 0} />
            </dl>
            <div className="mt-4 flex gap-4 text-sm">
              <form action={toggleSourceAction}>
                <input type="hidden" name="id" value={String(source._id)} />
                <button className="text-primary" type="submit">{source.enabled ? "Disable" : "Enable"}</button>
              </form>
              <Link href={`/admin/sync-logs?source=${source._id}`}>View logs</Link>
              <form action={deleteSourceAction}>
                <input type="hidden" name="id" value={String(source._id)} />
                <button className="text-danger" type="submit">Delete</button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-medium">{value.toLocaleString("en-AE")}</dd>
    </div>
  );
}
