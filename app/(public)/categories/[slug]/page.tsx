import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobsBrowser } from "@/components/jobs/browser";
import { countJobs } from "@/lib/jobs/queries";
import { categoryName } from "@/lib/uae/classify";
import { parseFilters } from "@/lib/validators";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${categoryName(slug)} jobs in the UAE`, alternates: { canonical: `/categories/${slug}` } };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const count = await countJobs({ categorySlug: slug });
  if (count === 0) notFound();
  const filters = parseFilters({ ...(await searchParams), category: slug });
  return (
    <JobsBrowser
      title={`${categoryName(slug)} jobs in the UAE`}
      intro={`${count.toLocaleString("en-AE")} active listings in this category.`}
      filters={filters}
      pathname={`/categories/${slug}`}
      extra={{ categorySlug: slug }}
    />
  );
}
