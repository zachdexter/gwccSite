"use client";

import { useEffect, useRef, useState } from "react";
import { Cropper, type ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
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
  const [saving, setSaving] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);

  useEffect(() => {
    function sync() {
      if (!file) {
        setImageSrc(null);
        return undefined;
      }
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      return () => URL.revokeObjectURL(url);
    }
    return sync();
  }, [file]);

  function handleSave() {
    const cropper = cropperRef.current?.cropper;
    if (!cropper || !file) return;
    setSaving(true);
    cropper.getCroppedCanvas().toBlob((blob) => {
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
          <div className="w-full h-72 bg-muted rounded-md overflow-hidden">
            <Cropper
              ref={cropperRef}
              src={imageSrc}
              style={{ height: "100%", width: "100%" }}
              aspectRatio={1}
              viewMode={1}
              dragMode="move"
              guides
              background={false}
              responsive
              autoCropArea={1}
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
