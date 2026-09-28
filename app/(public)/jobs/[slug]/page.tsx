import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { applyAction, recordView } from "@/app/actions/candidate";
import { Badge, inputClass, labelClass } from "@/components/ui";
import { currentSession } from "@/lib/auth";
import { formatSalary, formatWhen, locationLabel, postedLabel } from "@/lib/format";
import { getJobBySlug } from "@/lib/jobs/queries";
import { buildJobPosting } from "@/lib/seo/job-posting";
import { employmentLabel, experienceLabel } from "@/lib/uae/classify";
import { emirateName } from "@/lib/uae/emirates";
import { isSameDubaiDay } from "@/lib/time";
import { Company } from "@/lib/models";
import { connectDB } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job not found" };
  const description = job.description.replace(/\s+/g, " ").slice(0, 160) || `${job.title} at ${job.company} in ${locationLabel(job.location, job.emirate)}`;
  const title = `${job.title} at ${job.company}`;
  return {
    title,
    description,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: { title, description, url: `/jobs/${job.slug}`, type: "article" },
  };
}

export default async function JobPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const job = await getJobBySlug(slug);
  if (!job) notFound();
  const session = await currentSession();
  if (session?.user) await recordView(job.slug, session.user.id);
  const salary = formatSalary(job);
  const website = await companyWebsite(job.companySlug);
  const jsonLd = buildJobPosting({ ...job, companyWebsite: website, publishedAt: job.publishedAt, expiresAt: job.expiresAt });
  const interviewToday = job.walkIn ? isSameDubaiDay(new Date(job.walkIn.interviewDate), new Date()) : false;

  return (
    <article className="mx-auto w-full max-w-3xl bg-white px-4 py-8 sm:px-8">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      )}
      <p className="text-sm text-muted">
        <Link href="/jobs">Jobs</Link> / {emirateName(job.emirate)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {interviewToday && <Badge tone="today">TODAY</Badge>}
        {job.isUrgent && <Badge tone="urgent">Urgent hiring</Badge>}
        {job.verifiedEmployer && <Badge>Verified employer</Badge>}
      </div>
      <h1 className="mt-3 text-3xl font-semibold text-heading">{job.title}</h1>
      <p className="mt-2 text-lg">
        <Link href={`/companies/${job.companySlug}`}>{job.company}</Link>
      </p>
      <p className="text-muted">{locationLabel(job.location, job.emirate)}</p>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        {salary && <Fact label="Salary" value={salary} />}
        {employmentLabel(job.employmentType) && <Fact label="Job type" value={employmentLabel(job.employmentType) || ""} />}
        {experienceLabel(job.experience) && <Fact label="Experience" value={experienceLabel(job.experience) || ""} />}
        {job.category && <Fact label="Category" value={job.category} />}
        <Fact label="Published" value={postedLabel(job.publishedAt) || "Date not provided by the source"} />
        <Fact label="Source" value={job.sourceName} />
      </dl>
      {job.attributionText && <p className="mt-4 text-sm text-muted">{job.attributionText}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        {job.applicationType === "external" ? (
          <a className="bg-accent px-5 py-3 text-sm font-semibold text-white" href={job.applicationUrl} target="_blank" rel="noopener noreferrer nofollow">
            Apply on original site
          </a>
        ) : (
          <a className="bg-accent px-5 py-3 text-sm font-semibold text-white" href="#apply">
            Apply now
          </a>
        )}
        <a className="border border-line px-5 py-3 text-sm" href={job.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">
          Original job link
        </a>
      </div>
      <p className="mt-3 text-sm text-muted">
        {job.applicationType === "external"
          ? `Applications are handled by ${job.sourceName}. UAEJobPortal does not receive this application.`
          : "This job was posted directly on UAEJobPortal. Your application is sent to the employer."}
      </p>
      <Section title="Description" body={job.description} />
      <Section title="Requirements" body={job.requirements} />
      <Section title="Benefits" body={job.benefits} />
      {job.skills.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-2xl">Skills</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {job.skills.map((skill) => <li key={skill}><Badge>{skill}</Badge></li>)}
          </ul>
        </section>
      )}
      {job.walkIn && (
        <section className="mt-8 rounded-2xl border border-line bg-[#f3fafa] p-5">
          <h2 className="font-serif text-2xl">Walk-in interview</h2>
          <p className="mt-2">{formatWhen(job.walkIn.interviewDate)}</p>
          {job.walkIn.startTime && <p>{job.walkIn.startTime}{job.walkIn.endTime ? ` – ${job.walkIn.endTime}` : ""}</p>}
          {job.walkIn.address && <p>{job.walkIn.address}</p>}
          {job.walkIn.contact && <p>Contact: {job.walkIn.contact}</p>}
          {job.walkIn.email && <p>Email: {job.walkIn.email}</p>}
          {job.walkIn.mapUrl && <a className="text-primary" href={job.walkIn.mapUrl}>Map</a>}
        </section>
      )}
      {job.applicationType === "internal" && (
        <section id="apply" className="mt-8 border border-line bg-[#fafafa] p-5">
          <h2 className="font-serif text-2xl">Apply Now</h2>
          {query.applied === "1" ? (
            <p className="mt-3">Your application was sent to the employer.</p>
          ) : (
            <form action={applyAction} className="mt-4 grid gap-3">
              <input type="hidden" name="slug" value={job.slug} />
              {query.error && <p className="text-sm text-danger">Check the form and try again.</p>}
              <label className={labelClass}>Name<input className={inputClass} name="name" required /></label>
              <label className={labelClass}>Email<input className={inputClass} name="email" type="email" required /></label>
              <label className={labelClass}>Phone<input className={inputClass} name="phone" /></label>
              <label className={labelClass}>Message<textarea className={`${inputClass} h-28 py-2`} name="message" /></label>
              <button className="h-11 bg-accent text-sm font-semibold text-white" type="submit">Submit application</button>
            </form>
          )}
        </section>
      )}
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-[#fafafa] px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}

function Section({ title, body }: { title: string; body?: string }) {
  if (!body) return null;
  return (
    <section className="mt-8">
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap leading-7 text-[#243246]">{body}</p>
    </section>
  );
}

async function companyWebsite(slug: string) {
  const db = await connectDB();
  if (!db) return undefined;
  const company = await Company.findOne({ slug }).select("website").lean();
  return company?.website || undefined;
}
