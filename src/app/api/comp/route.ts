import { auth } from "@/auth";
import { db } from "@/lib/db";
import { compMembers } from "@/lib/db/schema";
import { pick } from "@/lib/pick";
import { deleteFromCloudinary, getPublicIdFromUrl } from "@/lib/cloudinary";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const EDITABLE_FIELDS = [
  "name",
  "year",
  "events",
  "bio",
  "headshotUrl",
  "displayOrder",
  "isActive",
] as const;

export async function GET() {
  try {
    const all = await db
      .select()
      .from(compMembers)
      .where(eq(compMembers.isActive, true))
      .orderBy(compMembers.displayOrder, compMembers.name);

    return NextResponse.json(all);
  } catch (err) {
    console.error("[comp:GET]", err);
    return NextResponse.json({ error: "Failed to load comp team." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const values = pick(body, EDITABLE_FIELDS);

  try {
    const [member] = await db.insert(compMembers).values(values).returning();
    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error("[comp:POST]", err);
    return NextResponse.json({ error: "Failed to create comp member." }, { status: 500 });
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
    let previousHeadshotUrl: string | null = null;
    if (updates.headshotUrl !== undefined) {
      const [existing] = await db
        .select({ headshotUrl: compMembers.headshotUrl })
        .from(compMembers)
        .where(eq(compMembers.id, id));
      if (existing && existing.headshotUrl && existing.headshotUrl !== updates.headshotUrl) {
        previousHeadshotUrl = existing.headshotUrl;
      }
    }

    const [updated] = await db
      .update(compMembers)
      .set(updates)
      .where(eq(compMembers.id, id))
      .returning();

    if (previousHeadshotUrl) {
      const publicId = getPublicIdFromUrl(previousHeadshotUrl);
      if (publicId) {
        deleteFromCloudinary(publicId).catch((err) =>
          console.error("[comp] Failed to delete old headshot from Cloudinary", err)
        );
      }
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[comp:PATCH]", err);
    return NextResponse.json({ error: "Failed to update comp member." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  try {
    await db.update(compMembers).set({ isActive: false }).where(eq(compMembers.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[comp:DELETE]", err);
    return NextResponse.json({ error: "Failed to remove comp member." }, { status: 500 });
  }
}
