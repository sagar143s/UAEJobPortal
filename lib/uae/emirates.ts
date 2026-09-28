import { hasPhrase } from "@/lib/utils";

export const EMIRATES = [
  {
    slug: "al-ain",
    name: "Al Ain",
    short: "Al Ain",
    patterns: ["al ain", "al-ain", "alain"],
  },
  {
    slug: "ras-al-khaimah",
    name: "Ras Al Khaimah",
    short: "RAK",
    patterns: ["ras al khaimah", "ras al-khaimah", "ras-al-khaimah", "rak"],
  },
  {
    slug: "umm-al-quwain",
    name: "Umm Al Quwain",
    short: "UAQ",
    patterns: ["umm al quwain", "umm al-quwain", "umm-al-quwain", "uaq"],
  },
  {
    slug: "abu-dhabi",
    name: "Abu Dhabi",
    short: "Abu Dhabi",
    patterns: [
      "abu dhabi",
      "abu-dhabi",
      "abudhabi",
      "yas island",
      "saadiyat",
      "khalifa city",
      "mussafah",
      "reem island",
      "al reem",
    ],
  },
  {
    slug: "dubai",
    name: "Dubai",
    short: "Dubai",
    patterns: [
      "dubai",
      "business bay",
      "dubai marina",
      "jumeirah",
      "deira",
      "bur dubai",
      "difc",
      "jlt",
      "jebel ali",
      "jafza",
      "dafza",
      "al quoz",
      "al barsha",
      "media city",
      "internet city",
      "silicon oasis",
      "sports city",
      "motor city",
      "arabian ranches",
      "mirdif",
      "karama",
    ],
  },
  {
    slug: "sharjah",
    name: "Sharjah",
    short: "Sharjah",
    patterns: ["sharjah", "muwaileh", "al nahda sharjah"],
  },
  {
    slug: "ajman",
    name: "Ajman",
    short: "Ajman",
    patterns: ["ajman"],
  },
  {
    slug: "fujairah",
    name: "Fujairah",
    short: "Fujairah",
    patterns: ["fujairah", "fujayrah"],
  },
] as const;

export type EmirateSlug = (typeof EMIRATES)[number]["slug"] | "uae";

const UAE_PATTERNS = ["united arab emirates", "u.a.e", "uae"];

const FOREIGN_PATTERNS = [
  "india",
  "pakistan",
  "philippines",
  "bangladesh",
  "united states",
  "u.s.a",
  "usa",
  "united kingdom",
  "london",
  "saudi arabia",
  "ksa",
  "qatar",
  "doha",
  "kuwait",
  "oman",
  "muscat",
  "bahrain",
  "manama",
  "egypt",
  "cairo",
  "canada",
  "australia",
  "singapore",
  "germany",
  "france",
  "nigeria",
  "kenya",
  "south africa",
  "worldwide",
  "anywhere",
];

export function emirateBySlug(slug: string | undefined | null) {
  return EMIRATES.find((emirate) => emirate.slug === slug);
}

export function emirateName(slug: string | undefined | null): string {
  if (!slug || slug === "uae") return "UAE";
  return emirateBySlug(slug)?.name ?? slug;
}

export function detectEmirate(location: string): EmirateSlug | null {
  const text = location.toLowerCase();
  for (const emirate of EMIRATES) {
    if (emirate.patterns.some((pattern) => hasPhrase(text, pattern))) {
      return emirate.slug;
    }
  }
  if (UAE_PATTERNS.some((pattern) => hasPhrase(text, pattern))) return "uae";
  return null;
}

export function containsForeignCountry(location: string): boolean {
  const text = location.toLowerCase();
  if (detectEmirate(text)) return false;
  return FOREIGN_PATTERNS.some((pattern) => hasPhrase(text, pattern));
}

export function resolveEmirate(
  location: string,
  options?: { assumeUae?: boolean; defaultEmirate?: string },
): EmirateSlug | null {
  const detected = detectEmirate(location);
  if (detected) return detected;
  if (containsForeignCountry(location)) return null;
  if (!options?.assumeUae) return null;
  const fallback = options.defaultEmirate || "uae";
  if (fallback === "uae" || emirateBySlug(fallback)) return fallback as EmirateSlug;
  return "uae";
}

export function passesLocationFilter(emirate: string, filter: string[]): boolean {
  if (!filter.length) return true;
  const allowed = new Set(filter.map((item) => item.toLowerCase()));
  if (allowed.has(emirate)) return true;
  if (allowed.has("uae")) return true;
  return false;
}

export function mapProviderLocation(
  location: string,
  mapping?: Record<string, string>,
): string {
  if (!mapping) return location;
  const key = location.trim().toLowerCase();
  return mapping[key] ?? location;
}
