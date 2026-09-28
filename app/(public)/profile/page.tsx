import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { updateProfileAction } from "@/app/actions/candidate";
import { inputClass, labelClass } from "@/components/ui";
import { currentSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { EMIRATES } from "@/lib/uae/emirates";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const session = await currentSession();
  if (!session?.user) redirect("/login?next=/profile");
  const query = await searchParams;
  const db = await connectDB();
  const user = db ? await User.findById(session.user.id).lean() : null;
  return (
    <section className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="font-serif text-4xl">Profile</h1>
      {query.saved && <p className="mt-3 text-sm text-primary">Profile saved.</p>}
      {query.error && <p className="mt-3 text-sm text-danger">Profile could not be saved.</p>}
      <form action={updateProfileAction} className="mt-6 grid gap-3">
        <label className={labelClass}>Name<input className={inputClass} name="name" defaultValue={user?.name} required /></label>
        <label className={labelClass}>Phone<input className={inputClass} name="phone" defaultValue={user?.phone || ""} /></label>
        <label className={labelClass}>
          Emirate
          <select className={inputClass} name="emirate" defaultValue={user?.emirate || ""}>
            <option value="">Select</option>
            {EMIRATES.map((emirate) => <option key={emirate.slug} value={emirate.slug}>{emirate.name}</option>)}
          </select>
        </label>
        <label className={labelClass}>Headline<input className={inputClass} name="headline" defaultValue={user?.headline || ""} /></label>
        <label className={labelClass}>Skills<input className={inputClass} name="skills" defaultValue={user?.skills?.join(", ") || ""} placeholder="Comma separated" /></label>
        <label className={labelClass}>About<textarea className={`${inputClass} h-28 py-2`} name="about" defaultValue={user?.about || ""} /></label>
        <button className="h-11 rounded-xl bg-primary text-sm font-medium text-primary-foreground" type="submit">Save profile</button>
      </form>
      <form action={logoutAction} className="mt-4">
        <button className="text-sm text-muted" type="submit">Sign out</button>
      </form>
    </section>
  );
}
