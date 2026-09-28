import { redirect } from "next/navigation";
import { createAlertAction } from "@/app/actions/candidate";
import { inputClass, labelClass } from "@/components/ui";
import { currentSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { JobAlert } from "@/lib/models";
import { CATEGORIES } from "@/lib/uae/categories";
import { EMIRATES } from "@/lib/uae/emirates";

export default async function AlertsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await currentSession();
  if (!session?.user) redirect("/login?next=/alerts");
  const query = await searchParams;
  const db = await connectDB();
  const alerts = db ? await JobAlert.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean() : [];
  return (
    <section className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="font-serif text-4xl">Job alerts</h1>
      <p className="mt-2 text-sm text-muted">Alerts are saved immediately. Email is sent only when RESEND_API_KEY and ALERT_FROM_EMAIL are configured.</p>
      {query.error && <p className="mt-3 text-sm text-danger">The alert could not be saved.</p>}
      <form action={createAlertAction} className="mt-6 grid gap-3">
        <label className={labelClass}>Keyword<input className={inputClass} name="keyword" /></label>
        <label className={labelClass}>
          Emirate
          <select className={inputClass} name="emirate" defaultValue="">
            <option value="">Any</option>
            {EMIRATES.map((emirate) => <option key={emirate.slug} value={emirate.slug}>{emirate.name}</option>)}
          </select>
        </label>
        <label className={labelClass}>
          Category
          <select className={inputClass} name="categorySlug" defaultValue="">
            <option value="">Any</option>
            {CATEGORIES.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
          </select>
        </label>
        <button className="h-11 rounded-xl bg-primary text-sm font-medium text-primary-foreground" type="submit">Create alert</button>
      </form>
      <ul className="mt-8 grid gap-3 text-sm">
        {alerts.map((alert) => (
          <li key={String(alert._id)} className="rounded-2xl border border-line bg-card px-4 py-3">
            {[alert.keyword, alert.emirate, alert.categorySlug].filter(Boolean).join(" · ") || "All new UAE jobs"}
          </li>
        ))}
      </ul>
    </section>
  );
}
