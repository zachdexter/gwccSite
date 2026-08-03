"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Photo {
  id: number;
  secureUrl: string;
  filename: string;
}

const GAP = 12;
const FALLBACK_RATIO = 1.5;

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [ratios, setRatios] = useState<Record<number, number>>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const showPrev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const showNext = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex, close, showPrev, showNext]);

  const touchStartX = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const SWIPE_THRESHOLD = 50;
      if (deltaX > SWIPE_THRESHOLD) showPrev();
      else if (deltaX < -SWIPE_THRESHOLD) showNext();
      touchStartX.current = null;
    },
    [showPrev, showNext]
  );

  const current = openIndex === null ? null : photos[openIndex];
  const [hero, ...rest] = photos;
  const restIds = rest.map((p) => p.id).join(",");

  useEffect(() => {
    rest.forEach((photo) => {
      if (ratios[photo.id]) return;
      const img = new window.Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        setRatios((prev) => (prev[photo.id] ? prev : { ...prev, [photo.id]: ratio }));
      };
      img.src = photo.secureUrl;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restIds]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rows = useMemo(() => {
    if (containerWidth === 0) return [];
    const targetHeight = Math.max(140, Math.min(280, containerWidth / 5));
    type Item = { photo: Photo; ratio: number; index: number };
    const result: { items: Item[]; height: number }[] = [];
    let current: Item[] = [];
    let ratioSum = 0;

    rest.forEach((photo, i) => {
      const ratio = ratios[photo.id] ?? FALLBACK_RATIO;
      current.push({ photo, ratio, index: i + 1 });
      ratioSum += ratio;
      const widthAtTarget = ratioSum * targetHeight + (current.length - 1) * GAP;
      if (widthAtTarget >= containerWidth) {
        const totalGap = (current.length - 1) * GAP;
        const height = (containerWidth - totalGap) / ratioSum;
        result.push({ items: current, height });
        current = [];
        ratioSum = 0;
      }
    });

    if (current.length > 0) {
      const height = Math.min(targetHeight, containerWidth / ratioSum);
      result.push({ items: current, height });
    }

    return result;
  }, [rest, ratios, containerWidth]);

  return (
    <>
      {hero && (
        <button
          onClick={() => setOpenIndex(0)}
          className="block mx-auto cursor-zoom-in mb-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero.secureUrl}
            alt={hero.filename}
            className="max-w-full max-h-[70vh] object-contain rounded-lg border border-gwcc-gold/60"
          />
        </button>
      )}

      <div ref={containerRef} className="flex flex-col gap-3">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-3">
            {row.items.map(({ photo, ratio, index }) => (
              <button
                key={photo.id}
                onClick={() => setOpenIndex(index)}
                style={{ width: ratio * row.height, height: row.height }}
                className="block shrink-0 rounded-lg overflow-hidden bg-card border border-border cursor-zoom-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.secureUrl}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            key="lightbox"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white transition-colors text-3xl leading-none z-10"
            >
              ×
            </button>

            {photos.length > 1 && openIndex !== null && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 sm:top-6 text-white/70 text-sm z-10">
                {openIndex + 1} / {photos.length}
              </div>
            )}

            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="Previous photo"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors text-4xl sm:text-5xl leading-none z-10 px-2"
              >
                ‹
              </button>
            )}

            <motion.img
              key={current.id}
              src={current.secureUrl}
              alt={current.filename}
              className="max-w-[92vw] max-h-[88vh] object-contain rounded-md"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            />

            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="Next photo"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors text-4xl sm:text-5xl leading-none z-10 px-2"
              >
                ›
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
