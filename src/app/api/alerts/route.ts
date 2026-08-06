import { auth } from "@/auth";
import { db } from "@/lib/db";
import { alerts } from "@/lib/db/schema";
import { eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const active = await db
      .select()
      .from(alerts)
      .where(gt(alerts.expiresAt, new Date()));
    return NextResponse.json(active);
  } catch (err) {
    console.error("[alerts:GET]", err);
    return NextResponse.json({ error: "Failed to load alerts." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, expiresAt } = await req.json();
  if (!message || !expiresAt) {
    return NextResponse.json({ error: "message and expiresAt required" }, { status: 400 });
  }

  try {
    const [created] = await db
      .insert(alerts)
      .values({ message, expiresAt: new Date(expiresAt) })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[alerts:POST]", err);
    return NextResponse.json({ error: "Failed to create alert." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  try {
    await db.delete(alerts).where(eq(alerts.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[alerts:DELETE]", err);
    return NextResponse.json({ error: "Failed to delete alert." }, { status: 500 });
  }
}
