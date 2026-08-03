import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { galleryAlbums, galleryPhotos } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { PageTransition } from "@/components/PageTransition";
import { NavLinks } from "@/components/NavLinks";
import { PhotoGrid } from "@/components/PhotoGrid";

export const dynamic = "force-dynamic";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const albumId = parseInt(id);
  if (isNaN(albumId)) notFound();

  const [album] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, albumId));
  if (!album) notFound();

  const photos = await db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.albumId, albumId))
    .orderBy(asc(galleryPhotos.uploadedAt));

  const showcaseIndex = photos.findIndex((p) => p.isShowcase);
  const showcasePhoto = showcaseIndex !== -1 ? photos[showcaseIndex] : photos[0];
  const orderedPhotos = showcasePhoto
    ? [showcasePhoto, ...photos.filter((p) => p.id !== showcasePhoto.id)]
    : photos;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-3.5 py-3 flex items-center justify-between border-b border-border">
          <Link href="/" className="text-gwcc-gold font-bold tracking-widest text-[8px] uppercase">
            GWCC
          </Link>
          <NavLinks />
        </header>

        <main className="flex-1 px-6 py-16 max-w-6xl mx-auto w-full">
          <div className="mb-4">
            <Link
              href="/gallery"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              ← Gallery
            </Link>
          </div>

          <div className="mb-12">
            <div className="font-heading text-gwcc-gold/70 text-sm uppercase tracking-[0.25em] mb-3">
              Album
            </div>
            <h1 className="font-heading text-5xl md:text-6xl leading-tight text-foreground">{album.name}</h1>
            {album.description && (
              <p className="text-muted-foreground mt-3 text-lg">{album.description}</p>
            )}
            <p className="text-muted-foreground text-sm mt-2">{photos.length} photos</p>
          </div>

          {photos.length === 0 ? (
            <div className="text-muted-foreground text-center py-20">No photos in this album.</div>
          ) : (
            <PhotoGrid photos={orderedPhotos} />
          )}
        </main>
      </div>
    </PageTransition>
  );
}
