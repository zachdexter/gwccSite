"use client";

import { ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ScrollIndicator() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 150], [1, 0]);

  function scrollToSessionTimes() {
    document.getElementById("practice-times")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <motion.button
      type="button"
      onClick={scrollToSessionTimes}
      aria-label="Scroll to session times"
      style={{ opacity }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="text-gwcc-light/60"
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </motion.button>
  );
}
