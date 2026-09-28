import { updateSettingsAction } from "@/app/actions/admin";
import { inputClass, labelClass } from "@/components/ui";
import { getSettings } from "@/lib/jobs/queries";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const settings = await getSettings();
  const query = await searchParams;
  return (
    <section>
      <h1 className="font-serif text-4xl">Settings</h1>
      {query.saved && <p className="mt-3 text-sm text-primary">Settings saved.</p>}
      {query.error && <p className="mt-3 text-sm text-danger">Settings could not be saved.</p>}
      <form action={updateSettingsAction} className="mt-6 grid max-w-xl gap-3">
        <label className={labelClass}>Site name<input className={inputClass} name="siteName" defaultValue={settings.siteName} /></label>
        <label className={labelClass}>Tagline<input className={inputClass} name="tagline" defaultValue={settings.tagline} /></label>
        <label className={labelClass}>Jobs per page<input className={inputClass} name="jobsPerPage" type="number" defaultValue={settings.jobsPerPage} /></label>
        <label className={labelClass}>Expire unseen external jobs after (days)<input className={inputClass} name="expireUnseenAfterDays" type="number" defaultValue={settings.expireUnseenAfterDays} /></label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requireJobApproval" value="1" defaultChecked={settings.requireJobApproval} />
          Hold direct employer jobs for approval
        </label>
        <button className="h-11 rounded-xl bg-primary text-sm font-medium text-primary-foreground" type="submit">Save settings</button>
      </form>
    </section>
  );
}
