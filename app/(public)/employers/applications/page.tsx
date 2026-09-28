import { requireUser } from "@/lib/auth";
import { Application } from "@/lib/models";

export default async function ApplicationsPage() {
  const session = await requireUser("employer");
  const applications = await Application.find({ employerId: session.user.id }).sort({ createdAt: -1 }).lean();
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl">Applications</h1>
      <ul className="mt-6 grid gap-3">
        {applications.length === 0 ? <li className="text-muted">No applications yet.</li> : applications.map((application) => (
          <li key={String(application._id)} className="rounded-2xl border border-line bg-card px-4 py-4 text-sm">
            <p className="font-medium">{application.name} · {application.jobTitle}</p>
            <p className="text-muted">{application.email}{application.phone ? ` · ${application.phone}` : ""}</p>
            {application.message && <p className="mt-2 whitespace-pre-wrap">{application.message}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
