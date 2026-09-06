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
  { src: "/navysvgs/star12.svg", left: 125.2, top: 194.4, size: 40 },
  { src: "/navysvgs/star18.svg", left: 97.2, top: 250.1, size: 40 },
  { src: "/navysvgs/star7.svg", left: 179.1, top: 309.9, size: 40 },
  { src: "/navysvgs/star14.svg", left: 135.2, top: 131.1, size: 40 },
  { src: "/navysvgs/star10.svg", left: 229.8, top: 65.8, size: 40 },
  { src: "/whitesvgs/curlyhairdude.svg", left: 227.5, top: 389.2, size: 63, rotate: 12 },
  { src: "/navysvgs/chalkbag.svg", left: 57.1, top: 503.8, size: 42, rotate: -18 },
  { src: "/navysvgs/carabiner.svg", left: 188.0, top: 466.7, size: 32, rotate: 63 },
  { src: "/navysvgs/climbstar.svg", left: 263.4, top: 546.0, size: 60, rotate: -34 },
  { src: "/navysvgs/hold1.svg", left: 69.6, top: 416.6, size: 32, rotate: 105 },
  { src: "/whitesvgs/hold4.svg", left: 261.9, top: 221.4, size: 32, rotate: 64 },
  { src: "/whitesvgs/star10.svg", left: 243.9, top: 674.0, size: 32 },
  { src: "/whitesvgs/sclip.svg", left: 133.0, top: 564.2, size: 32 },
  { src: "/whitesvgs/star12.svg", left: 39.1, top: 649.0, size: 32 },
];

export function MenuDecorIcons() {
  return <HeaderIconCluster icons={menuIcons} />;
}
