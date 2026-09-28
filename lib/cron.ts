import { timingSafeEqual } from "node:crypto";

export function cronAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const header = request.headers.get("x-cron-secret") || "";
  return safeEqual(bearer, secret) || safeEqual(header, secret);
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
