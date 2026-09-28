import { notFound } from "next/navigation";
import { SourceForm } from "@/components/admin/source-form";
import { SyncButton } from "@/components/admin/sync-button";
import { connectDB } from "@/lib/db";
import { resolveSecrets } from "@/lib/job-sources/registry";
import { JobSource } from "@/lib/models";

export default async function EditSourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await connectDB();
  const source = db ? await JobSource.findById(id).select("+apiKey").lean() : null;
  if (!source) notFound();
  const secrets = resolveSecrets(source);
  return (
    <section>
      <h1 className="font-serif text-4xl">{source.name}</h1>
      <p className="mt-2 text-sm text-muted">
        API key: {secrets.apiKeyConfigured ? "configured" : "missing"} · App ID: {secrets.appIdConfigured ? "configured" : "not set"}
      </p>
      <div className="mt-4"><SyncButton sourceId={String(source._id)} /></div>
      <div className="mt-8">
        <SourceForm
          id={String(source._id)}
          defaults={{
            name: source.name,
            provider: source.provider,
            type: source.type,
            apiUrl: source.apiUrl || undefined,
            feedUrl: source.feedUrl || undefined,
            apiKeyEnv: source.apiKeyEnv || undefined,
            appIdEnv: source.appIdEnv || undefined,
            enabled: source.enabled,
            locationFilter: source.locationFilter || [],
            syncInterval: source.syncInterval || 60,
            syncMode: source.syncMode || "incremental",
            attributionText: source.attributionText || undefined,
            termsUrl: source.termsUrl || undefined,
            config: source.config || {},
            hasApiKey: secrets.apiKeyConfigured,
          }}
        />
      </div>
    </section>
  );
}
