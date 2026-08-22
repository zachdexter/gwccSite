"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroPhoto {
  id: number;
  secureUrl: string;
}

export function HeroCarousel({ photos }: { photos: HeroPhoto[] }) {
  const [index, setIndex] = useState(0);
  const { scrollY } = useScroll();
  const dotsOpacity = useTransform(scrollY, [0, 150], [1, 0]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);

  if (photos.length === 0) return null;

  const current = photos[index];

  function prev() {
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }

  function next() {
    setIndex((i) => (i + 1) % photos.length);
  }

  return (
    <>
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
      </div>

      {photos.length > 1 && (
        <motion.div
          style={{ opacity: dotsOpacity }}
          className="fixed top-16 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30"
        >
          <button
            onClick={prev}
            aria-label="Previous photo"
            className="text-gwcc-gold/70 hover:text-gwcc-gold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-2">
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

          <button
            onClick={next}
            aria-label="Next photo"
            className="text-gwcc-gold/70 hover:text-gwcc-gold transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </>
  );
}
