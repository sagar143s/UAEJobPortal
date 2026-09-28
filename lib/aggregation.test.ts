import { describe, expect, it } from "vitest";
import { decideDuplicate } from "@/lib/job-sources/types";
import { finalizeJob } from "@/lib/job-sources/finalize";
import type { AdapterContext } from "@/lib/job-sources/types";
import { detectEmirate, resolveEmirate } from "@/lib/uae/emirates";
import { classifyExperience } from "@/lib/uae/classify";
import { extractWalkIn } from "@/lib/uae/walk-in";
import { parseSeoSlug } from "@/lib/seo/routes";
import { shouldExpire } from "@/lib/sync/expiration";
import { buildJobPosting } from "@/lib/seo/job-posting";

const context: AdapterContext = {
  source: {
    id: "1",
    name: "JSON feed",
    slug: "json-feed",
    type: "JSON",
    provider: "json-feed",
    country: "AE",
    locationFilter: [],
    syncMode: "snapshot",
    attributionText: "Source feed",
    config: {},
  },
  secrets: {},
};

describe("UAE classification", () => {
  it("maps emirates and ignores other countries", () => {
    expect(detectEmirate("Dubai, United Arab Emirates")).toBe("dubai");
    expect(detectEmirate("Al Ain, Abu Dhabi")).toBe("al-ain");
    expect(detectEmirate("Ras Al Khaimah")).toBe("ras-al-khaimah");
    expect(resolveEmirate("London, United Kingdom")).toBeNull();
    expect(resolveEmirate("Mumbai, India")).toBeNull();
  });

  it("does not treat a foreign listing as UAE just because the source country is AE", () => {
    const job = finalizeJob(
      {
        title: "Accountant",
        company: "Northwind Books",
        location: "London",
        description: "Office role",
        sourceJobId: "99",
        applicationUrl: "https://jobs.example.com/99",
      },
      context,
    );
    expect(job).toBeNull();
  });
});

describe("normalization", () => {
  it("keeps a real Dubai listing and drops predicted salary", () => {
    const job = finalizeJob(
      {
        title: "React Developer",
        company: "Harbor Systems",
        location: "Dubai, UAE",
        description: "Build internal tools. 3-5 years.",
        salaryMin: 8000,
        salaryMax: 12000,
        currency: "AED",
        predictedSalary: true,
        sourceJobId: "42",
        applicationUrl: "https://jobs.example.com/42",
        publishedAt: "2026-09-01T08:00:00Z",
      },
      context,
    );
    expect(job?.emirate).toBe("dubai");
    expect(job?.salaryMin).toBeUndefined();
    expect(job?.experience).toBe("3-5");
    expect(job?.categorySlug).toBe("it");
    expect(job?.attributionText).toBe("Source feed");
  });

  it("classifies fresher text without inventing a salary", () => {
    expect(classifyExperience("Fresh graduate, no experience required")).toBe("fresher");
  });
});

describe("walk-in interviews", () => {
  it("requires a real date", () => {
    expect(extractWalkIn({ title: "Walk-in interview", description: "Come to the office" }, new Date("2026-09-27T10:00:00+04:00"))).toBeUndefined();
    const found = extractWalkIn(
      { title: "Walk-in interview", description: "27 September 2026, 10:00 AM to 1:00 PM" },
      new Date("2026-09-01T10:00:00+04:00"),
    );
    expect(found).toBeTruthy();
    expect(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit" }).format(found!.interviewDate)).toBe("2026-09-27");
  });
});

describe("duplicates and expiry", () => {
  it("updates the same external id and skips a fingerprint match", () => {
    expect(decideDuplicate({ existingByExternalId: true, identicalContent: false, existingByFingerprint: false })).toBe("update");
    expect(decideDuplicate({ existingByExternalId: true, identicalContent: true, existingByFingerprint: false })).toBe("duplicate");
    expect(decideDuplicate({ existingByExternalId: false, identicalContent: false, existingByFingerprint: true })).toBe("duplicate");
    expect(decideDuplicate({ existingByExternalId: false, identicalContent: false, existingByFingerprint: false })).toBe("create");
  });

  it("expires by date and leaves manual jobs alone when unseen", () => {
    const now = new Date("2026-09-27T12:00:00Z");
    expect(shouldExpire({ status: "ACTIVE", expiresAt: new Date("2026-09-01T00:00:00Z"), sourceType: "API" }, now, 21)).toBe(true);
    expect(
      shouldExpire(
        { status: "ACTIVE", lastSeenAt: new Date("2026-08-01T00:00:00Z"), sourceType: "MANUAL" },
        now,
        21,
      ),
    ).toBe(false);
  });
});

describe("SEO", () => {
  it("parses location and category paths", () => {
    expect(parseSeoSlug("jobs-in-dubai")).toEqual({ kind: "location", emirate: "dubai" });
    expect(parseSeoSlug("it-jobs-in-abu-dhabi")?.kind).toBe("category-location");
    expect(parseSeoSlug("walk-in-interviews-in-sharjah")?.kind).toBe("walkin-location");
    expect(parseSeoSlug("login")).toBeNull();
  });

  it("omits JobPosting schema when the source did not provide a date or salary period", () => {
    expect(
      buildJobPosting({
        title: "Accountant",
        description: "Ledger work",
        company: "Harbor Systems",
        location: "Dubai",
        emirate: "dubai",
        applicationUrl: "https://jobs.example.com/1",
        applicationType: "external",
        sourceName: "Feed",
        sourceJobId: "1",
        slug: "accountant-abc",
        salaryMin: 5000,
        currency: "AED",
      }),
    ).toBeNull();
  });
});
