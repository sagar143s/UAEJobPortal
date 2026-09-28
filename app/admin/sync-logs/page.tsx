import { connectDB } from "@/lib/db";
import { formatWhen } from "@/lib/format";
import { JobSyncLog } from "@/lib/models";

export default async function SyncLogsPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const source = (await searchParams).source;
  const db = await connectDB();
  const logs = db
    ? await JobSyncLog.find(source ? { sourceId: source } : {}).sort({ startedAt: -1 }).limit(50).lean()
    : [];
  return (
    <section>
      <h1 className="font-serif text-4xl">Sync logs</h1>
      <div className="mt-6 grid gap-3">
        {logs.length === 0 ? <p className="text-muted">No synchronizations yet.</p> : logs.map((log) => (
          <article key={String(log._id)} className="rounded-2xl border border-line bg-card p-4 text-sm">
            <p className="font-medium">{log.sourceName} · {log.status}</p>
            <p className="text-muted">{formatWhen(log.startedAt)}{log.completedAt ? ` – ${formatWhen(log.completedAt)}` : ""}</p>
            <p className="mt-2">Fetched {log.fetchedCount} · UAE {log.uaeCount} · New {log.importedCount} · Updated {log.updatedCount} · Duplicates {log.duplicateCount} · Skipped {log.skippedCount} · Failed {log.errorCount}</p>
            {log.errors?.map((error: string) => <p key={error} className="mt-1 text-danger">{error}</p>)}
          </article>
        ))}
      </div>
    </section>
  );
}
