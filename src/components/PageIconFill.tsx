"use client";

import { useEffect, useRef, useState } from "react";
import type { Rect } from "@/lib/decorBounds";

type Point = {
  x: number;
  y: number;
  src: string;
  size: number;
  rotate: number;
};

const MIN_ICON_SIZE = 24;
const MAX_ICON_SIZE = 40;
const ICON_RADIUS = MAX_ICON_SIZE / 2;
const MIN_DIST = 130;
const MAX_ATTEMPTS_PER_POINT = 40;
const MAX_TOTAL_POINTS = 280;
const HEADER_PADDING = 24; // extra buffer kept clear below the top of the header zone
const BOTTOM_PADDING = 24; // small gap kept below the last row of content
// Exclusion rects are checked against the candidate point only, not the rendered icon's
// footprint, so pad by ICON_RADIUS too — otherwise an accepted point can sit just outside
// the box while the icon (up to MAX_ICON_SIZE wide) still visually overlaps it.
const HERO_PAD = 20 + ICON_RADIUS; // margin around the title/cluster exclusion rect
const CONTENT_PAD = 35 + ICON_RADIUS; // margin around the content-grid exclusion rect, absorbs entrance-animation jitter
const HEADER_ZONE_ID = "decor-header-zone";
const TITLE_BLOCK_ID = "decor-title-block";
const CONTENT_END_ID = "decor-content-end";

function padRect(r: Rect, pad: number): Rect {
  return { left: r.left - pad, top: r.top - pad, right: r.right + pad, bottom: r.bottom + pad };
}

function insideAny(x: number, y: number, rects: Rect[]): boolean {
  return rects.some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
}

function generatePoints(width: number, minY: number, maxY: number, pool: string[], excludeRects: Rect[]): Point[] {
  const usableHeight = maxY - minY;
  if (pool.length === 0 || width <= ICON_RADIUS * 2 || usableHeight <= 0) return [];

  const placed: Point[] = [];
  const maxCount = Math.min(MAX_TOTAL_POINTS, Math.ceil((width * usableHeight) / (MIN_DIST * MIN_DIST)));

  for (let i = 0; i < maxCount; i++) {
    let placedThisPoint = false;
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_POINT; attempt++) {
      const x = ICON_RADIUS + Math.random() * (width - ICON_RADIUS * 2);
      const y = minY + Math.random() * usableHeight;
      if (insideAny(x, y, excludeRects)) continue;
      const farEnough = placed.every((p) => Math.hypot(p.x - x, p.y - y) >= MIN_DIST);
      if (farEnough) {
        const src = pool[Math.floor(Math.random() * pool.length)];
        const rotatable = /\/(star|hold)\d+\.svg$/.test(src);
        placed.push({
          x,
          y,
          src,
          size: MIN_ICON_SIZE + Math.random() * (MAX_ICON_SIZE - MIN_ICON_SIZE),
          rotate: rotatable ? Math.random() * 360 - 180 : 0,
        });
        placedThisPoint = true;
        break;
      }
    }
    if (!placedThisPoint) break;
  }

  return placed;
}

function pageRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return {
    left: r.left + window.scrollX,
    top: r.top + window.scrollY,
    right: r.right + window.scrollX,
    bottom: r.bottom + window.scrollY,
  };
}

function signature(width: number, rects: Rect[]): string {
  const round = (n: number) => Math.round(n / 5) * 5;
  return [width, ...rects.flatMap((r) => [round(r.left), round(r.top), round(r.right), round(r.bottom)])].join(",");
}

export function PageIconFill({ pool, clusterBounds }: { pool: string[]; clusterBounds: Rect | null }) {
  const [points, setPoints] = useState<Point[]>([]);
  const [width, setWidth] = useState(0);
  const lastSignature = useRef("");

  useEffect(() => {
    function regenerate() {
      const headerEl = document.getElementById(HEADER_ZONE_ID);
      const titleEl = document.getElementById(TITLE_BLOCK_ID);
      const contentEl = document.getElementById(CONTENT_END_ID);
      if (!headerEl || !contentEl) return;

      const vw = document.documentElement.clientWidth;
      const headerRect = pageRect(headerEl);
      const contentRect = pageRect(contentEl);

      const excludeRects: Rect[] = [padRect(contentRect, CONTENT_PAD)];

      const titleRect = titleEl ? pageRect(titleEl) : null;
      const clusterRect: Rect | null = clusterBounds
        ? {
            left: headerRect.left + clusterBounds.left,
            top: headerRect.top + clusterBounds.top,
            right: headerRect.left + clusterBounds.right,
            bottom: headerRect.top + clusterBounds.bottom,
          }
        : null;
      const heroSources = [titleRect, clusterRect].filter((r): r is Rect => r !== null);
      if (heroSources.length > 0) {
        const heroRect: Rect = {
          left: Math.min(...heroSources.map((r) => r.left)),
          top: Math.min(...heroSources.map((r) => r.top)),
          right: Math.max(...heroSources.map((r) => r.right)),
          bottom: Math.max(...heroSources.map((r) => r.bottom)),
        };
        excludeRects.push(padRect(heroRect, HERO_PAD));
      }

      const minY = headerRect.top + HEADER_PADDING;
      const maxY = contentRect.bottom + BOTTOM_PADDING;

      const sig = signature(vw, excludeRects);
      if (sig === lastSignature.current) return;
      lastSignature.current = sig;

      setWidth(vw);
      setPoints(generatePoints(vw, minY, maxY, pool, excludeRects));
    }

    regenerate();

    const observer = new ResizeObserver(() => regenerate());
    const contentEl = document.getElementById(CONTENT_END_ID);
    observer.observe(contentEl ?? document.body);

    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(regenerate, 200);
    }
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, [pool, clusterBounds]);

  return (
    <div
      className="absolute top-0 left-0 pointer-events-none overflow-hidden"
      style={{ width, height: points.length ? Math.max(...points.map((p) => p.y)) + BOTTOM_PADDING : 0 }}
    >
      {points.map((p, i) => (
        <img
          key={i}
          src={p.src}
          alt=""
          className="pointer-events-none select-none absolute"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            transform: `translate(-50%, -50%) rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
