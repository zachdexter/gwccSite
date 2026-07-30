"use client";

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
            className="group block rounded-lg overflow-hidden border border-white/8 bg-gwcc-navy hover:border-gwcc-gold/30 transition-colors"
          >
            <div className="aspect-video bg-gwcc-dark overflow-hidden">
              {album.coverPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={album.coverPhotoUrl}
                  alt={album.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gwcc-light/20 text-xs">
                  No photos
                </div>
              )}
            </div>
            <div className="px-3 py-2.5">
              <p className="text-gwcc-light font-medium text-sm">{album.name}</p>
              <p className="text-gwcc-light/40 text-xs mt-0.5">{album.photoCount} photos</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
