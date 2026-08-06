import { HeaderIconCluster } from "@/components/HeaderIconCluster";
import type { DecorIcon } from "@/lib/decorBounds";

// Fixed pixel offsets from the drawer's top-left corner (authored at a ~320px-wide mobile
// drawer canvas in /dev/scatter-menu). The menu's content (links, padding) sits at fixed
// pixel offsets from the top regardless of device height — the drawer itself is h-full, so
// its height varies a lot by device — so these must stay fixed px, not percentages, or
// icons meant to hug the text drift onto it on taller/shorter screens. HeaderIconCluster's
// clamp() still keeps them from spilling past the actual live edge. Paste output from
// /dev/scatter-menu here.
const menuIcons: DecorIcon[] = [
  { src: "/navysvgs/star1.svg", left: 166.7, top: 247.1, size: 32 },
  { src: "/navysvgs/star18.svg", left: 121.9, top: 189.0, size: 32 },
  { src: "/navysvgs/star5.svg", left: 117.1, top: 132.3, size: 32 },
  { src: "/navysvgs/star20.svg", left: 220.5, top: 70.0, size: 32 },
  { src: "/navysvgs/hold6.svg", left: 246.1, top: 322.0, size: 32, rotate: -37 },
  { src: "/navysvgs/star13.svg", left: 243.5, top: 634.9, size: 32 },
  { src: "/whitesvgs/star18.svg", left: 108.5, top: 487.9, size: 32 },
  { src: "/whitesvgs/hold8.svg", left: 219.5, top: 452.9, size: 32 },
  { src: "/whitesvgs/hold1.svg", left: 36.5, top: 644.7, size: 32 },
  { src: "/whitesvgs/chalkbag.svg", left: 63.7, top: 374.5, size: 44 },
];

export function MenuDecorIcons() {
  return <HeaderIconCluster icons={menuIcons} />;
}
