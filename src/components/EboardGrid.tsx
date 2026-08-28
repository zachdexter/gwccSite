"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { bioTextClass } from "@/lib/utils";

type EboardMember = {
  id: number;
  name: string;
  role: string;
  year: string;
  headshotUrl: string | null;
  bio: string | null;
  bioFontSize: "sm" | "base" | "lg";
  bioBold: boolean;
  bioItalic: boolean;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

const YEAR_LABELS: Record<string, string> = {
  Fr: "Freshman",
  So: "Sophomore",
  Jr: "Junior",
  Sr: "Senior",
};

function formatYear(year: string) {
  return YEAR_LABELS[year] ?? year;
}

function EboardCard({ member: m }: { member: EboardMember }) {
  const [flipped, setFlipped] = useState(false);
  const hasBio = !!m.bio;

  return (
    <motion.div
      variants={item}
      className="[perspective:1200px]"
      onClick={() => hasBio && setFlipped((f) => !f)}
    >
      <motion.div
        className="relative w-full aspect-[4/5] [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        role={hasBio ? "button" : undefined}
        tabIndex={hasBio ? 0 : undefined}
        aria-label={hasBio ? `${m.name}, click to read bio` : undefined}
        onKeyDown={(e) => {
          if (hasBio && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        style={{ cursor: hasBio ? "pointer" : "default" }}
      >
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-card border border-border rounded-xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] ring-1 ring-white/10 flex flex-col">
          <div className="relative w-full min-h-0 flex-1">
            {m.headshotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.headshotUrl}
                alt={m.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-4xl font-bold">{m.name[0]}</span>
              </div>
            )}
            {hasBio && (
              <div className="absolute bottom-2 right-2 bg-gwcc-dark/70 backdrop-blur-sm rounded-full p-1.5 ring-1 ring-gwcc-gold/40">
                <RotateCw className="w-3.5 h-3.5 text-gwcc-gold" />
              </div>
            )}
          </div>
          <div className="p-4 space-y-1 shrink-0">
            <p className="text-gwcc-gold text-xs uppercase tracking-widest font-semibold">{m.role}</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-card-foreground font-semibold">{m.name}</h2>
              <span className="text-muted-foreground text-xs">{formatYear(m.year)}</span>
            </div>
          </div>
        </div>

        {/* Back */}
        {hasBio && (
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-card border border-border rounded-xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] ring-1 ring-white/10 p-5 flex flex-col">
            <p className="text-gwcc-gold text-xs uppercase tracking-widest font-semibold">{m.name}</p>
            <p className={`text-card-foreground pt-2 overflow-y-auto ${bioTextClass(m)}`}>{m.bio}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function EboardGrid({ members }: { members: EboardMember[] }) {
  return (
    <motion.div
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {members.map((m) => (
        <EboardCard key={m.id} member={m} />
      ))}
    </motion.div>
  );
}
