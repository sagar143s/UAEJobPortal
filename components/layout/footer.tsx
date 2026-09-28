import Link from "next/link";
import { site } from "@/lib/site";
import { EMIRATES } from "@/lib/uae/emirates";

export function Footer() {
  return (
    <footer className="mt-10 bg-primary text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">{site.name}</p>
          <p className="mt-2 text-sm text-white/75">{site.tagline}</p>
        </div>
        <div className="space-y-1 text-sm">
          <p className="mb-2 font-medium">Search</p>
          <Link className="block text-white/80 hover:text-white" href="/jobs">All jobs</Link>
          <Link className="block text-white/80 hover:text-white" href="/walk-in-interviews">Walk-in interviews</Link>
          <Link className="block text-white/80 hover:text-white" href="/today-jobs">Today&apos;s jobs</Link>
          <Link className="block text-white/80 hover:text-white" href="/fresher-jobs">Fresher jobs</Link>
          <Link className="block text-white/80 hover:text-white" href="/employers/jobs/new">Post a job</Link>
        </div>
        <div className="space-y-1 text-sm">
          <p className="mb-2 font-medium">Cities</p>
          {EMIRATES.slice(0, 5).map((emirate) => (
            <Link key={emirate.slug} className="block text-white/80 hover:text-white" href={`/jobs?location=${emirate.slug}`}>
              {emirate.name}
            </Link>
          ))}
          <Link className="block text-white/80 hover:text-white" href="/privacy">Privacy</Link>
          <Link className="block text-white/80 hover:text-white" href="/about">How listings work</Link>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {site.name}. Listings appear only from authorized sources or a direct employer post.
      </p>
    </footer>
  );
}
