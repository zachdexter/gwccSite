"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type GalleryPhoto = {
  id: number;
  secureUrl: string;
  filename: string;
  uploadedAt: string;
  albumId: number | null;
  showInHero: boolean;
  heroDisplayOrder: number;
  albumName: string | null;
};

export default function HeroAdminPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  async function fetchPhotos() {
    const res = await fetch("/api/hero-photos");
    if (res.ok) setPhotos(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchPhotos(); }, []);

  async function toggleHero(photo: GalleryPhoto) {
    setToggling(photo.id);
    const next = !photo.showInHero;
    const res = await fetch("/api/hero-photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id, showInHero: next }),
    });
    if (res.ok) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, showInHero: next } : p))
      );
      toast.success(next ? "Added to carousel" : "Removed from carousel");
    } else {
      toast.error("Failed to update");
    }
    setToggling(null);
  }

  // Group photos by album
  const grouped = photos.reduce<Record<string, GalleryPhoto[]>>((acc, p) => {
    const key = p.albumName ?? "Uncategorized";
    (acc[key] ??= []).push(p);
    return acc;
  }, {});

  const heroCount = photos.filter((p) => p.showInHero).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gwcc-light">Home Page Carousel</h1>
        <p className="text-gwcc-light/50 text-sm mt-0.5">
          Select photos from the gallery to show in the hero rotation.{" "}
          <span className="text-gwcc-gold">{heroCount} selected</span>
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gwcc-light/40">Loading…</div>
      ) : photos.length === 0 ? (
        <div className="text-center py-20 text-gwcc-light/40">
          No gallery photos yet. Sync from Drive or upload photos in the Gallery admin.
        </div>
      ) : (
        Object.entries(grouped).map(([albumName, albumPhotos]) => (
          <div key={albumName}>
            <h2 className="text-gwcc-light/60 text-xs uppercase tracking-widest font-semibold mb-3">
              {albumName}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {albumPhotos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => toggleHero(photo)}
                  disabled={toggling === photo.id}
                  className={`group relative aspect-square rounded-lg overflow-hidden bg-gwcc-navy border-2 transition-all ${
                    photo.showInHero
                      ? "border-gwcc-gold shadow-[0_0_0_1px_#dbd29b33]"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.secureUrl}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                  {photo.showInHero && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gwcc-gold flex items-center justify-center">
                      <svg className="w-3 h-3 text-gwcc-dark" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {photo.showInHero ? "Remove" : "Add to carousel"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
