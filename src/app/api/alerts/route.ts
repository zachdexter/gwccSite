import { auth } from "@/auth";
import { db } from "@/lib/db";
import { alerts } from "@/lib/db/schema";
import { eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const active = await db
    .select()
    .from(alerts)
    .where(gt(alerts.expiresAt, new Date()));
  return NextResponse.json(active);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, expiresAt } = await req.json();
  if (!message || !expiresAt) {
    return NextResponse.json({ error: "message and expiresAt required" }, { status: 400 });
  }

  const [created] = await db
    .insert(alerts)
    .values({ message, expiresAt: new Date(expiresAt) })
    .returning();

  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await db.delete(alerts).where(eq(alerts.id, id));
  return NextResponse.json({ ok: true });
}
