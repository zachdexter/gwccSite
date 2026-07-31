"use client";

import { motion } from "framer-motion";

type EboardMember = {
  id: number;
  name: string;
  role: string;
  year: string;
  headshotUrl: string | null;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

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
        <motion.div
          key={m.id}
          variants={item}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          {m.headshotUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={m.headshotUrl}
              alt={m.name}
              className="w-full aspect-square object-cover object-top"
            />
          ) : (
            <div className="w-full aspect-square bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-4xl font-bold">{m.name[0]}</span>
            </div>
          )}
          <div className="p-4 space-y-1">
            <p className="text-gwcc-gold text-xs uppercase tracking-widest font-semibold">{m.role}</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-card-foreground font-semibold">{m.name}</h2>
              <span className="text-muted-foreground text-xs">{m.year}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
