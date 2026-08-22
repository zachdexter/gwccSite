"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ReorderableList } from "@/components/ReorderableList";

type Photo = {
  id: number;
  cloudinaryId: string;
  secureUrl: string;
  filename: string;
  uploadedAt: string;
  albumId: number | null;
  showInHero: boolean;
  heroDisplayOrder: number;
};

export default function HeroCarouselAdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [orientation, setOrientation] = useState<Record<number, "landscape" | "portrait">>({});

  function handleImgLoad(id: number, e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    setOrientation((prev) => ({
      ...prev,
      [id]: img.naturalWidth >= img.naturalHeight ? "landscape" : "portrait",
    }));
  }

  async function fetchPhotos() {
    const res = await fetch("/api/gallery");
    if (res.ok) setPhotos(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function toggleHero(photo: Photo) {
    const showInHero = !photo.showInHero;
    const res = await fetch("/api/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id, showInHero }),
    });
    if (res.ok) {
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, showInHero } : p)));
      toast.success(showInHero ? "Added to hero carousel" : "Removed from hero carousel");
    } else {
      toast.error("Failed to update photo");
    }
  }

  async function reorderSelected(reordered: Photo[]) {
    const withOrder = reordered.map((p, i) => ({ ...p, heroDisplayOrder: i }));

    setPhotos((prev) => {
      const others = prev.filter((p) => !p.showInHero);
      return [...others, ...withOrder];
    });

    const res = await fetch("/api/gallery/hero-order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((p) => p.id) }),
    });
    if (!res.ok) toast.error("Failed to save order");
  }

  const selected = photos
    .filter((p) => p.showInHero)
    .sort((a, b) => a.heroDisplayOrder - b.heroDisplayOrder);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/gallery" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
          ← Gallery
        </Link>
        <span className="text-muted-foreground">·</span>
        <h1 className="text-xl font-bold text-foreground">Hero Carousel</h1>
      </div>

      <p className="text-muted-foreground text-sm">
        Pick any photos from the gallery to show in the homepage hero carousel, and drag to set
        the order they cycle through.
      </p>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Selected photos</h2>
        {selected.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
            No photos selected yet. Choose photos below to add them to the carousel.
          </div>
        ) : (
          <ReorderableList
            items={selected}
            onReorder={reorderSelected}
            renderItem={(photo) => (
              <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.secureUrl}
                  alt={photo.filename}
                  className="w-12 h-12 object-cover rounded flex-shrink-0"
                />
                <span className="text-sm text-card-foreground truncate flex-1">{photo.filename}</span>
              </div>
            )}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">All photos</h2>
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading…</div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No photos yet. Sync from Drive on the Gallery page first.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo) => {
              const isPortrait = orientation[photo.id] === "portrait";
              const disabled = isPortrait && !photo.showInHero;
              return (
                <button
                  key={photo.id}
                  onClick={() => !disabled && toggleHero(photo)}
                  disabled={disabled}
                  title={disabled ? "Portrait photos aren't supported in the hero carousel" : undefined}
                  className={`group relative aspect-square rounded-lg overflow-hidden bg-card border text-left ${
                    photo.showInHero
                      ? "border-gwcc-gold ring-2 ring-gwcc-gold"
                      : disabled
                        ? "border-border opacity-40 cursor-not-allowed"
                        : "border-border"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.secureUrl}
                    alt={photo.filename}
                    onLoad={(e) => handleImgLoad(photo.id, e)}
                    className="w-full h-full object-cover"
                  />
                  {photo.showInHero && (
                    <div className="absolute top-1.5 left-1.5 bg-gwcc-gold text-gwcc-dark text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded">
                      In Hero Carousel
                    </div>
                  )}
                  {disabled ? (
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/70 text-white text-[10px] text-center px-1.5 py-1 rounded">
                      Portrait — not supported
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-gwcc-gold text-sm font-medium">
                        {photo.showInHero ? "Remove" : "Add to Hero"}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
