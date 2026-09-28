import type { Metadata } from "next";
import { JobsBrowser } from "@/components/jobs/browser";
import { currentSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Job, User } from "@/lib/models";
import { parseFilters } from "@/lib/validators";

export const metadata: Metadata = {
  title: "Jobs in the UAE",
  description: "Search real jobs in Dubai, Abu Dhabi, Sharjah and across the UAE.",
  alternates: { canonical: "/jobs" },
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const saved = await savedSlugs();
  return (
    <JobsBrowser
      title="Jobs in the UAE"
      intro="Results come from MongoDB after a source sync or a direct employer post."
      filters={filters}
      pathname="/jobs"
      saved={saved}
    />
  );
}

async function savedSlugs() {
  const session = await currentSession();
  if (!session?.user) return [];
  const db = await connectDB();
  if (!db) return [];
  const user = await User.findById(session.user.id).select("savedJobIds").lean();
  if (!user?.savedJobIds?.length) return [];
  const jobs = await Job.find({ _id: { $in: user.savedJobIds } }).select("slug").lean();
  return jobs.map((job) => job.slug);
}
