import type { DecorIcon } from "@/lib/decorBounds";

// Renders a hand-placed icon cluster with clamped positions: each icon's center is kept
// within [size/2, 100% - size/2] of its container using CSS clamp(), so it can never spill
// past the container's actual live edge (which varies by device) — no clipped half-icons,
// and no need to measure anything at runtime.
export function HeaderIconCluster({ icons }: { icons: DecorIcon[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {icons.map((icon, i) => {
        const half = icon.size / 2;
        return (
          <img
            key={`${icon.src}-${i}`}
            src={icon.src}
            alt=""
            className="pointer-events-none select-none absolute"
            style={{
              left: `clamp(${half}px, ${icon.left}px, calc(100% - ${half}px))`,
              top: `clamp(${half}px, ${icon.top}px, calc(100% - ${half}px))`,
              width: icon.size,
              height: icon.size,
              transform: `translate(-50%, -50%) rotate(${icon.rotate ?? 0}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
