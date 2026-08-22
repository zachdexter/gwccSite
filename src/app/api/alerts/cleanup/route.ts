import { auth } from "@/auth";
import { db } from "@/lib/db";
import { alerts } from "@/lib/db/schema";
import { isValidCronSecret } from "@/lib/cronAuth";
import { lt } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Accept Vercel cron secret or a valid admin session
  const authHeader = req.headers.get("authorization");

  if (!isValidCronSecret(authHeader)) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.delete(alerts).where(lt(alerts.expiresAt, new Date()));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[alerts/cleanup:GET]", err);
    return NextResponse.json({ error: "Failed to clean up alerts." }, { status: 500 });
  }
}
