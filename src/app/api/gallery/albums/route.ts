import { db } from "@/lib/db";
import { galleryAlbums, galleryPhotos } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// Albums themselves are managed via Google Drive sync (see /api/sync-gallery).
// This route only supports reading albums with their cover photo.

export async function GET() {
  try {
    const albums = await db.select().from(galleryAlbums).orderBy(desc(galleryAlbums.createdAt));
    const photos = await db.select().from(galleryPhotos);

    const albumsWithMeta = albums.map((album) => {
      const albumPhotos = photos.filter((p) => p.albumId === album.id);
      const cover =
        albumPhotos.find((p) => p.isShowcase) ??
        albumPhotos.sort(
          (a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        )[0];
      return {
        ...album,
        photoCount: albumPhotos.length,
        coverPhotoUrl: cover?.secureUrl ?? null,
      };
    });

    return NextResponse.json(albumsWithMeta);
  } catch (err) {
    console.error("[gallery/albums:GET]", err);
    return NextResponse.json({ error: "Failed to load albums." }, { status: 500 });
  }
}
