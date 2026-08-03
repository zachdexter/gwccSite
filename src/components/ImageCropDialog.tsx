"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ImageCropDialogProps = {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropped: (file: File) => void;
};

export function ImageCropDialog({ file, open, onOpenChange, onCropped }: ImageCropDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!file) {
      setImageSrc(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setZoom(1);
    setPosX(50);
    setPosY(50);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleSave() {
    const img = imgRef.current;
    if (!img || !file) return;
    setSaving(true);

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const cropSize = Math.min(naturalWidth, naturalHeight) / zoom;
    const centerX = (posX / 100) * naturalWidth;
    const centerY = (posY / 100) * naturalHeight;
    const cropX = Math.min(Math.max(centerX - cropSize / 2, 0), naturalWidth - cropSize);
    const cropY = Math.min(Math.max(centerY - cropSize / 2, 0), naturalHeight - cropSize);

    const canvas = document.createElement("canvas");
    canvas.width = cropSize;
    canvas.height = cropSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setSaving(false);
      return;
    }
    ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);

    canvas.toBlob((blob) => {
      setSaving(false);
      if (!blob) return;
      onCropped(new File([blob], file.name, { type: blob.type }));
      onOpenChange(false);
    }, file.type || "image/jpeg");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Photo</DialogTitle>
        </DialogHeader>

        {imageSrc && (
          <>
            <div className="w-full aspect-square bg-muted rounded-md overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt=""
                className="w-full h-full"
                style={{
                  objectFit: "cover",
                  objectPosition: `${posX}% ${posY}%`,
                  transform: `scale(${zoom})`,
                  transformOrigin: `${posX}% ${posY}%`,
                }}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs text-muted-foreground">
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                Horizontal position
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="w-full"
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                Vertical position
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="w-full"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPosX(50);
                  setPosY(50);
                }}
                className="text-xs text-muted-foreground hover:text-gwcc-gold transition-colors"
              >
                Reset
              </button>
            </div>
          </>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !imageSrc}
            className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90"
          >
            {saving ? "Saving…" : "Save Crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
