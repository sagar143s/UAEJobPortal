"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Job, JobAlert, User } from "@/lib/models";
import { alertSchema, applicationSchema, profileSchema } from "@/lib/validators";
import { Application } from "@/lib/models";

export async function saveJobAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const session = await currentSession();
  if (!session?.user) redirect(`/login?next=${encodeURIComponent(`/jobs/${slug}`)}`);
  const db = await connectDB();
  if (!db) redirect("/saved?error=db");
  const job = await Job.findOne({ slug, status: "ACTIVE" }).select("_id");
  if (!job) redirect("/jobs");
  const user = await User.findById(session.user.id);
  if (!user) redirect("/login");
  const exists = user.savedJobIds.some((id: { toString(): string }) => String(id) === String(job._id));
  user.savedJobIds = exists
    ? user.savedJobIds.filter((id: { toString(): string }) => String(id) !== String(job._id))
    : [...user.savedJobIds, job._id];
  await user.save();
  revalidatePath("/saved");
}

export async function createAlertAction(formData: FormData) {
  const session = await currentSession();
  if (!session?.user?.email) redirect("/login?next=/alerts");
  const parsed = alertSchema.safeParse({
    keyword: formData.get("keyword"),
    emirate: formData.get("emirate"),
    categorySlug: formData.get("categorySlug"),
    employmentType: formData.get("employmentType"),
  });
  if (!parsed.success) redirect("/alerts?error=1");
  const db = await connectDB();
  if (!db) redirect("/alerts?error=db");
  await JobAlert.create({
    userId: session.user.id,
    email: session.user.email,
    keyword: parsed.data.keyword || undefined,
    emirate: parsed.data.emirate || undefined,
    categorySlug: parsed.data.categorySlug || undefined,
    employmentType: parsed.data.employmentType || undefined,
    active: true,
  });
  revalidatePath("/alerts");
}

export async function updateProfileAction(formData: FormData) {
  const session = await currentSession();
  if (!session?.user) redirect("/login?next=/profile");
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    emirate: formData.get("emirate"),
    headline: formData.get("headline"),
    skills: formData.get("skills"),
    about: formData.get("about"),
  });
  if (!parsed.success) redirect("/profile?error=1");
  const db = await connectDB();
  if (!db) redirect("/profile?error=db");
  await User.findByIdAndUpdate(session.user.id, {
    name: parsed.data.name,
    phone: parsed.data.phone || undefined,
    emirate: parsed.data.emirate || undefined,
    headline: parsed.data.headline || undefined,
    skills: (parsed.data.skills || "").split(",").map((item) => item.trim()).filter(Boolean),
    about: parsed.data.about || undefined,
  });
  revalidatePath("/profile");
  redirect("/profile?saved=1");
}

export async function applyAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const parsed = applicationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  });
  if (!parsed.success) redirect(`/jobs/${slug}?error=1`);
  const db = await connectDB();
  if (!db) redirect(`/jobs/${slug}?error=db`);
  const job = await Job.findOne({ slug, status: "ACTIVE", applicationType: "internal" });
  if (!job) redirect(`/jobs/${slug}`);
  await Application.create({
    jobId: job._id,
    jobSlug: job.slug,
    jobTitle: job.title,
    employerId: job.employerId,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || undefined,
    message: parsed.data.message || undefined,
  });
  redirect(`/jobs/${slug}?applied=1`);
}

export async function recordView(slug: string, userId: string) {
  const db = await connectDB();
  if (!db) return;
  const job = await Job.findOne({ slug }).select("_id slug title company");
  const user = await User.findById(userId);
  if (!job || !user) return;
  user.viewedJobs = [
    { jobId: job._id, slug: job.slug, title: job.title, company: job.company, viewedAt: new Date() },
    ...user.viewedJobs.filter((item: { slug: string }) => item.slug !== job.slug),
  ].slice(0, 50);
  await user.save();
}
