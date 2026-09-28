import { NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cron";
import { connectDB } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";
import { Job, JobAlert } from "@/lib/models";
import { escapeRegex } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await connectDB();
  if (!db) return NextResponse.json({ ok: false, error: "MongoDB is not connected." }, { status: 503 });
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL;
  if (!key || !from) {
    return NextResponse.json({ ok: true, sent: 0, email: "not_configured" });
  }

  const alerts = await JobAlert.find({ active: true }).limit(100);
  let sent = 0;
  for (const alert of alerts) {
    const since = alert.lastNotifiedAt || alert.createdAt || new Date(0);
    const query: Record<string, unknown> = { status: "ACTIVE", publishedAt: { $gt: since } };
    if (alert.emirate) query.emirate = alert.emirate;
    if (alert.categorySlug) query.categorySlug = alert.categorySlug;
    if (alert.employmentType) query.employmentType = alert.employmentType;
    if (alert.keyword) query.title = new RegExp(escapeRegex(alert.keyword), "i");
    const jobs = await Job.find(query).sort({ publishedAt: -1 }).limit(10).select("title company slug").lean();
    if (!jobs.length) continue;
    const lines = jobs.map((job) => `${job.title} at ${job.company}\n${getSiteUrl()}/jobs/${job.slug}`);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: alert.email,
        subject: `${jobs.length} new UAE job${jobs.length === 1 ? "" : "s"} match your alert`,
        text: lines.join("\n\n"),
      }),
    });
    if (response.ok) {
      alert.lastNotifiedAt = new Date();
      await alert.save();
      sent += 1;
    }
  }
  return NextResponse.json({ ok: true, sent });
}

export async function POST(request: Request) {
  return GET(request);
}
