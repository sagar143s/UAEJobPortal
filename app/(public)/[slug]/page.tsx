import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobsBrowser } from "@/components/jobs/browser";
import { countForSeo } from "@/lib/jobs/queries";
import { parseSeoSlug } from "@/lib/seo/routes";
import { categoryName } from "@/lib/uae/classify";
import { emirateName } from "@/lib/uae/emirates";
import { parseFilters } from "@/lib/validators";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = parseSeoSlug((await params).slug);
  if (!page) return { title: "Jobs" };
  const title = page.kind === "walkin-location"
    ? `Walk-in interviews in ${emirateName(page.emirate)}`
    : page.kind === "category-location"
      ? `${categoryName(page.category)} jobs in ${emirateName(page.emirate)}`
      : `Jobs in ${emirateName(page.emirate)}`;
  return { title, alternates: { canonical: `/${(await params).slug}` } };
}

export default async function SeoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const page = parseSeoSlug(slug);
  if (!page) notFound();
  const count = await countForSeo(page);
  if (count < 1) notFound();
  const filters = parseFilters(await searchParams);
  const title = page.kind === "walkin-location"
    ? `Walk-in interviews in ${emirateName(page.emirate)}`
    : page.kind === "category-location"
      ? `${categoryName(page.category)} jobs in ${emirateName(page.emirate)}`
      : `Jobs in ${emirateName(page.emirate)}`;
  const extra = page.kind === "walkin-location"
    ? { emirate: page.emirate, isWalkIn: true }
    : page.kind === "category-location"
      ? { emirate: page.emirate, categorySlug: page.category }
      : { emirate: page.emirate };
  return <JobsBrowser title={title} intro={`${count.toLocaleString("en-AE")} active listings.`} filters={{ ...filters, location: page.emirate, category: page.kind === "category-location" ? page.category : filters.category }} pathname={`/${slug}`} extra={extra} />;
}
