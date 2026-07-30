import { auth } from "@/auth";
import { db } from "@/lib/db";
import { galleryPhotos, galleryAlbums } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const photos = await db
    .select({
      id: galleryPhotos.id,
      secureUrl: galleryPhotos.secureUrl,
      filename: galleryPhotos.filename,
      uploadedAt: galleryPhotos.uploadedAt,
      albumId: galleryPhotos.albumId,
      showInHero: galleryPhotos.showInHero,
      heroDisplayOrder: galleryPhotos.heroDisplayOrder,
      albumName: galleryAlbums.name,
    })
    .from(galleryPhotos)
    .leftJoin(galleryAlbums, eq(galleryPhotos.albumId, galleryAlbums.id))
    .orderBy(desc(galleryPhotos.uploadedAt));
  return NextResponse.json(photos);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, showInHero, heroDisplayOrder } = await req.json();
  if (typeof id !== "number") return NextResponse.json({ error: "id required" }, { status: 400 });

  const update: Partial<typeof galleryPhotos.$inferInsert> = {};
  if (typeof showInHero === "boolean") update.showInHero = showInHero;
  if (typeof heroDisplayOrder === "number") update.heroDisplayOrder = heroDisplayOrder;

  const [photo] = await db
    .update(galleryPhotos)
    .set(update)
    .where(eq(galleryPhotos.id, id))
    .returning();

  return NextResponse.json(photo);
}
