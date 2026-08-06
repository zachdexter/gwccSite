import { auth } from "@/auth";
import { db } from "@/lib/db";
import { eboardMembers } from "@/lib/db/schema";
import { pick } from "@/lib/pick";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const EDITABLE_FIELDS = ["name", "role", "year", "headshotUrl", "displayOrder", "isActive"] as const;

export async function GET() {
  const all = await db
    .select()
    .from(eboardMembers)
    .where(eq(eboardMembers.isActive, true))
    .orderBy(eboardMembers.displayOrder, eboardMembers.name);

  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const values = pick(body, EDITABLE_FIELDS);
  const [member] = await db.insert(eboardMembers).values(values).returning();
  return NextResponse.json(member, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const updates = pick(body, EDITABLE_FIELDS);
  const [updated] = await db
    .update(eboardMembers)
    .set(updates)
    .where(eq(eboardMembers.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await db.update(eboardMembers).set({ isActive: false }).where(eq(eboardMembers.id, id));
  return NextResponse.json({ ok: true });
}
