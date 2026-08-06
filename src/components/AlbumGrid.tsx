"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type Album = {
  id: number;
  name: string;
  photoCount: number;
  coverPhotoUrl: string | null;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function AlbumGrid({ albums }: { albums: Album[] }) {
  // grid-cols-2 below the sm breakpoint, grid-cols-3 at sm and up (matches the classes below)
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setCols(mq.matches ? 3 : 2);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const fitsInLastRow = albums.length % cols !== 0;

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {albums.map((album) => (
        <motion.div key={album.id} variants={item}>
          <Link
            href={`/gallery/${album.id}`}
            className="group block rounded-lg overflow-hidden border border-border bg-card hover:border-gwcc-gold/30 transition-colors"
          >
            <div className="aspect-video bg-muted overflow-hidden">
              {album.coverPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={album.coverPhotoUrl}
                  alt={album.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  No photos
                </div>
              )}
            </div>
            <div className="px-3 py-2.5">
              <p className="text-card-foreground font-medium text-sm">{album.name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{album.photoCount} photos</p>
            </div>
          </Link>
        </motion.div>
      ))}
      <motion.div
        variants={item}
        style={fitsInLastRow ? undefined : { gridColumn: "1 / -1" }}
        className="flex items-center justify-center"
      >
        <p className="text-muted-foreground text-sm py-4">More to come!</p>
      </motion.div>
    </motion.div>
  );
}
