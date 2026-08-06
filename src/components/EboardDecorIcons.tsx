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
  { src: "/whitesvgs/star18.svg", left: 76.4, top: 37.0, size: 32 },
  { src: "/navysvgs/star19.svg", left: 649.2, top: 149.8, size: 32 },
  { src: "/navysvgs/star9.svg", left: 145.2, top: 176.2, size: 32 },
  { src: "/navysvgs/girl.svg", left: 483.6, top: 137.8, size: 52 },
  { src: "/navysvgs/hold5.svg", left: 866.0, top: 57.8, size: 32, rotate: 54 },
  { src: "/navysvgs/sclip.svg", left: 795.6, top: 161.8, size: 41, rotate: -28 },
  { src: "/whitesvgs/star18.svg", left: 241.2, top: 52.2, size: 32 },
  { src: "/whitesvgs/star11.svg", left: 550.8, top: 38.6, size: 32 },
];

// Same idea, but authored against a ~343px-wide mobile header zone (matches a ~390px
// phone viewport minus page padding), with the mobile (non-md) title typography.
// Shown below md (768px). Paste "mobile" output from /dev/scatter-eboard here.
const headerIconsMobile: DecorIcon[] = [];

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
