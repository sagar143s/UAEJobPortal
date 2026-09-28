import Link from "next/link";
import { requireUser } from "@/lib/auth";

const links = [
  ["/admin", "Dashboard"],
  ["/admin/jobs", "Jobs"],
  ["/admin/job-sources", "Job sources"],
  ["/admin/sync-logs", "Sync logs"],
  ["/admin/companies", "Companies"],
  ["/admin/categories", "Categories"],
  ["/admin/locations", "Locations"],
  ["/admin/walk-in-interviews", "Walk-in interviews"],
  ["/admin/settings", "Settings"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireUser("admin");
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-3xl border border-line bg-card p-4">
        <p className="font-serif text-xl">Admin</p>
        <nav className="mt-4 grid gap-2 text-sm">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-xl px-2 py-1.5 hover:bg-background">{label}</Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
