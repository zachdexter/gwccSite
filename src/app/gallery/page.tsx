import { db } from "@/lib/db";
import { galleryAlbums, galleryPhotos } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { PageTransition } from "@/components/PageTransition";
import { AlbumGrid } from "@/components/AlbumGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { GalleryHeaderIcons, GallerySideFrame } from "@/components/GalleryDecorIcons";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const albums = await db.select().from(galleryAlbums).orderBy(desc(galleryAlbums.createdAt));
  const allPhotos = await db.select().from(galleryPhotos);

  const albumsWithMeta = albums.map((album) => {
    const albumPhotos = allPhotos
      .filter((p) => p.albumId === album.id)
      .sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
    return {
      ...album,
      photoCount: albumPhotos.length,
      coverPhotoUrl: albumPhotos[0]?.secureUrl ?? null,
    };
  });

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-background flex flex-col">
        <GallerySideFrame />
        <SiteHeader />

        <main className="flex-1 px-6 py-16 max-w-6xl mx-auto w-full">
          <div id="decor-header-zone" className="relative py-14 mb-12">
            <GalleryHeaderIcons />
            <div className="font-heading text-gwcc-gold/70 text-sm uppercase tracking-[0.25em] mb-3">
              Photos
            </div>
            <h1 className="font-heading text-5xl md:text-6xl leading-tight text-foreground">Gallery</h1>
          </div>

          <div id="decor-content-end">
            {albumsWithMeta.length === 0 ? (
              <div className="text-muted-foreground text-center py-20">No photos yet.</div>
            ) : (
              <div>
                <h2 className="font-heading text-muted-foreground text-sm uppercase tracking-widest mb-4">
                  Albums
                </h2>
                <AlbumGrid albums={albumsWithMeta} />
              </div>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
