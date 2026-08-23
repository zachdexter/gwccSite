"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type HeroFocusDialogProps = {
  photo: { id: number; secureUrl: string; heroFocusY: number } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: number, heroFocusY: number) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function HeroFocusDialog({ photo, open, onOpenChange, onSave }: HeroFocusDialogProps) {
  const [saving, setSaving] = useState(false);
  const [focusY, setFocusY] = useState(50);
  const [containerAspect, setContainerAspect] = useState(16 / 9);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startY: number; startFocusY: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    setContainerAspect(window.innerWidth / window.innerHeight);
  }, [open]);

  useEffect(() => {
    if (photo) setFocusY(photo.heroFocusY);
    setNaturalSize(null);
  }, [photo]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!naturalSize) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startY: e.clientY, startFocusY: focusY };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current || !naturalSize || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scale = Math.max(rect.width / naturalSize.width, rect.height / naturalSize.height);
    const renderedHeight = naturalSize.height * scale;
    const excess = renderedHeight - rect.height;
    if (excess <= 0) return;

    const deltaPx = e.clientY - dragState.current.startY;
    const deltaPercent = -(deltaPx / excess) * 100;
    setFocusY(clamp(dragState.current.startFocusY + deltaPercent, 0, 100));
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    dragState.current = null;
  }

  function handleSave() {
    if (!photo) return;
    setSaving(true);
    onSave(photo.id, Math.round(focusY));
    setSaving(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adjust Hero Position</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-2">
          Drag the photo up or down. This preview is sized to your current window, so it shows
          exactly what will appear on the homepage right now.
        </p>

        {photo && (
          <div
            ref={containerRef}
            style={{ aspectRatio: containerAspect }}
            className="w-full max-h-[70vh] rounded-md overflow-hidden relative bg-muted cursor-ns-resize touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.secureUrl}
              alt=""
              draggable={false}
              onLoad={(e) =>
                setNaturalSize({
                  width: e.currentTarget.naturalWidth,
                  height: e.currentTarget.naturalHeight,
                })
              }
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ objectPosition: `50% ${focusY}%` }}
            />
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !photo}
            className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90"
          >
            {saving ? "Saving…" : "Save Position"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
