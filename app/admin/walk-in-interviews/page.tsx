import Link from "next/link";
import { connectDB } from "@/lib/db";
import { formatWhen } from "@/lib/format";
import { Job } from "@/lib/models";
import { startOfDubaiDay } from "@/lib/time";

export default async function AdminWalkInsPage() {
  const db = await connectDB();
  const jobs = db ? await Job.find({ isWalkIn: true, "walkIn.interviewDate": { $gte: startOfDubaiDay() } }).sort({ "walkIn.interviewDate": 1 }).limit(100).lean() : [];
  return (
    <section>
      <h1 className="font-serif text-4xl">Walk-in interviews</h1>
      <ul className="mt-6 grid gap-3">
        {jobs.length === 0 ? <li className="text-muted">No upcoming walk-in interviews.</li> : jobs.map((job) => (
          <li key={String(job._id)} className="rounded-2xl border border-line bg-card px-4 py-3 text-sm">
            <Link href={`/jobs/${job.slug}`} className="font-medium">{job.title}</Link>
            <p className="text-muted">{job.company} · {formatWhen(job.walkIn?.interviewDate)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
