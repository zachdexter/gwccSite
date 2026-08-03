"use client";

import { motion } from "framer-motion";

type PracticeTime = {
  day: string;
  time: string;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function PracticeSchedule({ times }: { times: PracticeTime[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
    >
      <motion.h2
        variants={item}
        className="font-heading text-gwcc-gold text-sm uppercase tracking-widest mb-6 text-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
      >
        Practice Schedule
      </motion.h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {times.map((p) => (
          <motion.div
            key={p.day}
            variants={item}
            className="bg-card border border-border rounded-lg px-5 py-4"
          >
            <div className="text-card-foreground font-semibold">{p.day}</div>
            <div className="text-muted-foreground text-sm mt-1">{p.time}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
