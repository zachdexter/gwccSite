import { auth } from "@/auth";
import { db } from "@/lib/db";
import { galleryPhotos } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// Photos and albums are managed via Google Drive sync (see /api/sync-gallery).
// This route only supports reading photos and choosing an album's cover/hero photo.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const albumIdParam = searchParams.get("albumId");

  const query = db.select().from(galleryPhotos).orderBy(desc(galleryPhotos.uploadedAt));

  if (albumIdParam) {
    const albumId = parseInt(albumIdParam);
    if (!isNaN(albumId)) {
      const photos = await db
        .select()
        .from(galleryPhotos)
        .where(eq(galleryPhotos.albumId, albumId))
        .orderBy(desc(galleryPhotos.uploadedAt));
      return NextResponse.json(photos);
    }
  }

  const photos = await query;
  return NextResponse.json(photos);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, isShowcase } = await req.json();
  if (typeof id !== "number") return NextResponse.json({ error: "id required" }, { status: 400 });
  if (typeof isShowcase !== "boolean") {
    return NextResponse.json({ error: "isShowcase required" }, { status: 400 });
  }

  const [target] = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, id));
  if (!target) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  if (isShowcase && target.albumId !== null) {
    await db
      .update(galleryPhotos)
      .set({ isShowcase: false })
      .where(and(eq(galleryPhotos.albumId, target.albumId), eq(galleryPhotos.isShowcase, true)));
  }

  const [photo] = await db
    .update(galleryPhotos)
    .set({ isShowcase })
    .where(eq(galleryPhotos.id, id))
    .returning();

  return NextResponse.json(photo);
}
