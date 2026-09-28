import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

export default async function HistoryPage() {
  const session = await currentSession();
  if (!session?.user) redirect("/login?next=/history");
  const db = await connectDB();
  const user = db ? await User.findById(session.user.id).lean() : null;
  const history = user?.viewedJobs ?? [];
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl">Recently viewed</h1>
      <ul className="mt-6 grid gap-3">
        {history.length === 0 ? <li className="text-muted">Jobs you open while signed in will appear here.</li> : history.map((item: { slug: string; title: string; company: string; viewedAt?: Date }) => (
          <li key={`${item.slug}-${item.viewedAt?.toISOString()}`}>
            <Link href={`/jobs/${item.slug}`} className="block rounded-2xl border border-line bg-card px-4 py-3">
              <span className="block font-medium">{item.title}</span>
              <span className="text-sm text-muted">{item.company}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
