import { NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cron";
import { expireStaleJobs } from "@/lib/sync/engine";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await expireStaleJobs());
}

export async function POST(request: Request) {
  return GET(request);
}
