export type DecorIcon = {
  src: string;
  left: number;
  top: number;
  size: number;
  rotate?: number;
};

export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

// Bounding box of a hand-placed icon cluster, in the same coordinate space as
// the icons themselves (px offset from the cluster's containing element).
export function computeClusterBounds(icons: DecorIcon[]): Rect | null {
  if (icons.length === 0) return null;

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const icon of icons) {
    const half = icon.size / 2;
    left = Math.min(left, icon.left - half);
    top = Math.min(top, icon.top - half);
    right = Math.max(right, icon.left + half);
    bottom = Math.max(bottom, icon.top + half);
  }

  return { left, top, right, bottom };
}
