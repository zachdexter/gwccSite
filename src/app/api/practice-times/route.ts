import { auth } from "@/auth";
import { db } from "@/lib/db";
import { practiceTimes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { sortPracticeTimes } from "@/lib/practiceTimes";

export async function GET() {
  const all = await db.select().from(practiceTimes);
  return NextResponse.json(sortPracticeTimes(all));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { day, startTime, endTime, displayOrder } = await req.json();
  if (!day || !startTime || !endTime) {
    return NextResponse.json({ error: "day, startTime, endTime required" }, { status: 400 });
  }

  const [created] = await db
    .insert(practiceTimes)
    .values({ day, startTime, endTime, displayOrder: displayOrder ?? 0 })
    .returning();

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [updated] = await db
    .update(practiceTimes)
    .set(updates)
    .where(eq(practiceTimes.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await db.delete(practiceTimes).where(eq(practiceTimes.id, id));
  return NextResponse.json({ ok: true });
}
