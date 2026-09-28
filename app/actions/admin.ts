"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { PROVIDER_PRESETS } from "@/lib/job-sources/presets";
import { syncSource } from "@/lib/sync/engine";
import { Company, Job, JobSource, Settings } from "@/lib/models";
import { settingsSchema, sourceSchema } from "@/lib/validators";
import { assertPublicHttpUrl, envName, slugify } from "@/lib/utils";

export async function syncSourceAction(sourceId: string) {
  await requireUser("admin");
  const result = await syncSource(sourceId, "manual");
  return {
    status: result.status,
    fetchedCount: result.fetchedCount,
    uaeCount: result.uaeCount,
    importedCount: result.importedCount,
    updatedCount: result.updatedCount,
    duplicateCount: result.duplicateCount,
    skippedCount: result.skippedCount,
    errorCount: result.errorCount,
    errors: result.errors,
    message: result.message,
  };
}

export async function saveSourceAction(formData: FormData) {
  await requireUser("admin");
  const id = String(formData.get("id") || "");
  const preset = PROVIDER_PRESETS.find((item) => item.id === String(formData.get("preset") || ""));
  let config: Record<string, unknown> = preset?.config ?? {};
  const configText = String(formData.get("config") || "").trim();
  if (configText) {
    try {
      const parsed = JSON.parse(configText) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return { error: "Config must be a JSON object." };
      }
      config = parsed as Record<string, unknown>;
    } catch {
      return { error: "Config is not valid JSON." };
    }
  }
  const locationFilter = formData.getAll("locationFilter").map(String);
  const parsed = sourceSchema.safeParse({
    name: formData.get("name"),
    provider: formData.get("provider") || preset?.provider,
    type: formData.get("type") || preset?.type,
    apiUrl: formData.get("apiUrl") || "",
    feedUrl: formData.get("feedUrl") || preset?.feedUrl || "",
    apiKey: formData.get("apiKey") || "",
    apiKeyEnv: formData.get("apiKeyEnv") || preset?.apiKeyEnv || "",
    appIdEnv: formData.get("appIdEnv") || preset?.appIdEnv || "",
    enabled: formData.get("enabled") === "1",
    locationFilter,
    syncInterval: formData.get("syncInterval") || 60,
    syncMode: formData.get("syncMode") || preset?.syncMode || "incremental",
    attributionText: formData.get("attributionText") ?? preset?.attributionText ?? "",
    termsUrl: formData.get("termsUrl") || preset?.termsUrl || "",
    config: configText,
  });
  if (!parsed.success) return { error: "Check the source fields and try again." };
  try {
    if (parsed.data.apiKeyEnv) envName(parsed.data.apiKeyEnv);
    if (parsed.data.appIdEnv) envName(parsed.data.appIdEnv);
    if (parsed.data.feedUrl) assertPublicHttpUrl(parsed.data.feedUrl);
    if (parsed.data.apiUrl) assertPublicHttpUrl(parsed.data.apiUrl);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Source URL was rejected." };
  }
  const db = await connectDB();
  if (!db) return { error: "MongoDB is not connected." };

  const fields = {
    name: parsed.data.name,
    type: parsed.data.type,
    provider: parsed.data.provider,
    apiUrl: parsed.data.apiUrl || undefined,
    feedUrl: parsed.data.feedUrl || undefined,
    apiKeyEnv: parsed.data.apiKeyEnv || undefined,
    appIdEnv: parsed.data.appIdEnv || undefined,
    enabled: Boolean(parsed.data.enabled),
    country: "AE",
    locationFilter,
    syncInterval: parsed.data.syncInterval || 60,
    syncMode: parsed.data.syncMode || "incremental",
    attributionText: parsed.data.attributionText || undefined,
    termsUrl: parsed.data.termsUrl || undefined,
    config,
  };

  if (!id) {
    const slug = slugify(parsed.data.name);
    const source = await JobSource.create({
      ...fields,
      slug: slug || `source-${Date.now()}`,
      status: fields.enabled ? "idle" : "disabled",
    });
    if (parsed.data.apiKey) {
      source.apiKey = parsed.data.apiKey;
      await source.save();
    }
    revalidatePath("/admin/job-sources");
    return { id: String(source._id) };
  }

  const source = await JobSource.findById(id).select("+apiKey");
  if (!source) return { error: "Source was not found." };
  source.set(fields);
  if (parsed.data.apiKey) source.apiKey = parsed.data.apiKey;
  if (!source.enabled) source.status = "disabled";
  else if (source.status === "disabled") source.status = "idle";
  await source.save();
  revalidatePath("/admin/job-sources");
  return { id: String(source._id) };
}

export async function deleteSourceAction(formData: FormData) {
  await requireUser("admin");
  const id = String(formData.get("id") || "");
  const db = await connectDB();
  if (!db) redirect("/admin/job-sources?error=db");
  const source = await JobSource.findById(id);
  if (!source) redirect("/admin/job-sources");
  await Job.updateMany({ source: source.slug, status: "ACTIVE" }, { $set: { status: "EXPIRED" } });
  await JobSource.findByIdAndDelete(id);
  revalidatePath("/admin/job-sources");
  redirect("/admin/job-sources");
}

export async function toggleSourceAction(formData: FormData) {
  await requireUser("admin");
  const id = String(formData.get("id") || "");
  const source = await JobSource.findById(id);
  if (!source) redirect("/admin/job-sources");
  source.enabled = !source.enabled;
  source.status = source.enabled ? "idle" : "disabled";
  await source.save();
  revalidatePath("/admin/job-sources");
}

export async function updateSettingsAction(formData: FormData) {
  await requireUser("admin");
  const parsed = settingsSchema.safeParse({
    siteName: formData.get("siteName"),
    tagline: formData.get("tagline"),
    jobsPerPage: formData.get("jobsPerPage"),
    expireUnseenAfterDays: formData.get("expireUnseenAfterDays"),
    requireJobApproval: formData.get("requireJobApproval") === "1",
  });
  if (!parsed.success) redirect("/admin/settings?error=1");
  const db = await connectDB();
  if (!db) redirect("/admin/settings?error=db");
  await Settings.findOneAndUpdate({ key: "site" }, { key: "site", ...parsed.data }, { upsert: true });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

export async function moderateJobAction(formData: FormData) {
  await requireUser("admin");
  const id = String(formData.get("id") || "");
  const action = String(formData.get("action") || "");
  const job = await Job.findById(id);
  if (!job) redirect("/admin/jobs");
  if (action === "expire") job.status = "EXPIRED";
  if (action === "activate") job.status = "ACTIVE";
  if (action === "feature") job.isFeatured = !job.isFeatured;
  if (action === "urgent") job.isUrgent = !job.isUrgent;
  await job.save();
  revalidatePath("/admin/jobs");
  revalidatePath(`/jobs/${job.slug}`);
}

export async function verifyCompanyAction(formData: FormData) {
  await requireUser("admin");
  const slug = String(formData.get("slug") || "");
  const company = await Company.findOne({ slug });
  if (!company) redirect("/admin/companies");
  company.verified = !company.verified;
  await company.save();
  await Job.updateMany({ companySlug: slug }, { $set: { verifiedEmployer: company.verified } });
  revalidatePath("/admin/companies");
}
