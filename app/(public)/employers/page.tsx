import Link from "next/link";

export default function EmployersPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl">Employers</h1>
      <p className="mt-4 text-muted">
        Post a role directly on UAEJobPortal. Aggregated listings still come from authorized sources. Direct posts are separate and labeled as posted on UAEJobPortal.
      </p>
      <div className="mt-6 flex gap-3">
        <Link className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground" href="/employers/jobs/new">Post a job</Link>
        <Link className="rounded-xl border border-line px-4 py-2 text-sm" href="/employers/jobs">Manage jobs</Link>
      </div>
    </section>
  );
}
