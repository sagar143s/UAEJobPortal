import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Job, User } from "@/lib/models";
import { JobCard } from "@/components/jobs/job-card";
import { toPublic } from "@/lib/jobs/public";

export default async function SavedPage() {
  const session = await currentSession();
  if (!session?.user) redirect("/login?next=/saved");
  const db = await connectDB();
  const user = db ? await User.findById(session.user.id).lean() : null;
  const jobs = user?.savedJobIds?.length ? await Job.find({ _id: { $in: user.savedJobIds }, status: "ACTIVE" }).lean() : [];
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl">Saved jobs</h1>
      <div className="mt-6 grid gap-4">
        {jobs.length === 0 ? <p className="text-muted">You have not saved any active jobs.</p> : jobs.map((job) => <JobCard key={job.slug} job={toPublic(job)} saved />)}
      </div>
      <p className="mt-6 text-sm"><Link href="/jobs">Browse jobs</Link></p>
    </section>
  );
}
