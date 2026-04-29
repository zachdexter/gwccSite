import { auth } from "@/auth";
import { db } from "@/lib/db";
import { compMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const all = await db
    .select()
    .from(compMembers)
    .where(eq(compMembers.isActive, true))
    .orderBy(compMembers.displayOrder, compMembers.name);

  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const [member] = await db.insert(compMembers).values(body).returning();
  return NextResponse.json(member, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...updates } = await req.json();
  const [updated] = await db
    .update(compMembers)
    .set(updates)
    .where(eq(compMembers.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await db.update(compMembers).set({ isActive: false }).where(eq(compMembers.id, id));
  return NextResponse.json({ ok: true });
}
