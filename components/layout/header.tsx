"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { CATEGORIES } from "@/lib/uae/categories";
import { EMIRATES } from "@/lib/uae/emirates";

const barLink = "px-3 py-3 text-sm text-white hover:bg-black/10";

export function Header({
  user,
}: {
  user: { name?: string | null; role: "candidate" | "employer" | "admin" } | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="bg-[#f3f3f3]">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 pb-3 pt-4">
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-primary"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="flex flex-col gap-1" aria-hidden>
            <span className="block h-0.5 w-6 bg-foreground" />
            <span className="block h-0.5 w-6 bg-foreground" />
            <span className="block h-0.5 w-6 bg-foreground" />
          </span>
          <span className="text-xs font-semibold">Browse</span>
        </button>

        <Link href="/" className="justify-self-center text-center">
          <span className="text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
            <span className="text-primary">UAE</span>
            <span className="text-[#1a1a1a]">Job</span>
            <span className="text-accent">Portal</span>
          </span>
          <span className="mt-1 block text-sm italic text-primary">{site.tagline}</span>
        </Link>

        <div className="hidden min-w-16 text-right text-xs text-muted sm:block">
          {user ? (
            <div className="space-y-1">
              {user.role === "admin" && <Link className="block hover:text-primary" href="/admin">Admin</Link>}
              <Link className="block hover:text-primary" href="/profile">{user.name?.split(" ")[0] || "Account"}</Link>
            </div>
          ) : (
            <div className="space-y-1">
              <Link className="block hover:text-primary" href="/login">Sign in</Link>
              <Link className="block hover:text-primary" href="/register">Register</Link>
            </div>
          )}
        </div>
      </div>

      <nav className="bg-primary text-white" aria-label="Primary">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center">
          <Link className={barLink} href="/">Home</Link>
          <Link className={barLink} href="/jobs">Jobs</Link>
          <Link className={barLink} href="/walk-in-interviews">Walk-in</Link>
          <Link className={barLink} href="/today-jobs">Today</Link>
          <Link className={barLink} href="/companies">Companies</Link>
          <Link className={barLink} href="/categories">Categories</Link>
          <Link className={barLink} href="/locations">Cities</Link>
          <Link href="/employers/jobs/new" className="my-2 ml-auto mr-3 bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-[#c96822]">
            Post a job
          </Link>
        </div>
      </nav>

      {open && (
        <div id="site-menu" className="bg-[#143d28] text-white">
          <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-6 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Jobs</p>
              <MenuLink href="/jobs">All jobs</MenuLink>
              <MenuLink href="/walk-in-interviews">Walk-in interviews</MenuLink>
              <MenuLink href="/today-jobs">Today&apos;s jobs</MenuLink>
              <MenuLink href="/urgent-jobs">Urgent jobs</MenuLink>
              <MenuLink href="/fresher-jobs">Fresher jobs</MenuLink>
              <MenuLink href="/saved">Saved jobs</MenuLink>
              <MenuLink href="/alerts">Job alerts</MenuLink>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Cities</p>
              {EMIRATES.map((emirate) => (
                <MenuLink key={emirate.slug} href={`/jobs?location=${emirate.slug}`}>
                  Jobs in {emirate.name}
                </MenuLink>
              ))}
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Categories</p>
              <div className="max-h-64 overflow-auto pr-2">
                {CATEGORIES.map((category) => (
                  <MenuLink key={category.slug} href={`/categories/${category.slug}`}>
                    {category.name}
                  </MenuLink>
                ))}
              </div>
              <div className="mt-4 border-t border-white/15 pt-3">
                {user ? (
                  <>
                    {user.role === "admin" && <MenuLink href="/admin">Admin</MenuLink>}
                    <MenuLink href="/profile">My profile</MenuLink>
                  </>
                ) : (
                  <>
                    <MenuLink href="/login">Sign in</MenuLink>
                    <MenuLink href="/register">Register</MenuLink>
                  </>
                )}
                <MenuLink href="/employers">Employers</MenuLink>
                <MenuLink href="/about">How listings work</MenuLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block py-1 text-sm text-white hover:text-[#f3c7a4]">
      {children}
    </Link>
  );
}
