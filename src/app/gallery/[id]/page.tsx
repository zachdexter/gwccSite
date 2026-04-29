import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { galleryAlbums, galleryPhotos } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { siteConfig } from "@/config/site";

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
    <div className="min-h-screen bg-gwcc-dark flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/8">
        <Link href="/" className="text-gwcc-gold font-bold tracking-widest text-sm uppercase">
          GWCC
        </Link>
        <nav className="flex items-center gap-6 text-sm text-gwcc-light/60">
          <Link href="/comp" className="hover:text-gwcc-light transition-colors">Comp Team</Link>
          <Link href="/gallery" className="text-gwcc-light">Gallery</Link>
          <a href={siteConfig.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gwcc-light transition-colors">
            Instagram
          </a>
        </nav>
      </header>

      <main className="flex-1 px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="mb-4">
          <Link
            href="/gallery"
            className="text-gwcc-light/40 hover:text-gwcc-light text-sm transition-colors"
          >
            ← Gallery
          </Link>
        </div>

        <div className="mb-12">
          <div className="text-gwcc-gold/70 text-xs uppercase tracking-[0.25em] font-semibold mb-3">
            Album
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gwcc-light">{album.name}</h1>
          {album.description && (
            <p className="text-gwcc-light/50 mt-3 text-lg">{album.description}</p>
          )}
          <p className="text-gwcc-light/30 text-sm mt-2">{photos.length} photos</p>
        </div>

        {photos.length === 0 ? (
          <div className="text-gwcc-light/40 text-center py-20">No photos in this album.</div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid rounded-lg overflow-hidden bg-gwcc-navy border border-white/8"
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

      <footer className="border-t border-white/8 px-6 py-5 flex items-center justify-between text-xs text-gwcc-light/25">
        <Link href="/" className="hover:text-gwcc-light/50 transition-colors">← Home</Link>
        <Link href="/login" className="hover:text-gwcc-light/50 transition-colors">Eboard Login</Link>
      </footer>
    </div>
  );
}
