"use client";

import { motion } from "framer-motion";

type CompMember = {
  id: number;
  name: string;
  year: string;
  events: string[];
  bio: string | null;
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
          className="bg-gwcc-navy/60 border border-white/10 rounded-xl overflow-hidden"
        >
          {m.headshotUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={m.headshotUrl}
              alt={m.name}
              className="w-full aspect-square object-cover object-top"
            />
          ) : (
            <div className="w-full aspect-square bg-gwcc-navy/80 flex items-center justify-center">
              <span className="text-gwcc-light/20 text-4xl font-bold">{m.name[0]}</span>
            </div>
          )}
          <div className="p-4 space-y-2">
            <div className="flex items-baseline gap-2">
              <h2 className="text-gwcc-light font-semibold">{m.name}</h2>
              <span className="text-gwcc-light/40 text-xs">{m.year}</span>
            </div>
            {m.events.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {m.events.map((ev) => (
                  <span
                    key={ev}
                    className="text-xs text-gwcc-gold/80 bg-gwcc-gold/10 border border-gwcc-gold/20 px-2 py-0.5 rounded-full"
                  >
                    {ev}
                  </span>
                ))}
              </div>
            )}
            {m.bio && (
              <p className="text-gwcc-light/50 text-sm leading-relaxed">{m.bio}</p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
