import { db } from "@/lib/db";
import { alerts } from "@/lib/db/schema";
import { lt } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  await db.delete(alerts).where(lt(alerts.expiresAt, new Date()));
  return NextResponse.json({ ok: true });
}
