import { auth } from "@/auth";
import { db } from "@/lib/db";
import { members, subsidyChanges } from "@/lib/db/schema";
import { pick } from "@/lib/pick";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const all = await db.select().from(members).orderBy(members.name);
    return NextResponse.json(all);
  } catch (err) {
    console.error("[members:GET]", err);
    return NextResponse.json({ error: "Failed to load members." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, isSubsidized } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  try {
    const [member] = await db
      .insert(members)
      .values({ name, email: email || null, isSubsidized: Boolean(isSubsidized) })
      .returning();

    await db.insert(subsidyChanges).values({
      memberId: member.id,
      isSubsidized: member.isSubsidized,
      changedAt: member.createdAt,
    });

    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error("[members:POST]", err);
    return NextResponse.json({ error: "Failed to create member." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const updates = pick(body, ["name", "email", "isSubsidized", "isActive", "notes"]);

  try {
    const [updated] = await db
      .update(members)
      .set(updates)
      .where(eq(members.id, id))
      .returning();

    if ("isSubsidized" in updates) {
      await db.insert(subsidyChanges).values({
        memberId: id,
        isSubsidized: updated.isSubsidized,
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[members:PATCH]", err);
    return NextResponse.json({ error: "Failed to update member." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  try {
    await db.update(members).set({ isActive: false }).where(eq(members.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[members:DELETE]", err);
    return NextResponse.json({ error: "Failed to remove member." }, { status: 500 });
  }
}
