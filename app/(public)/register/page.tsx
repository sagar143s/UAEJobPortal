import { registerAction } from "@/app/actions/auth";
import { inputClass, labelClass } from "@/components/ui";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return (
    <section className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="font-serif text-4xl">Create an account</h1>
      {query.error && <p className="mt-4 text-sm text-danger">Could not create the account. Use a new email and a password of at least 8 characters.</p>}
      <form action={registerAction} className="mt-6 grid gap-3">
        <label className={labelClass}>Name<input className={inputClass} name="name" required /></label>
        <label className={labelClass}>Email<input className={inputClass} name="email" type="email" required /></label>
        <label className={labelClass}>Password<input className={inputClass} name="password" type="password" minLength={8} required /></label>
        <label className={labelClass}>
          Account type
          <select className={inputClass} name="role" defaultValue="candidate">
            <option value="candidate">Candidate</option>
            <option value="employer">Employer</option>
          </select>
        </label>
        <button className="h-11 rounded-xl bg-primary text-sm font-medium text-primary-foreground" type="submit">Register</button>
      </form>
    </section>
  );
}
