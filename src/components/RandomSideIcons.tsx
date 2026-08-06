"use client";

import { useEffect, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
  src: string;
  size: number;
  rotate: number;
};

const DEFAULT_CONTENT_MAX_WIDTH = 1024; // max-w-5xl
const EDGE_SAFETY = 24; // extra buffer kept clear of the content column edge
const HEADER_PADDING = 24; // extra buffer kept clear below the top of the header zone
const MIN_ICON_SIZE = 24;
const MAX_ICON_SIZE = 40;
const ICON_RADIUS = MAX_ICON_SIZE / 2;
const MIN_DIST = 130;
const MAX_ATTEMPTS_PER_POINT = 40;
const MIN_HEIGHT_DELTA = 50; // ignore height changes smaller than this
const WIDE_BREAKPOINT = 1536; // tailwind 2xl
const HEADER_ZONE_ID = "decor-header-zone";
const CONTENT_END_ID = "decor-content-end";
const BOTTOM_PADDING = 24; // small gap kept below the last row of content
const COLUMN_HEIGHT_PADDING = 30; // just enough to avoid clipping the lowest icon

function generatePoints(width: number, minY: number, maxY: number, pool: string[]): Point[] {
  const usableHeight = maxY - minY;
  if (pool.length === 0 || width <= ICON_RADIUS * 2 || usableHeight <= 0) return [];

  const placed: Point[] = [];
  const maxCount = Math.ceil((width * usableHeight) / (MIN_DIST * MIN_DIST));

  for (let i = 0; i < maxCount; i++) {
    let placedThisPoint = false;
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_POINT; attempt++) {
      const x = ICON_RADIUS + Math.random() * (width - ICON_RADIUS * 2);
      const y = minY + Math.random() * usableHeight;
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

function Column({ points, side, width }: { points: Point[]; side: "left" | "right"; width: number }) {
  return (
    <div
      className={`hidden 2xl:block absolute top-0 pointer-events-none overflow-hidden ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{ width, height: points.length ? Math.max(...points.map((p) => p.y)) + COLUMN_HEIGHT_PADDING : 0 }}
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

export function RandomSideIcons({
  pool,
  contentMaxWidth = DEFAULT_CONTENT_MAX_WIDTH,
}: {
  pool: string[];
  contentMaxWidth?: number;
}) {
  const [leftPoints, setLeftPoints] = useState<Point[]>([]);
  const [rightPoints, setRightPoints] = useState<Point[]>([]);
  const [stripWidth, setStripWidth] = useState(0);
  const lastHeight = useRef(0);
  const lastWidth = useRef(0);

  useEffect(() => {
    function regenerate() {
      const vw = window.innerWidth;
      if (vw < WIDE_BREAKPOINT) {
        setLeftPoints([]);
        setRightPoints([]);
        return;
      }

      const gutter = (vw - contentMaxWidth) / 2;
      const width = Math.max(0, gutter - EDGE_SAFETY);
      if (width < ICON_RADIUS * 2) {
        setLeftPoints([]);
        setRightPoints([]);
        return;
      }

      const contentEndEl = document.getElementById(CONTENT_END_ID);
      const height = contentEndEl
        ? contentEndEl.getBoundingClientRect().bottom + window.scrollY + BOTTOM_PADDING
        : document.documentElement.scrollHeight;
      const headerEl = document.getElementById(HEADER_ZONE_ID);
      const startY = headerEl ? headerEl.getBoundingClientRect().top + window.scrollY + HEADER_PADDING : 0;

      if (Math.abs(height - lastHeight.current) < MIN_HEIGHT_DELTA && width === lastWidth.current) return;
      lastHeight.current = height;
      lastWidth.current = width;

      setStripWidth(width);
      setLeftPoints(generatePoints(width, startY, height, pool));
      setRightPoints(generatePoints(width, startY, height, pool));
    }

    regenerate();

    const observer = new ResizeObserver(() => regenerate());
    const contentEndEl = document.getElementById(CONTENT_END_ID);
    observer.observe(contentEndEl ?? document.body);

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
  }, [pool, contentMaxWidth]);

  return (
    <>
      <Column points={leftPoints} side="left" width={stripWidth} />
      <Column points={rightPoints} side="right" width={stripWidth} />
    </>
  );
}
