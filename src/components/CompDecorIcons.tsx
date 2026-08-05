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
// edges" behavior as the /login page. Paste "desktop" output from /dev/scatter-comp here.
// Shown at md (768px) and up.
const headerIcons: DecorIcon[] = [
  { src: "/whitesvgs/girlclimbing.svg", left: 668.4, top: 81.8, size: 96 },
  { src: "/whitesvgs/star13.svg", left: 571.6, top: 64.2, size: 32 },
  { src: "/navysvgs/star20.svg", left: 939.6, top: 24.2, size: 32 },
  { src: "/navysvgs/star8.svg", left: 309.2, top: 74.6, size: 32 },
  { src: "/navysvgs/star19.svg", left: 156.4, top: 24.2, size: 32 },
  { src: "/whitesvgs/hold9.svg", left: 817.2, top: 61.8, size: 32, rotate: -37 },
  { src: "/whitesvgs/star1.svg", left: 425.2, top: 33.0, size: 32 },
];

// Same idea, but authored against a ~343px-wide mobile header zone (matches a ~390px
// phone viewport minus page padding), with the mobile (non-md) title typography.
// Shown below md (768px). Paste "mobile" output from /dev/scatter-comp here.
const headerIconsMobile: DecorIcon[] = [
  { src: "/whitesvgs/girlclimbing.svg", left: 281.1, top: 73.0, size: 74 },
  { src: "/whitesvgs/star4.svg", left: 257.1, top: 21.0, size: 32 },
  { src: "/whitesvgs/star16.svg", left: 161.9, top: 18.6, size: 32 },
];

export function CompHeaderIcons() {
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
export function CompSideFrame() {
  return <RandomSideIcons pool={SIDE_ICON_POOL} />;
}
