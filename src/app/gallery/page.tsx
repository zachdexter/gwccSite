import Link from "next/link";
import { db } from "@/lib/db";
import { galleryAlbums, galleryPhotos } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { siteConfig } from "@/config/site";
import { PageTransition } from "@/components/PageTransition";
import { AlbumGrid } from "@/components/AlbumGrid";

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
            <div>
              <h2 className="text-gwcc-light/50 text-xs uppercase tracking-widest font-semibold mb-4">
                Albums
              </h2>
              <AlbumGrid albums={albumsWithMeta} />
            </div>
          )}
        </main>

        <footer className="border-t border-white/8 px-6 py-5 flex items-center justify-between text-xs text-gwcc-light/25">
          <Link href="/" className="hover:text-gwcc-light/50 transition-colors">← Home</Link>
          <Link href="/login" className="hover:text-gwcc-light/50 transition-colors">Eboard Login</Link>
        </footer>
      </div>
    </PageTransition>
  );
}
