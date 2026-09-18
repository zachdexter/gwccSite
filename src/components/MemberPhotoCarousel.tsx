"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Photo = { id: number; secureUrl: string };

const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;

export function MemberPhotoCarousel({ photos, name }: { photos: Photo[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setWidth(el.offsetWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!width) return;
    const controls = animate(x, -index * width, SPRING);
    return () => controls.stop();
  }, [index, width, x]);

  if (photos.length === 0) {
    return (
      <div className="w-full aspect-square bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-4xl font-bold">{name[0]}</span>
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photos[0].secureUrl} alt={name} className="w-full aspect-square object-cover object-top" />
    );
  }

  function goTo(i: number) {
    setIndex(Math.max(0, Math.min(photos.length - 1, i)));
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const offsetRatio = width ? info.offset.x / width : 0;
    let target = index;
    if (offsetRatio < -0.2 || info.velocity.x < -500) target = index + 1;
    else if (offsetRatio > 0.2 || info.velocity.x > 500) target = index - 1;
    target = Math.max(0, Math.min(photos.length - 1, target));

    if (target !== index) setIndex(target);
    else animate(x, -index * width, SPRING);
  }

  return (
    <div ref={containerRef} className="relative w-full aspect-square overflow-hidden group">
      <motion.div
        className="flex h-full"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -(photos.length - 1) * width, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        {photos.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.id}
            src={p.secureUrl}
            alt={name}
            draggable={false}
            className="w-full h-full flex-shrink-0 object-cover object-top"
          />
        ))}
      </motion.div>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Previous photo"
        disabled={index === 0}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity bg-black/40 hover:bg-black/60 text-white rounded-full p-1"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Next photo"
        disabled={index === photos.length - 1}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity bg-black/40 hover:bg-black/60 text-white rounded-full p-1"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {photos.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to photo ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "bg-gwcc-gold w-4" : "bg-white/50 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
