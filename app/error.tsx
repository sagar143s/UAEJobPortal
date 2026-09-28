"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="mx-auto w-full max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Something went wrong</h1>
      <p className="mt-3 text-muted">The page could not be loaded. No placeholder jobs were substituted.</p>
      <button className="mt-6 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={() => reset()} type="button">
        Try again
      </button>
    </section>
  );
}
