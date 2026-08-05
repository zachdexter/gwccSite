import { RandomSideIcons } from "@/components/RandomSideIcons";
import { SIDE_ICON_POOL } from "@/lib/decorIconPool";

type DecorIcon = {
  src: string;
  left: number;
  top: number;
  size: number;
  rotate?: number;
};

// Fixed pixel offsets from the title block's top-left corner (authored at a ~976px-wide
// desktop header zone). Scrolls away with the page. On narrower screens the icons keep
// these exact pixel positions and simply get clipped by the container's overflow-hidden
// instead of repositioning onto the (possibly wrapped) title text — same "crop at the
// edges" behavior as the /login page. Paste "desktop" output from /dev/scatter-eboard here.
// Shown at md (768px) and up.
const headerIcons: DecorIcon[] = [
  { src: "/whitesvgs/star4.svg", left: 434.0, top: 17.8, size: 32 },
  { src: "/navysvgs/star20.svg", left: 157.2, top: 22.6, size: 32 },
  { src: "/navysvgs/star9.svg", left: 553.2, top: 70.6, size: 32 },
  { src: "/whitesvgs/climbstar.svg", left: 885.2, top: 61.0, size: 76, rotate: 25 },
  { src: "/navysvgs/mountain.svg", left: 673.2, top: 81.8, size: 46 },
  { src: "/navysvgs/star7.svg", left: 763.6, top: 32.2, size: 32 },
];

// Same idea, but authored against a ~343px-wide mobile header zone (matches a ~390px
// phone viewport minus page padding), with the mobile (non-md) title typography.
// Shown below md (768px). Paste "mobile" output from /dev/scatter-eboard here.
const headerIconsMobile: DecorIcon[] = [
  { src: "/whitesvgs/climbstar.svg", left: 250.3, top: 116.2, size: 65, rotate: 16 },
  { src: "/whitesvgs/star13.svg", left: 297.5, top: 22.6, size: 32 },
  { src: "/whitesvgs/star18.svg", left: 139.9, top: 23.4, size: 32 },
  { src: "/whitesvgs/star3.svg", left: 106.3, top: 129.0, size: 32 },
];

export function EboardHeaderIcons() {
  return (
    <>
      <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden">
        {headerIcons.map((icon, i) => (
          <img
            key={`${icon.src}-${i}`}
            src={icon.src}
            alt=""
            className="pointer-events-none select-none absolute"
            style={{
              left: icon.left,
              top: icon.top,
              width: icon.size,
              height: icon.size,
              transform: `translate(-50%, -50%) rotate(${icon.rotate ?? 0}deg)`,
            }}
          />
        ))}
      </div>
      <div className="md:hidden absolute inset-0 pointer-events-none overflow-hidden">
        {headerIconsMobile.map((icon, i) => (
          <img
            key={`${icon.src}-${i}`}
            src={icon.src}
            alt=""
            className="pointer-events-none select-none absolute"
            style={{
              left: icon.left,
              top: icon.top,
              width: icon.size,
              height: icon.size,
              transform: `translate(-50%, -50%) rotate(${icon.rotate ?? 0}deg)`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// Left/right margins — procedurally generated on every page load, scrolls with
// the page, and automatically fills whatever height the roster ends up being.
export function EboardSideFrame() {
  return <RandomSideIcons pool={SIDE_ICON_POOL} />;
}
