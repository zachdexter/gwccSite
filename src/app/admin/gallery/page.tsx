"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Album = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  photoCount: number;
  coverPhotoUrl: string | null;
};

type Photo = {
  id: number;
  cloudinaryId: string;
  secureUrl: string;
  filename: string;
  uploadedAt: string;
  albumId: number | null;
  isShowcase: boolean;
};

export default function GalleryAdminPage() {
  const [view, setView] = useState<"albums" | "photos">("albums");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [syncing, setSyncing] = useState(false);

  async function syncFromDrive() {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync-gallery", { method: "POST" });
      if (res.ok) {
        const { added, removed, albums } = await res.json();
        toast.success(`Synced: +${added} photos, -${removed} removed, ${albums} new albums`);
        fetchAlbums();
      } else {
        const { error } = await res.json().catch(() => ({ error: "Sync failed" }));
        toast.error(error);
      }
    } catch {
      toast.error("Sync failed");
    }
    setSyncing(false);
  }

  async function fetchAlbums() {
    const res = await fetch("/api/gallery/albums");
    if (res.ok) setAlbums(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchAlbums(); }, []);

  async function fetchPhotos(albumId: number) {
    const res = await fetch(`/api/gallery?albumId=${albumId}`);
    if (res.ok) setPhotos(await res.json());
  }

  function openAlbum(album: Album) {
    setSelectedAlbum(album);
    setView("photos");
    fetchPhotos(album.id);
  }

  function backToAlbums() {
    setView("albums");
    setSelectedAlbum(null);
    setPhotos([]);
    fetchAlbums();
  }

  async function toggleShowcase(photo: Photo) {
    const isShowcase = !photo.isShowcase;
    const res = await fetch("/api/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id, isShowcase }),
    });
    if (res.ok) {
      setPhotos((prev) =>
        prev.map((p) => {
          if (p.id === photo.id) return { ...p, isShowcase };
          return isShowcase && p.isShowcase ? { ...p, isShowcase: false } : p;
        })
      );
      toast.success(isShowcase ? "Set as album cover" : "Removed as album cover");
    } else {
      toast.error("Failed to update cover photo");
    }
  }

  if (view === "photos" && selectedAlbum) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={backToAlbums}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              ← Albums
            </button>
            <span className="text-muted-foreground">·</span>
            <div>
              <h1 className="text-xl font-bold text-foreground">{selectedAlbum.name}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{photos.length} photos</p>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          Photos are managed from Google Drive. Pick one photo to use as this album&apos;s cover.
        </p>

        {photos.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No photos in this album yet. Sync from Drive to pull them in.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => toggleShowcase(photo)}
                className={`group relative aspect-square rounded-lg overflow-hidden bg-card border text-left ${
                  photo.isShowcase ? "border-gwcc-gold ring-2 ring-gwcc-gold" : "border-border"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.secureUrl}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                />
                {photo.isShowcase && (
                  <div className="absolute top-1.5 left-1.5 bg-gwcc-gold text-gwcc-dark text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded">
                    Cover
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-gwcc-gold text-sm font-medium">
                    {photo.isShowcase ? "Unset" : "Set as Cover"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gallery</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{albums.length} albums</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            render={<Link href="/admin/gallery/hero" />}
          >
            Manage Hero Carousel
          </Button>
          <Button
            onClick={syncFromDrive}
            disabled={syncing}
            variant="outline"
            className="border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
          >
            {syncing ? "Syncing…" : "Sync from Drive"}
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        Albums and photos are synced from Google Drive. Open an album to choose its cover photo.
        To choose which photos appear in the homepage hero carousel, use{" "}
        <Link href="/admin/gallery/hero" className="text-gwcc-gold hover:underline">
          Manage Hero Carousel
        </Link>
        .
      </p>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading…</div>
      ) : albums.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No albums yet. Sync from Drive to pull them in.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {albums.map((album) => (
            <div
              key={album.id}
              className="group rounded-lg overflow-hidden border border-border bg-card cursor-pointer hover:border-gwcc-gold/30 transition-colors"
              onClick={() => openAlbum(album)}
            >
              <div className="aspect-video bg-muted relative overflow-hidden">
                {album.coverPhotoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={album.coverPhotoUrl}
                    alt={album.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No photos
                  </div>
                )}
              </div>
              <div className="px-3 py-2.5">
                <p className="text-card-foreground font-medium text-sm">{album.name}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{album.photoCount} photos</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
