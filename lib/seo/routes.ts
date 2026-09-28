import { CATEGORIES } from "@/lib/uae/categories";
import { EMIRATES, type EmirateSlug } from "@/lib/uae/emirates";

export type SeoPage =
  | { kind: "location"; emirate: EmirateSlug }
  | { kind: "category-location"; category: string; emirate: EmirateSlug }
  | { kind: "walkin-location"; emirate: EmirateSlug };

const EMIRATE_SLUGS = [...EMIRATES.map((emirate) => emirate.slug), "uae" as const].sort(
  (left, right) => right.length - left.length,
);

export function parseSeoSlug(slug: string): SeoPage | null {
  for (const emirate of EMIRATE_SLUGS) {
    if (slug === `jobs-in-${emirate}`) return { kind: "location", emirate };
    if (slug === `walk-in-interviews-in-${emirate}`) return { kind: "walkin-location", emirate };
    const suffix = `-jobs-in-${emirate}`;
    if (slug.endsWith(suffix)) {
      const category = slug.slice(0, -suffix.length);
      if (!category || category === "walk-in-interviews") continue;
      return { kind: "category-location", category, emirate };
    }
  }
  return null;
}

export function seoPath(page: SeoPage): string {
  if (page.kind === "location") return `/jobs-in-${page.emirate}`;
  if (page.kind === "walkin-location") return `/walk-in-interviews-in-${page.emirate}`;
  return `/${page.category}-jobs-in-${page.emirate}`;
}

export function knownCategorySlug(slug: string) {
  return CATEGORIES.some((category) => category.slug === slug);
}
