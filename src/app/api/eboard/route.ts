import { auth } from "@/auth";
import { db } from "@/lib/db";
import { eboardMembers } from "@/lib/db/schema";
import { pick } from "@/lib/pick";
import { deleteFromCloudinary, getPublicIdFromUrl } from "@/lib/cloudinary";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const EDITABLE_FIELDS = [
  "name",
  "role",
  "year",
  "headshotUrl",
  "displayOrder",
  "isActive",
  "bio",
  "bioFontSize",
  "bioBold",
  "bioItalic",
] as const;

export async function GET() {
  try {
    const all = await db
      .select()
      .from(eboardMembers)
      .where(eq(eboardMembers.isActive, true))
      .orderBy(eboardMembers.displayOrder, eboardMembers.name);

    return NextResponse.json(all);
  } catch (err) {
    console.error("[eboard:GET]", err);
    return NextResponse.json({ error: "Failed to load eboard." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const values = pick(body, EDITABLE_FIELDS);

  try {
    const [member] = await db.insert(eboardMembers).values(values).returning();
    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error("[eboard:POST]", err);
    return NextResponse.json({ error: "Failed to create eboard member." }, { status: 500 });
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
        .select({ headshotUrl: eboardMembers.headshotUrl })
        .from(eboardMembers)
        .where(eq(eboardMembers.id, id));
      if (existing && existing.headshotUrl && existing.headshotUrl !== updates.headshotUrl) {
        previousHeadshotUrl = existing.headshotUrl;
      }
    }

    const [updated] = await db
      .update(eboardMembers)
      .set(updates)
      .where(eq(eboardMembers.id, id))
      .returning();

    if (previousHeadshotUrl) {
      const publicId = getPublicIdFromUrl(previousHeadshotUrl);
      if (publicId) {
        deleteFromCloudinary(publicId).catch((err) =>
          console.error("[eboard] Failed to delete old headshot from Cloudinary", err)
        );
      }
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[eboard:PATCH]", err);
    return NextResponse.json({ error: "Failed to update eboard member." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  try {
    await db.update(eboardMembers).set({ isActive: false }).where(eq(eboardMembers.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[eboard:DELETE]", err);
    return NextResponse.json({ error: "Failed to remove eboard member." }, { status: 500 });
  }
}
