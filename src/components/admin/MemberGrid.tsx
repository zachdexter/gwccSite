"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getAttendanceStatus } from "@/lib/semester";

export type GridMember = {
  id: number;
  name: string;
  isSubsidized: boolean;
  currentWeekCount: number;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

const statusStyles: Record<string, string> = {
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  yellow: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  red: "bg-muted text-muted-foreground border-border",
  excused: "bg-muted text-muted-foreground border-border",
};

export function MemberGrid({
  members,
  weekEnd,
  required,
  semesterId,
}: {
  members: GridMember[];
  weekEnd: Date;
  required: number;
  semesterId: number | null;
}) {
  if (members.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">No members found.</div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {members.map((m) => {
        const status = getAttendanceStatus(m.currentWeekCount, weekEnd, required);
        return (
          <motion.div
            key={m.id}
            variants={item}
            className="bg-card border border-border rounded-xl overflow-hidden hover:border-gwcc-gold/40 transition-colors"
          >
            <Link
              href={`/admin/members/${m.id}${semesterId ? `?semesterId=${semesterId}` : ""}`}
              className="flex items-center gap-3 p-3"
            >
              <div className="w-12 h-12 shrink-0 rounded-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-lg font-bold">{m.name[0]}</span>
              </div>
              <div className="min-w-0 space-y-1.5">
                <p className="text-card-foreground font-semibold text-sm truncate">{m.name}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge className={`border text-xs ${statusStyles[status]}`}>
                    {status === "excused"
                      ? "No requirement this week"
                      : `${m.currentWeekCount}/${required} this week`}
                  </Badge>
                  {m.isSubsidized && (
                    <Badge className="bg-gwcc-gold/15 text-gwcc-gold border-gwcc-gold/30 border text-xs">
                      subsidized
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
