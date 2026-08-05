"use client";

import { motion } from "framer-motion";

type PracticeTime = {
  day: string;
  time: string;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
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
      <div className="flex flex-col divide-y divide-border sm:flex-row sm:flex-wrap sm:justify-center sm:divide-y-0">
        {times.map((p, i) => (
          <motion.div
            key={p.day}
            variants={item}
            className={`flex items-center justify-between py-3 sm:flex-col sm:justify-center sm:px-6 sm:py-2 sm:first:pl-0 sm:last:pr-0 ${
              i > 0 ? "sm:border-l sm:border-border" : ""
            }`}
          >
            <div className="font-heading text-sm uppercase tracking-wide text-card-foreground">
              {p.day.slice(0, 3)}
            </div>
            <div className="text-muted-foreground text-sm sm:mt-1 whitespace-nowrap">
              {p.time}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
