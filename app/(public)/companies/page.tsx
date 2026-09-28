import type { Metadata } from "next";
import Link from "next/link";
import { listCompanies } from "@/lib/jobs/queries";

export const metadata: Metadata = { title: "Companies hiring in the UAE", alternates: { canonical: "/companies" } };

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page || 1);
  const data = await listCompanies(Number.isFinite(page) ? page : 1);
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl">Companies</h1>
      <p className="mt-3 text-muted">Companies are created from real job listings. None are added by hand as samples.</p>
      {data.unavailable ? (
        <p className="mt-8 text-muted">Database is not connected.</p>
      ) : data.companies.length === 0 ? (
        <p className="mt-8 text-muted">No companies yet. They appear when jobs are imported or posted.</p>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {data.companies.map((company) => (
            <Link key={company.slug} href={`/companies/${company.slug}`} className="rounded-2xl border border-line bg-card px-4 py-4">
              <span className="block font-medium">{company.name}</span>
              <span className="text-sm text-muted">{company.count.toLocaleString("en-AE")} jobs{company.verified ? " · Verified" : ""}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
