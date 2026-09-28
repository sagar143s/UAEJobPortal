import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobCard } from "@/components/jobs/job-card";
import { getCompany } from "@/lib/jobs/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const company = await getCompany((await params).slug);
  if (!company) return { title: "Company" };
  return { title: `${company.name} jobs`, alternates: { canonical: `/companies/${company.slug}` } };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const company = await getCompany((await params).slug);
  if (!company) notFound();
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl">{company.name}</h1>
      {company.verified && <p className="mt-2 text-sm text-primary">Verified employer</p>}
      {company.description && <p className="mt-4 whitespace-pre-wrap text-muted">{company.description}</p>}
      {company.website && <a className="mt-3 inline-block text-primary" href={company.website}>Company website</a>}
      <div className="mt-8 grid gap-4">
        {company.jobs.length === 0 ? <p className="text-muted">No active jobs from this company.</p> : company.jobs.map((job) => <JobCard key={job.slug} job={job} />)}
      </div>
    </section>
  );
}
