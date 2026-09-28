import { verifyCompanyAction } from "@/app/actions/admin";
import { connectDB } from "@/lib/db";
import { Company, Job } from "@/lib/models";

export default async function AdminCompaniesPage() {
  const db = await connectDB();
  const rows = db ? await Job.aggregate<{ _id: string; name: string; count: number }>([
    { $group: { _id: "$companySlug", name: { $first: "$company" }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 100 },
  ]) : [];
  const companies = db ? await Company.find({ slug: { $in: rows.map((row) => row._id) } }).lean() : [];
  const verified = new Map(companies.map((company) => [company.slug, company.verified]));
  return (
    <section>
      <h1 className="font-serif text-4xl">Companies</h1>
      <ul className="mt-6 grid gap-3">
        {rows.length === 0 ? <li className="text-muted">No companies yet.</li> : rows.map((row) => (
          <li key={row._id} className="flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-3 text-sm">
            <span>{row.name} · {row.count} jobs{verified.get(row._id) ? " · Verified" : ""}</span>
            <form action={verifyCompanyAction}>
              <input type="hidden" name="slug" value={row._id} />
              <button className="text-primary" type="submit">{verified.get(row._id) ? "Remove verification" : "Verify"}</button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
