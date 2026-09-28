import { loginAction } from "@/app/actions/auth";
import { inputClass, labelClass } from "@/components/ui";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const query = await searchParams;
  return (
    <section className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="font-serif text-4xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Browsing jobs does not require an account.</p>
      {query.error && <p className="mt-4 text-sm text-danger">Email or password was not accepted. If this is a new install, set NEXTAUTH_SECRET and ADMIN_EMAIL.</p>}
      <form action={loginAction} className="mt-6 grid gap-3">
        <input type="hidden" name="next" value={query.next || "/"} />
        <label className={labelClass}>Email<input className={inputClass} name="email" type="email" required /></label>
        <label className={labelClass}>Password<input className={inputClass} name="password" type="password" required /></label>
        <button className="h-11 rounded-xl bg-primary text-sm font-medium text-primary-foreground" type="submit">Sign in</button>
      </form>
      <p className="mt-4 text-sm">No account? <a className="text-primary" href="/register">Register</a></p>
    </section>
  );
}
