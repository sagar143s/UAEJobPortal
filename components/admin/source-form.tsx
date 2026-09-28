"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSourceAction } from "@/app/actions/admin";
import { inputClass, labelClass } from "@/components/ui";
import { EMIRATES } from "@/lib/uae/emirates";
import { PROVIDER_PRESETS } from "@/lib/job-sources/presets";

export function SourceForm({
  id,
  defaults,
}: {
  id?: string;
  defaults?: {
    name: string;
    provider: string;
    type: string;
    apiUrl?: string;
    feedUrl?: string;
    apiKeyEnv?: string;
    appIdEnv?: string;
    enabled: boolean;
    locationFilter: string[];
    syncInterval: number;
    syncMode: string;
    attributionText?: string;
    termsUrl?: string;
    config?: unknown;
    hasApiKey: boolean;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const preset = PROVIDER_PRESETS.find((item) => item.provider === defaults?.provider && item.type === defaults?.type);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(undefined);
    const result = await saveSourceAction(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.id) router.push(`/admin/job-sources/${result.id}`);
  }

  return (
    <form action={onSubmit} className="grid max-w-3xl gap-4">
      {id && <input type="hidden" name="id" value={id} />}
      {error && <p className="rounded-xl bg-[#f8e4e4] px-3 py-2 text-sm text-danger">{error}</p>}
      <Field name="name" label="Name" defaultValue={defaults?.name} required />
      <label className={labelClass}>
        Provider preset
        <select name="preset" className={inputClass} defaultValue="">
          <option value="">Custom / keep current</option>
          {PROVIDER_PRESETS.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="provider" label="Adapter" defaultValue={defaults?.provider || preset?.provider} required />
        <label className={labelClass}>
          Type
          <select name="type" className={inputClass} defaultValue={defaults?.type || "API"}>
            {["API", "JSON", "XML", "RSS", "ATS", "MANUAL"].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
      </div>
      <Field name="apiUrl" label="API URL" defaultValue={defaults?.apiUrl} />
      <Field name="feedUrl" label="Feed URL" defaultValue={defaults?.feedUrl} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="apiKeyEnv" label="API key env var" defaultValue={defaults?.apiKeyEnv} placeholder="ADZUNA_APP_KEY" />
        <Field name="appIdEnv" label="App ID env var" defaultValue={defaults?.appIdEnv} placeholder="ADZUNA_APP_ID" />
      </div>
      <label className={labelClass}>
        API key
        <input className={inputClass} name="apiKey" type="password" autoComplete="off" placeholder={defaults?.hasApiKey ? "Saved on the server. Leave blank to keep it." : "Optional. Prefer an environment variable."} />
      </label>
      <p className="text-xs text-muted">Keys stay on the server. This form never displays a stored key.</p>
      <fieldset>
        <legend className={labelClass}>UAE location filter</legend>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {EMIRATES.map((emirate) => (
            <label key={emirate.slug} className="flex items-center gap-2">
              <input type="checkbox" name="locationFilter" value={emirate.slug} defaultChecked={defaults?.locationFilter.includes(emirate.slug)} />
              {emirate.name}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="syncInterval" label="Sync interval (minutes)" type="number" defaultValue={String(defaults?.syncInterval || 60)} />
        <label className={labelClass}>
          Sync mode
          <select name="syncMode" className={inputClass} defaultValue={defaults?.syncMode || "incremental"}>
            <option value="incremental">Incremental</option>
            <option value="snapshot">Snapshot</option>
          </select>
        </label>
      </div>
      <Field name="attributionText" label="Attribution" defaultValue={defaults?.attributionText} />
      <Field name="termsUrl" label="Terms URL" defaultValue={defaults?.termsUrl} />
      <label className={labelClass}>
        Provider config JSON
        <textarea className={`${inputClass} h-36 py-2 font-mono text-xs`} name="config" defaultValue={JSON.stringify(defaults?.config ?? {}, null, 2)} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="enabled" value="1" defaultChecked={defaults?.enabled} />
        Enabled
      </label>
      <button className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Saving..." : "Save source"}
      </button>
    </form>
  );
}

function Field({ name, label, defaultValue, placeholder, type = "text", required = false }: { name: string; label: string; defaultValue?: string; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <label className={labelClass}>
      {label}
      <input className={inputClass} name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required} />
    </label>
  );
}
