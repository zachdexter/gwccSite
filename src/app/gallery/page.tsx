import Link from "next/link";
import { db } from "@/lib/db";
import { galleryAlbums, galleryPhotos } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { siteConfig } from "@/config/site";

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

  const photosWithAlbum = allPhotos.filter((p) => p.albumId !== null);
  // eslint-disable-next-line react-hooks/purity
  const shuffled = [...photosWithAlbum].sort(() => Math.random() - 0.5).slice(0, 6);

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
        <div className="mb-12">
          <div className="text-gwcc-gold/70 text-xs uppercase tracking-[0.25em] font-semibold mb-3">
            Photos
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gwcc-light">Gallery</h1>
        </div>

        {albumsWithMeta.length === 0 ? (
          <div className="text-gwcc-light/40 text-center py-20">No photos yet.</div>
        ) : (
          <>
            {shuffled.length > 0 && (
              <div className="mb-16">
                <h2 className="text-gwcc-light/50 text-xs uppercase tracking-widest font-semibold mb-4">
                  Featured
                </h2>
                <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                  {shuffled.map((photo) => (
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
              </div>
            )}

            <div>
              <h2 className="text-gwcc-light/50 text-xs uppercase tracking-widest font-semibold mb-4">
                Albums
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {albumsWithMeta.map((album) => (
                  <Link
                    key={album.id}
                    href={`/gallery/${album.id}`}
                    className="group rounded-lg overflow-hidden border border-white/8 bg-gwcc-navy hover:border-gwcc-gold/30 transition-colors"
                  >
                    <div className="aspect-video bg-gwcc-dark overflow-hidden">
                      {album.coverPhotoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={album.coverPhotoUrl}
                          alt={album.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gwcc-light/20 text-xs">
                          No photos
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-gwcc-light font-medium text-sm">{album.name}</p>
                      <p className="text-gwcc-light/40 text-xs mt-0.5">{album.photoCount} photos</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-white/8 px-6 py-5 flex items-center justify-between text-xs text-gwcc-light/25">
        <Link href="/" className="hover:text-gwcc-light/50 transition-colors">← Home</Link>
        <Link href="/login" className="hover:text-gwcc-light/50 transition-colors">Eboard Login</Link>
      </footer>
    </div>
  );
}
