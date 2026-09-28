import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Page not found</h1>
      <p className="mt-3 text-muted">That page is not available, or it has no real job listings yet.</p>
      <Link className="mt-6 inline-block text-primary" href="/jobs">Browse jobs</Link>
    </section>
  );
}
