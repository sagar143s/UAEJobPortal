import Link from "next/link";
import { saveJobAction } from "@/app/actions/candidate";
import { Badge } from "@/components/ui";
import { formatSalary, locationLabel, metaLine, postedLabel } from "@/lib/format";
import type { PublicJob } from "@/lib/jobs/queries";
import { isSameDubaiDay } from "@/lib/time";

export function JobCard({ job, saved = false }: { job: PublicJob; saved?: boolean }) {
  const salary = formatSalary(job);
  const posted = postedLabel(job.publishedAt);
  const meta = metaLine(job);
  const interviewToday = job.walkIn?.interviewDate ? isSameDubaiDay(new Date(job.walkIn.interviewDate), new Date()) : false;

  return (
    <article className="border border-line bg-white p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            {interviewToday && <Badge tone="today">TODAY</Badge>}
            {job.isUrgent && <Badge tone="urgent">Urgent hiring</Badge>}
            {job.isFeatured && <Badge>Featured</Badge>}
            {job.verifiedEmployer && <Badge>Verified employer</Badge>}
          </div>
          <h2 className="text-lg font-semibold leading-snug text-heading">
            <Link href={`/jobs/${job.slug}`} className="hover:underline">{job.title}</Link>
          </h2>
          <p className="mt-1 text-sm">
            <span className="font-medium">{job.company}</span>
            <span className="text-muted"> · {locationLabel(job.location, job.emirate)}</span>
          </p>
          {job.description && <p className="mt-2 line-clamp-2 text-sm text-muted">{job.description.replace(/^(?:\.\.\.|…|\s)+/, "")}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {salary && <span className="font-medium">{salary}</span>}
            {meta.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            {posted || "Posted date not provided by the source"} · Source: {job.sourceName}
          </p>
          {job.attributionText && <p className="mt-1 text-xs text-muted">{job.attributionText}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <form action={saveJobAction}>
            <input type="hidden" name="slug" value={job.slug} />
            <button className="border border-line px-3 py-2 text-xs hover:border-primary" type="submit">
              {saved ? "Saved" : "Save"}
            </button>
          </form>
          <Link href={`/jobs/${job.slug}`} className="bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-[#c96822]">
            View job
          </Link>
        </div>
      </div>
    </article>
  );
}
