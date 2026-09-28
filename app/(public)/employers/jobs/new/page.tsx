import { postJobAction } from "@/app/actions/employer";
import { inputClass, labelClass } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { CATEGORIES } from "@/lib/uae/categories";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, employmentLabel, experienceLabel } from "@/lib/uae/classify";

export default async function NewEmployerJobPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser("employer");
  const query = await searchParams;
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="font-serif text-4xl">Post a job</h1>
      <p className="mt-2 text-sm text-muted">The location must be in the UAE. Leave the application URL empty to receive applications on UAEJobPortal.</p>
      {query.error && <p className="mt-4 text-sm text-danger">{query.error === "1" || query.error === "db" ? "Check the required fields and try again." : decodeURIComponent(query.error)}</p>}
      <form action={postJobAction} className="mt-6 grid gap-3">
        <label className={labelClass}>Job title<input className={inputClass} name="title" required /></label>
        <label className={labelClass}>Company<input className={inputClass} name="company" required /></label>
        <label className={labelClass}>Location<input className={inputClass} name="location" placeholder="Dubai, UAE" required /></label>
        <label className={labelClass}>Description<textarea className={`${inputClass} h-36 py-2`} name="description" required /></label>
        <label className={labelClass}>Requirements<textarea className={`${inputClass} h-24 py-2`} name="requirements" /></label>
        <label className={labelClass}>Benefits<textarea className={`${inputClass} h-24 py-2`} name="benefits" /></label>
        <label className={labelClass}>
          Category
          <select className={inputClass} name="category" defaultValue="">
            <option value="">Select</option>
            {CATEGORIES.map((category) => <option key={category.slug}>{category.name}</option>)}
          </select>
        </label>
        <label className={labelClass}>
          Job type
          <select className={inputClass} name="employmentType" defaultValue="">
            <option value="">Select</option>
            {EMPLOYMENT_TYPES.map((type) => <option key={type} value={type}>{employmentLabel(type)}</option>)}
          </select>
        </label>
        <label className={labelClass}>
          Experience
          <select className={inputClass} name="experience" defaultValue="">
            <option value="">Select</option>
            {EXPERIENCE_LEVELS.map((level) => <option key={level} value={level}>{experienceLabel(level)}</option>)}
          </select>
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className={labelClass}>Minimum salary (AED)<input className={inputClass} name="salaryMin" type="number" min="1" /></label>
          <label className={labelClass}>Maximum salary (AED)<input className={inputClass} name="salaryMax" type="number" min="1" /></label>
        </div>
        <label className={labelClass}>
          Salary period
          <select className={inputClass} name="salaryPeriod" defaultValue="MONTH">
            <option value="MONTH">Monthly</option>
            <option value="YEAR">Yearly</option>
            <option value="DAY">Daily</option>
            <option value="HOUR">Hourly</option>
          </select>
        </label>
        <label className={labelClass}>External application URL<input className={inputClass} name="applicationUrl" type="url" placeholder="Optional" /></label>
        <label className={labelClass}>Expires<input className={inputClass} name="expiresAt" type="date" /></label>
        <button className="h-11 rounded-xl bg-primary text-sm font-medium text-primary-foreground" type="submit">Publish job</button>
      </form>
    </section>
  );
}
