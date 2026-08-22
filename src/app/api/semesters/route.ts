import { auth } from "@/auth";
import { db } from "@/lib/db";
import { semesters } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const all = await db.select().from(semesters).orderBy(semesters.createdAt);
    return NextResponse.json(all);
  } catch (err) {
    console.error("[semesters:GET]", err);
    return NextResponse.json({ error: "Failed to load semesters." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, startDate, endDate } = await req.json();
  if (!name || !startDate || !endDate) {
    return NextResponse.json({ error: "name, startDate, endDate required" }, { status: 400 });
  }

  try {
    const [semester] = await db
      .insert(semesters)
      .values({ name, startDate, endDate })
      .returning();

    return NextResponse.json(semester, { status: 201 });
  } catch (err) {
    console.error("[semesters:POST]", err);
    return NextResponse.json({ error: "Failed to create semester." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "president")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, activate, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    if (activate) {
      // Single atomic statement: every row's isActive is set based on whether
      // it matches `id`, so there's no window where zero or two semesters are active.
      await db.update(semesters).set({ isActive: sql`${semesters.id} = ${id}` });
      return NextResponse.json({ ok: true });
    }

    const [updated] = await db
      .update(semesters)
      .set(updates)
      .where(eq(semesters.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[semesters:PATCH]", err);
    return NextResponse.json({ error: "Failed to update semester." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "president")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();

  try {
    await db.delete(semesters).where(eq(semesters.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[semesters:DELETE]", err);
    return NextResponse.json({ error: "Failed to delete semester." }, { status: 500 });
  }
}
