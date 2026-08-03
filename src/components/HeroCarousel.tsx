"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface HeroPhoto {
  id: number;
  secureUrl: string;
}

export function HeroCarousel({ photos }: { photos: HeroPhoto[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);

  if (photos.length === 0) return null;

  const current = photos[index];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <AnimatePresence>
        <motion.img
          key={current.id}
          src={current.secureUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </AnimatePresence>
      {/* photo-relative scrim, intentionally not theme-aware */}
      <div className="absolute inset-0 bg-gradient-to-b from-gwcc-dark/65 via-gwcc-dark/55 to-gwcc-dark/85" />

      {photos.length > 1 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "bg-gwcc-gold w-5" : "bg-white/35 w-1.5"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
