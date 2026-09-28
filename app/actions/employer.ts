"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createDirectJob } from "@/lib/employers/post";
import { Job } from "@/lib/models";
import { employerJobSchema } from "@/lib/validators";

export async function postJobAction(formData: FormData) {
  const session = await requireUser("employer");
  const parsed = employerJobSchema.safeParse({
    title: formData.get("title"),
    company: formData.get("company"),
    location: formData.get("location"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    benefits: formData.get("benefits"),
    employmentType: formData.get("employmentType") || undefined,
    experience: formData.get("experience") || undefined,
    category: formData.get("category"),
    salaryMin: formData.get("salaryMin") || "",
    salaryMax: formData.get("salaryMax") || "",
    currency: formData.get("salaryMin") || formData.get("salaryMax") ? "AED" : undefined,
    salaryPeriod: formData.get("salaryPeriod") || undefined,
    applicationUrl: formData.get("applicationUrl") || "",
    expiresAt: formData.get("expiresAt") || "",
  });
  if (!parsed.success) redirect("/employers/jobs/new?error=1");
  const db = await connectDB();
  if (!db) redirect("/employers/jobs/new?error=db");
  const result = await createDirectJob({
    title: parsed.data.title,
    company: parsed.data.company,
    location: parsed.data.location,
    description: parsed.data.description,
    requirements: parsed.data.requirements || undefined,
    benefits: parsed.data.benefits || undefined,
    employmentType: parsed.data.employmentType,
    experienceText: parsed.data.experience,
    category: parsed.data.category || undefined,
    salaryMin: typeof parsed.data.salaryMin === "number" ? parsed.data.salaryMin : undefined,
    salaryMax: typeof parsed.data.salaryMax === "number" ? parsed.data.salaryMax : undefined,
    currency: parsed.data.currency,
    salaryPeriod: parsed.data.salaryPeriod,
    applicationUrl: parsed.data.applicationUrl || undefined,
    expiresAt: parsed.data.expiresAt || undefined,
    employerId: session.user.id,
  });
  if ("error" in result && result.error) redirect(`/employers/jobs/new?error=${encodeURIComponent(result.error)}`);
  if (!("slug" in result) || !result.slug) redirect("/employers/jobs/new?error=1");
  redirect(`/jobs/${result.slug}`);
}

export async function closeJobAction(formData: FormData) {
  const session = await requireUser("employer");
  const id = String(formData.get("id") || "");
  const job = await Job.findOne({ _id: id, employerId: session.user.id });
  if (!job) redirect("/employers/jobs");
  job.status = job.status === "CLOSED" ? "ACTIVE" : "CLOSED";
  await job.save();
  revalidatePath("/employers/jobs");
  revalidatePath(`/jobs/${job.slug}`);
}
