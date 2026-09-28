import { EMIRATES } from "@/lib/uae/emirates";
import { CATEGORIES } from "@/lib/uae/categories";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, employmentLabel, experienceLabel } from "@/lib/uae/classify";
import type { JobFilters } from "@/lib/validators";
import { inputClass, labelClass } from "@/components/ui";

export function Filters({ filters, action, idSuffix = "" }: { filters: JobFilters; action: string; idSuffix?: string }) {
  return (
    <form action={action} className="h-fit space-y-4 border border-line bg-white p-4">
      <div>
        <label className={labelClass} htmlFor={`q${idSuffix}`}>Keyword</label>
        <input className={inputClass} id={`q${idSuffix}`} name="q" defaultValue={filters.q} placeholder="Title, company or skill" />
      </div>
      <Select name="location" idSuffix={idSuffix} label="Location" defaultValue={filters.location} options={[
        ["", "All UAE"],
        ...EMIRATES.map((emirate) => [emirate.slug, `${emirate.name}${emirate.short !== emirate.name ? ` (${emirate.short})` : ""}`] as [string, string]),
      ]} />
      <Select name="category" idSuffix={idSuffix} label="Category" defaultValue={filters.category} options={[["", "Any category"], ...CATEGORIES.map((category) => [category.slug, category.name] as [string, string])]} />
      <Select name="type" idSuffix={idSuffix} label="Job type" defaultValue={filters.type} options={[["", "Any type"], ...EMPLOYMENT_TYPES.map((type) => [type, employmentLabel(type) || type] as [string, string])]} />
      <Select name="experience" idSuffix={idSuffix} label="Experience" defaultValue={filters.experience} options={[["", "Any experience"], ...EXPERIENCE_LEVELS.map((level) => [level, experienceLabel(level) || level] as [string, string])]} />
      <Select name="salary" idSuffix={idSuffix} label="Salary (AED)" defaultValue={filters.salary} options={[
        ["", "Any salary"],
        ["0-3000", "Up to 3,000"],
        ["3000-5000", "3,000 – 5,000"],
        ["5000-8000", "5,000 – 8,000"],
        ["8000-12000", "8,000 – 12,000"],
        ["12000-20000", "12,000 – 20,000"],
        ["20000+", "20,000+"],
      ]} />
      <Select name="posted" idSuffix={idSuffix} label="Posted" defaultValue={filters.posted} options={[
        ["", "Any time"],
        ["1", "Today"],
        ["3", "Last 3 days"],
        ["7", "Last 7 days"],
        ["14", "Last 14 days"],
        ["30", "Last 30 days"],
      ]} />
      <fieldset className="space-y-2 text-sm">
        <legend className="mb-1 font-medium">Special</legend>
        <Check name="walkin" label="Walk-in interview" checked={filters.walkin === "1"} />
        <Check name="urgent" label="Urgent hiring" checked={filters.urgent === "1"} />
        <Check name="verified" label="Verified employer" checked={filters.verified === "1"} />
        <Check name="featured" label="Featured" checked={filters.featured === "1"} />
      </fieldset>
      <button className="h-11 w-full bg-primary text-sm font-semibold text-white" type="submit">
        Apply filters
      </button>
    </form>
  );
}

export function SearchForm({ location }: { location?: string }) {
  return (
    <form action="/jobs" className="grid gap-2 md:grid-cols-[1fr_180px_auto]">
      <label className="sr-only" htmlFor="hero-q">Job title, keyword or company</label>
      <input id="hero-q" name="q" className={inputClass} placeholder="Job title, keyword or company" />
      <select name="location" defaultValue={location} className={inputClass} aria-label="Location">
        <option value="">All UAE</option>
        {EMIRATES.map((emirate) => (
          <option key={emirate.slug} value={emirate.slug}>{emirate.name}</option>
        ))}
      </select>
      <button className="h-11 bg-accent px-5 text-sm font-semibold text-white" type="submit">
        Search Jobs
      </button>
    </form>
  );
}

function Select({ name, label, defaultValue, options, idSuffix = "" }: { name: string; label: string; defaultValue?: string; options: [string, string][]; idSuffix?: string }) {
  const id = `${name}${idSuffix}`;
  return (
    <div>
      <label className={labelClass} htmlFor={id}>{label}</label>
      <select className={inputClass} id={id} name={name} defaultValue={defaultValue || ""}>
        {options.map(([value, text]) => (
          <option key={value || "any"} value={value}>{text}</option>
        ))}
      </select>
    </div>
  );
}

function Check({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" name={name} value="1" defaultChecked={checked} />
      {label}
    </label>
  );
}
