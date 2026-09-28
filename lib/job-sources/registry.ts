import { createAdzunaAdapter } from "@/lib/job-sources/adzuna/adapter";
import { createAtsAdapter } from "@/lib/job-sources/ats/adapter";
import { createJoobleAdapter } from "@/lib/job-sources/jooble/adapter";
import { createJsonFeedAdapter } from "@/lib/job-sources/json-feed/adapter";
import { createManualAdapter } from "@/lib/job-sources/manual/adapter";
import { createRemotiveAdapter } from "@/lib/job-sources/remotive/adapter";
import { createRssAdapter } from "@/lib/job-sources/rss/adapter";
import type { AdapterContext, AdapterFactory, JobSourceAdapter } from "@/lib/job-sources/types";
import { createXmlFeedAdapter } from "@/lib/job-sources/xml-feed/adapter";
import { envName } from "@/lib/utils";

const adapters: Record<string, AdapterFactory> = {
  adzuna: createAdzunaAdapter,
  jooble: createJoobleAdapter,
  "json-feed": createJsonFeedAdapter,
  rss: createRssAdapter,
  "xml-feed": createXmlFeedAdapter,
  ats: createAtsAdapter,
  remotive: createRemotiveAdapter,
  manual: createManualAdapter,
};

export function listProviders() {
  return Object.keys(adapters);
}

export function createJobSourceAdapter(context: AdapterContext): JobSourceAdapter {
  const factory = adapters[context.source.provider];
  if (!factory) {
    throw new Error(
      `No adapter registered for "${context.source.provider}". Add lib/job-sources/${context.source.provider}/adapter.ts and register it in lib/job-sources/registry.ts.`,
    );
  }
  return factory(context);
}

export function resolveSecrets(source: {
  apiKey?: string | null;
  apiKeyEnv?: string | null;
  appIdEnv?: string | null;
}) {
  const apiKeyEnv = source.apiKeyEnv ? envName(source.apiKeyEnv) : undefined;
  const appIdEnv = source.appIdEnv ? envName(source.appIdEnv) : undefined;
  const apiKey = source.apiKey?.trim() || (apiKeyEnv ? process.env[apiKeyEnv]?.trim() : undefined);
  const appId = appIdEnv ? process.env[appIdEnv]?.trim() : undefined;
  return {
    apiKey: apiKey || undefined,
    appId: appId || undefined,
    apiKeyConfigured: Boolean(apiKey),
    appIdConfigured: Boolean(appId),
  };
}

export { PROVIDER_PRESETS } from "@/lib/job-sources/presets";
