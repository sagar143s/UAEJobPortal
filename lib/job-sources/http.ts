import { redactSecrets } from "@/lib/utils";

const USER_AGENT = "UAEJobPortal/1.0 (+https://uaejobportal.online)";

export async function fetchProvider(
  url: string,
  init?: RequestInit,
  timeoutMs = 20000,
): Promise<{ status: number; text: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: "follow",
      cache: "no-store",
      headers: {
        Accept: "application/json, application/xml, text/xml, application/rss+xml, */*",
        "User-Agent": USER_AGENT,
        ...(init?.headers ?? {}),
      },
    });
    const text = await response.text();
    if (response.status === 429) {
      throw new Error("Provider rate limit reached. Sync stopped without retrying.");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("Provider refused access. Check the API credentials and the provider terms.");
    }
    if (response.status === 404) {
      throw new Error("Provider URL was not found.");
    }
    if (!response.ok) {
      throw new Error(`Provider request failed with status ${response.status}.`);
    }
    return { status: response.status, text };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Provider request timed out.");
    }
    if (error instanceof Error) {
      throw new Error(redactSecrets(error.message));
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchProviderJson<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const { text } = await fetchProvider(url, init);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Provider did not return JSON.");
  }
}
