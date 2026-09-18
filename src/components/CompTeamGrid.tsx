"use client";

import { motion } from "framer-motion";
import { MemberPhotoCarousel } from "@/components/MemberPhotoCarousel";
import { BioText } from "@/components/BioText";

type CompMember = {
  id: number;
  name: string;
  year: string;
  bio: string | null;
  photos: { id: number; secureUrl: string }[];
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export function CompTeamGrid({ members }: { members: CompMember[] }) {
  return (
    <motion.div
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {members.map((m) => (
        <motion.div
          key={m.id}
          variants={item}
          className="bg-card border border-border rounded-xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
        >
          <MemberPhotoCarousel photos={m.photos} name={m.name} />
          <div className="p-4 space-y-2">
            <div className="flex items-baseline gap-2">
              <h2 className="text-card-foreground font-semibold">{m.name}</h2>
              <span className="text-muted-foreground text-xs">{m.year}</span>
            </div>
            {m.bio && (
              <BioText text={m.bio} className="text-muted-foreground text-sm leading-relaxed" />
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
