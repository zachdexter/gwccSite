"use client";

import { useEffect, useRef } from "react";

// Calls `fn` every `intervalMs` while the tab is visible, and once right away whenever the
// tab becomes visible or the window regains focus. Hidden tabs don't poll, so an idle phone
// doesn't keep the database awake. A tick is skipped if the previous call hasn't finished.
export function usePolling(fn: () => Promise<void> | void, intervalMs: number, enabled = true) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (!enabled) return;
    let running = false;

    async function tick() {
      if (running || document.visibilityState !== "visible") return;
      running = true;
      try {
        await fnRef.current();
      } finally {
        running = false;
      }
    }

    const id = setInterval(tick, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [intervalMs, enabled]);
}
