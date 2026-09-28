import Link from "next/link";
import { moderateJobAction } from "@/app/actions/admin";
import { connectDB } from "@/lib/db";
import { Job } from "@/lib/models";

export default async function AdminJobsPage() {
  const db = await connectDB();
  const jobs = db ? await Job.find().sort({ createdAt: -1 }).limit(100).lean() : [];
  return (
    <section>
      <h1 className="font-serif text-4xl">Jobs</h1>
      <p className="mt-2 text-sm text-muted">Imported and directly posted jobs. Nothing here is sample data.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr><th className="py-2">Title</th><th>Status</th><th>Source</th><th></th></tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? <tr><td className="py-4 text-muted" colSpan={4}>No jobs yet.</td></tr> : jobs.map((job) => (
              <tr key={String(job._id)} className="border-t border-line">
                <td className="py-3"><Link href={`/jobs/${job.slug}`}>{job.title}</Link><div className="text-xs text-muted">{job.company}</div></td>
                <td>{job.status}</td>
                <td>{job.sourceName}</td>
                <td className="space-x-2">
                  <Action id={String(job._id)} action="feature" label={job.isFeatured ? "Unfeature" : "Feature"} />
                  <Action id={String(job._id)} action="urgent" label={job.isUrgent ? "Clear urgent" : "Mark urgent"} />
                  <Action id={String(job._id)} action={job.status === "ACTIVE" ? "expire" : "activate"} label={job.status === "ACTIVE" ? "Expire" : "Activate"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Action({ id, action, label }: { id: string; action: string; label: string }) {
  return (
    <form action={moderateJobAction} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="action" value={action} />
      <button className="text-primary" type="submit">{label}</button>
    </form>
  );
}
