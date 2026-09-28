const DUBAI = "Asia/Dubai";

export function dubaiDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DUBAI,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function startOfDubaiDay(date = new Date()): Date {
  return new Date(`${dubaiDateKey(date)}T00:00:00+04:00`);
}

export function addDubaiDays(date: Date, days: number): Date {
  const start = startOfDubaiDay(date);
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
}

export function isSameDubaiDay(left: Date, right: Date): boolean {
  return dubaiDateKey(left) === dubaiDateKey(right);
}

const MONTHS: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

export function findExplicitDate(text: string, now = new Date()): Date | undefined {
  const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) {
    const date = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00+04:00`);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const named = text.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s*(?:,?\s*(20\d{2}))?/i,
  );
  if (named) {
    const day = Number(named[1]);
    const month = MONTHS[named[2].toLowerCase()];
    const year = named[3] ? Number(named[3]) : yearInDubai(now);
    const date = dubaiDate(year, month, day);
    if (date) return date;
  }

  const namedFirst = text.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(20\d{2}))?/i,
  );
  if (namedFirst) {
    const month = MONTHS[namedFirst[1].toLowerCase()];
    const day = Number(namedFirst[2]);
    const year = namedFirst[3] ? Number(namedFirst[3]) : yearInDubai(now);
    const date = dubaiDate(year, month, day);
    if (date) return date;
  }

  const numeric = text.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](20\d{2})\b/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]) - 1;
    const year = Number(numeric[3]);
    const date = dubaiDate(year, month, day);
    if (date) return date;
  }

  if (/\btoday\b/i.test(text)) return startOfDubaiDay(now);
  if (/\btomorrow\b/i.test(text)) return addDubaiDays(now, 1);
  return undefined;
}

export function findTimeRange(text: string): { startTime?: string; endTime?: string } {
  const range = text.match(
    /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|–|-|until)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i,
  );
  if (!range) {
    const single = text.match(/\b(\d{1,2}:\d{2}\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm))\b/i);
    return { startTime: single?.[1]?.replace(/\s+/g, " ").toUpperCase() };
  }
  return {
    startTime: range[1].replace(/\s+/g, " ").toUpperCase(),
    endTime: range[2].replace(/\s+/g, " ").toUpperCase(),
  };
}

function yearInDubai(date: Date): number {
  return Number(dubaiDateKey(date).slice(0, 4));
}

function dubaiDate(year: number, month: number, day: number): Date | undefined {
  if (month < 0 || month > 11 || day < 1 || day > 31) return undefined;
  const date = new Date(Date.UTC(year, month, day, 0, 0, 0));
  if (date.getUTCMonth() !== month || date.getUTCDate() !== day) return undefined;
  return new Date(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00+04:00`);
}
