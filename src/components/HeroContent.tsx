"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export function HeroContent() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, scale }}
      className="relative z-10 max-w-3xl space-y-4"
    >
      <Image
        src="/gwccsplashlogo-white.png"
        alt="GWCC logo"
        width={1024}
        height={768}
        priority
        className="w-[22rem] md:w-[30rem] h-auto mx-auto"
      />
      <div className="text-muted-foreground text-[11px] uppercase tracking-[0.25em]">
        George Washington University Climbing Club
      </div>
    </motion.div>
  );
}
