import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanText(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

export function htmlToText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 50000);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function stableHash(input: string): string {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) + hash + input.charCodeAt(index);
    hash |= 0;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function hasPhrase(text: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "i").test(text);
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function asArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value == null) return [];
  return [value as T];
}

export function positiveNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    if (Number.isFinite(parsed) && parsed > 0) return Math.round(parsed);
  }
  return undefined;
}

export function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value > 10_000_000_000 ? value : value * 1000);
    if (!Number.isNaN(date.getTime())) return date;
  }
  if (typeof value !== "string" || !value.trim()) return undefined;
  const date = new Date(value.trim());
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function assertPublicHttpUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Feed URL is not a valid URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Feed URL must use http or https.");
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host === "metadata.google.internal"
  ) {
    throw new Error("Feed URL must be a public address.");
  }
  if (
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host) ||
    host.startsWith("fc") ||
    host.startsWith("fd") ||
    host.startsWith("fe80")
  ) {
    throw new Error("Feed URL must be a public address.");
  }
  return url;
}

export function redactSecrets(value: string): string {
  return value
    .replace(/(app_key|app_id|api_key|apikey|token|key)=([^&\s]+)/gi, "$1=***")
    .replace(/\/api\/[a-z0-9_-]{8,}/gi, "/api/***");
}

export function envName(value: string | undefined | null): string | undefined {
  const name = value?.trim();
  if (!name) return undefined;
  if (!/^[A-Z][A-Z0-9_]{1,80}$/.test(name)) {
    throw new Error("Environment variable names must look like ADZUNA_APP_KEY.");
  }
  return name;
}
