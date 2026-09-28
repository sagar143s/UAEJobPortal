import Link from "next/link";
import { redirect } from "next/navigation";
import { closeJobAction } from "@/app/actions/employer";
import { requireUser } from "@/lib/auth";
import { Job } from "@/lib/models";

export default async function EmployerJobsPage() {
  const session = await requireUser("employer");
  const jobs = await Job.find({ employerId: session.user.id }).sort({ createdAt: -1 }).lean();
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Your jobs</h1>
        <Link className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground" href="/employers/jobs/new">Post a job</Link>
      </div>
      <ul className="mt-6 grid gap-3">
        {jobs.length === 0 ? <li className="text-muted">You have not posted a job yet.</li> : jobs.map((job) => (
          <li key={String(job._id)} className="rounded-2xl border border-line bg-card px-4 py-4">
            <Link href={`/jobs/${job.slug}`} className="font-medium">{job.title}</Link>
            <p className="text-sm text-muted">{job.status} · {job.location}</p>
            <form action={closeJobAction} className="mt-2">
              <input type="hidden" name="id" value={String(job._id)} />
              <button className="text-sm text-primary" type="submit">{job.status === "CLOSED" ? "Reopen" : "Close"}</button>
            </form>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm"><Link href="/employers/applications">Applications</Link></p>
    </section>
  );
}
