import { auth } from "@/auth";
import { db } from "@/lib/db";
import { galleryAlbums, galleryPhotos } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET() {
  const albums = await db.select().from(galleryAlbums).orderBy(desc(galleryAlbums.createdAt));
  const photos = await db.select().from(galleryPhotos);

  const albumsWithMeta = albums.map((album) => {
    const albumPhotos = photos.filter((p) => p.albumId === album.id);
    const cover = albumPhotos.sort(
      (a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
    )[0];
    return {
      ...album,
      photoCount: albumPhotos.length,
      coverPhotoUrl: cover?.secureUrl ?? null,
    };
  });

  return NextResponse.json(albumsWithMeta);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const [album] = await db.insert(galleryAlbums).values({ name, description }).returning();
  return NextResponse.json(album, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name } = await req.json();
  if (!id || !name) return NextResponse.json({ error: "id and name required" }, { status: 400 });

  const [album] = await db
    .update(galleryAlbums)
    .set({ name })
    .where(eq(galleryAlbums.id, id))
    .returning();

  return NextResponse.json(album);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const photos = await db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.albumId, id));

  await Promise.all(photos.map((p) => deleteFromCloudinary(p.cloudinaryId)));

  await db.delete(galleryAlbums).where(eq(galleryAlbums.id, id));

  return NextResponse.json({ ok: true });
}
