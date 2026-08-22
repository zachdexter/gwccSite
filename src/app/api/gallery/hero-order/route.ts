import { auth } from "@/auth";
import { db } from "@/lib/db";
import { galleryPhotos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json();
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "number")) {
    return NextResponse.json({ error: "ids must be an array of numbers" }, { status: 400 });
  }

  try {
    await Promise.all(
      ids.map((id, i) =>
        db.update(galleryPhotos).set({ heroDisplayOrder: i }).where(eq(galleryPhotos.id, id))
      )
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[gallery/hero-order:PATCH]", err);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}
