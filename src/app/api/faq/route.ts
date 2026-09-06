import { auth } from "@/auth";
import { db } from "@/lib/db";
import { faqQuestions } from "@/lib/db/schema";
import { pick } from "@/lib/pick";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const EDITABLE_FIELDS = ["question", "answer", "displayOrder", "isActive"] as const;

export async function GET() {
  try {
    const all = await db
      .select()
      .from(faqQuestions)
      .where(eq(faqQuestions.isActive, true))
      .orderBy(faqQuestions.displayOrder);

    return NextResponse.json(all);
  } catch (err) {
    console.error("[faq:GET]", err);
    return NextResponse.json({ error: "Failed to load FAQ." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const values = pick(body, EDITABLE_FIELDS);

  try {
    const [question] = await db.insert(faqQuestions).values(values).returning();
    return NextResponse.json(question, { status: 201 });
  } catch (err) {
    console.error("[faq:POST]", err);
    return NextResponse.json({ error: "Failed to create question." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const updates = pick(body, EDITABLE_FIELDS);

  try {
    const [updated] = await db
      .update(faqQuestions)
      .set(updates)
      .where(eq(faqQuestions.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[faq:PATCH]", err);
    return NextResponse.json({ error: "Failed to update question." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  try {
    await db.update(faqQuestions).set({ isActive: false }).where(eq(faqQuestions.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[faq:DELETE]", err);
    return NextResponse.json({ error: "Failed to remove question." }, { status: 500 });
  }
}
