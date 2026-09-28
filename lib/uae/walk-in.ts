import { findExplicitDate, findTimeRange } from "@/lib/time";
import { cleanText, parseDate } from "@/lib/utils";

export interface WalkInDetails {
  interviewDate: Date;
  startTime?: string;
  endTime?: string;
  contact?: string;
  email?: string;
  address?: string;
  mapUrl?: string;
}

const WALK_IN = /walk[\s-]?in(\s+interview)?/i;

export function extractWalkIn(
  input: {
    title?: string;
    description?: string;
    structured?: Partial<{
      interviewDate: unknown;
      startTime: unknown;
      endTime: unknown;
      contact: unknown;
      email: unknown;
      address: unknown;
      mapUrl: unknown;
    }>;
  },
  now = new Date(),
): WalkInDetails | undefined {
  const structuredDate = parseDate(input.structured?.interviewDate);
  if (structuredDate) {
    return {
      interviewDate: structuredDate,
      startTime: cleanText(input.structured?.startTime) || undefined,
      endTime: cleanText(input.structured?.endTime) || undefined,
      contact: cleanText(input.structured?.contact) || undefined,
      email: cleanText(input.structured?.email) || undefined,
      address: cleanText(input.structured?.address) || undefined,
      mapUrl: cleanText(input.structured?.mapUrl) || undefined,
    };
  }

  const blob = `${input.title ?? ""}\n${input.description ?? ""}`;
  if (!WALK_IN.test(blob)) return undefined;
  const interviewDate = findExplicitDate(blob, now);
  if (!interviewDate) return undefined;
  const times = findTimeRange(blob);
  const email = blob.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  return {
    interviewDate,
    startTime: times.startTime,
    endTime: times.endTime,
    email,
  };
}
