import { auth } from "@/auth";
import { db } from "@/lib/db";
import { externalLinks } from "@/lib/db/schema";
import { pick } from "@/lib/pick";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const EDITABLE_FIELDS = ["label", "url", "description", "isActive"] as const;

function isValidUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const all = await db.select().from(externalLinks).orderBy(externalLinks.label);
    return NextResponse.json(all);
  } catch (err) {
    console.error("[links:GET]", err);
    return NextResponse.json({ error: "Failed to load links." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  if (body.url !== undefined && !isValidUrl(body.url)) {
    return NextResponse.json({ error: "URL is not valid." }, { status: 400 });
  }

  const updates = pick(body, EDITABLE_FIELDS);

  try {
    const [updated] = await db
      .update(externalLinks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(externalLinks.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[links:PATCH]", err);
    return NextResponse.json({ error: "Failed to update link." }, { status: 500 });
  }
}
