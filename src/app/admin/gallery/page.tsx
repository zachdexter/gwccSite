"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
};

export default function GalleryAdminPage() {
  const [view, setView] = useState<"albums" | "photos">("albums");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function createAlbum(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/gallery/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: albumName, description: albumDesc || undefined }),
    });
    if (res.ok) {
      const album = await res.json();
      setAlbums((prev) => [{ ...album, photoCount: 0, coverPhotoUrl: null }, ...prev]);
      setAlbumName(""); setAlbumDesc(""); setShowAddAlbum(false);
      toast.success(`Created "${album.name}"`);
    } else {
      toast.error("Failed to create album");
    }
  }

  async function deleteAlbum(album: Album) {
    if (!confirm(`Delete "${album.name}" and all ${album.photoCount} photo(s)?`)) return;
    const res = await fetch("/api/gallery/albums", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: album.id }),
    });
    if (res.ok) {
      setAlbums((prev) => prev.filter((a) => a.id !== album.id));
      toast.success(`Deleted "${album.name}"`);
    } else {
      toast.error("Failed to delete album");
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0 || !selectedAlbum) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("albumId", String(selectedAlbum.id));

        const res = await fetch("/api/gallery", { method: "POST", body: formData });
        if (!res.ok) { toast.error(`Failed to upload ${file.name}`); continue; }

        const photo: Photo = await res.json();
        setPhotos((prev) => [photo, ...prev]);
        setSelectedAlbum((prev) => prev ? { ...prev, photoCount: prev.photoCount + 1 } : prev);
        toast.success(`Uploaded ${file.name}`);
      } catch {
        toast.error(`Error uploading ${file.name}`);
      }
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function deletePhoto(photo: Photo) {
    if (!confirm(`Delete ${photo.filename}?`)) return;
    const res = await fetch("/api/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id, cloudinaryId: photo.cloudinaryId }),
    });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setSelectedAlbum((prev) => prev ? { ...prev, photoCount: Math.max(0, prev.photoCount - 1) } : prev);
      toast.success("Photo deleted");
    }
  }

  if (view === "photos" && selectedAlbum) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={backToAlbums}
              className="text-gwcc-light/40 hover:text-gwcc-light text-sm transition-colors"
            >
              ← Albums
            </button>
            <span className="text-gwcc-light/20">·</span>
            <div>
              <h1 className="text-xl font-bold text-gwcc-light">{selectedAlbum.name}</h1>
              <p className="text-gwcc-light/50 text-sm mt-0.5">{photos.length} photos</p>
            </div>
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
            />
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold"
            >
              {uploading ? "Uploading…" : "Upload Photos"}
            </Button>
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-20 text-gwcc-light/40">
            No photos yet. Upload some to get started.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-gwcc-navy border border-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.secureUrl}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => deletePhoto(photo)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
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
          <h1 className="text-xl font-bold text-gwcc-light">Gallery</h1>
          <p className="text-gwcc-light/50 text-sm mt-0.5">{albums.length} albums</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={syncFromDrive}
            disabled={syncing}
            variant="outline"
            className="border-white/20 text-gwcc-light/70 hover:border-white/40 hover:text-gwcc-light"
          >
            {syncing ? "Syncing…" : "Sync from Drive"}
          </Button>
          <Button
            onClick={() => setShowAddAlbum(!showAddAlbum)}
            className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold"
          >
            + New Album
          </Button>
        </div>
      </div>

      {showAddAlbum && (
        <form
          onSubmit={createAlbum}
          className="bg-gwcc-navy border border-white/10 rounded-lg p-4 space-y-4"
        >
          <h2 className="text-gwcc-light font-semibold">New Album</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-gwcc-light/70 text-xs">Name *</Label>
              <Input
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                required
                placeholder="e.g. Spring 2025"
                className="bg-gwcc-dark border-white/10 text-gwcc-light"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gwcc-light/70 text-xs">Description</Label>
              <Input
                value={albumDesc}
                onChange={(e) => setAlbumDesc(e.target.value)}
                placeholder="Optional"
                className="bg-gwcc-dark border-white/10 text-gwcc-light"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90">
              Create
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddAlbum(false)}
              className="text-gwcc-light/60"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {albums.length === 0 ? (
        <div className="text-center py-20 text-gwcc-light/40">
          No albums yet. Create one to start uploading photos.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {albums.map((album) => (
            <div
              key={album.id}
              className="group rounded-lg overflow-hidden border border-white/10 bg-gwcc-navy cursor-pointer hover:border-gwcc-gold/30 transition-colors"
              onClick={() => openAlbum(album)}
            >
              <div className="aspect-video bg-gwcc-dark relative overflow-hidden">
                {album.coverPhotoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={album.coverPhotoUrl}
                    alt={album.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gwcc-light/20 text-xs">
                    No photos
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteAlbum(album); }}
                    className="text-xs text-red-400 hover:text-red-300 bg-black/60 rounded px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-gwcc-light font-medium text-sm">{album.name}</p>
                <p className="text-gwcc-light/40 text-xs mt-0.5">{album.photoCount} photos</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
