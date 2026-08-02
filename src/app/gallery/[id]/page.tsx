import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { galleryAlbums, galleryPhotos } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PageTransition } from "@/components/PageTransition";
import { NavLinks } from "@/components/NavLinks";

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
    .orderBy(desc(galleryPhotos.uploadedAt));

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
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid rounded-lg overflow-hidden bg-card border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.secureUrl}
                    alt={photo.filename}
                    className="w-full h-auto block"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="border-t border-border px-6 py-5 flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">← Home</Link>
          <Link href="/login" className="hover:text-foreground transition-colors">Eboard Login</Link>
        </footer>
      </div>
    </PageTransition>
  );
}
