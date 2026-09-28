import { auth } from "@/auth";
import { db } from "@/lib/db";
import { externalLinks } from "@/lib/db/schema";
import { pick } from "@/lib/pick";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const EDITABLE_FIELDS = ["label", "url", "description", "isActive"] as const;

// Keyed links that no longer have a page pointing at them. Kept in the DB (keyed rows
// can't be deleted) but hidden from the editor and blocked from edits.
const RETIRED_KEYS = ["email-list", "waitlist"];

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
    return NextResponse.json(all.filter((link) => !RETIRED_KEYS.includes(link.key ?? "")));
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
    const [existing] = await db.select().from(externalLinks).where(eq(externalLinks.id, id));
    if (existing?.key && RETIRED_KEYS.includes(existing.key)) {
      return NextResponse.json({ error: "This link is retired and can't be edited." }, { status: 400 });
    }

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
