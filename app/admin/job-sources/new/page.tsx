import { SourceForm } from "@/components/admin/source-form";
import { PROVIDER_PRESETS } from "@/lib/job-sources/presets";

export default async function NewSourcePage({ searchParams }: { searchParams: Promise<{ preset?: string }> }) {
  const query = await searchParams;
  const preset = PROVIDER_PRESETS.find((item) => item.id === query.preset);
  return (
    <section>
      <h1 className="font-serif text-4xl">Add source</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {PROVIDER_PRESETS.map((item) => (
          <a key={item.id} className="rounded-full border border-line px-3 py-1" href={`/admin/job-sources/new?preset=${item.id}`}>{item.name}</a>
        ))}
      </div>
      {preset && <p className="mt-4 max-w-2xl text-sm text-muted">{preset.note}</p>}
      <div className="mt-6">
        <SourceForm
          defaults={preset ? {
            name: preset.name,
            provider: preset.provider,
            type: preset.type,
            feedUrl: preset.feedUrl,
            apiKeyEnv: preset.apiKeyEnv,
            appIdEnv: preset.appIdEnv,
            enabled: false,
            locationFilter: [],
            syncInterval: 60,
            syncMode: preset.syncMode,
            attributionText: preset.attributionText,
            termsUrl: preset.termsUrl,
            config: preset.config,
            hasApiKey: false,
          } : undefined}
        />
      </div>
    </section>
  );
}
