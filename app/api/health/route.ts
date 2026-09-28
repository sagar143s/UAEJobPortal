import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const db = await connectDB();
  return NextResponse.json({
    ok: true,
    database: db ? "connected" : "not_configured",
  });
}
