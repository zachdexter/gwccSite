import { RandomSideIcons } from "@/components/RandomSideIcons";
import { SIDE_ICON_POOL } from "@/lib/decorIconPool";

type DecorIcon = {
  src: string;
  left: number;
  top: number;
  size: number;
  rotate?: number;
};

// Fixed pixel offsets from the title block's top-left corner (authored at a ~1104px-wide
// desktop header zone, matching the gallery page's max-w-6xl content column). Scrolls away
// with the page. On narrower screens the icons keep these exact pixel positions and simply
// get clipped by the container's overflow-hidden instead of repositioning onto the
// (possibly wrapped) title text — same "crop at the edges" behavior as the /login page.
// Shown at md (768px) and up.
const headerIcons: DecorIcon[] = [
  { src: "/whitesvgs/mountain.svg", left: 726.4, top: 169.8, size: 67 },
  { src: "/whitesvgs/star19.svg", left: 73.6, top: 32.2, size: 32 },
  { src: "/whitesvgs/star14.svg", left: 174.4, top: 97.8, size: 32 },
  { src: "/whitesvgs/star9.svg", left: 40.8, top: 191.4, size: 32 },
  { src: "/whitesvgs/carabiner.svg", left: 1004.8, top: 140.2, size: 32 },
  { src: "/whitesvgs/hold9.svg", left: 329.6, top: 178.6, size: 32, rotate: 60 },
  { src: "/whitesvgs/star9.svg", left: 503.2, top: 111.4, size: 32 },
  { src: "/whitesvgs/star7.svg", left: 815.2, top: 53.0, size: 32 },
];

// Same idea, but authored against a ~343px-wide mobile header zone (matches a ~390px
// phone viewport minus page padding), with the mobile (non-md) title typography.
// Shown below md (768px).
const headerIconsMobile: DecorIcon[] = [
  { src: "/whitesvgs/star13.svg", left: 161.1, top: 142.6, size: 32 },
  { src: "/whitesvgs/star18.svg", left: 37.1, top: 167.4, size: 32 },
  { src: "/whitesvgs/star14.svg", left: 89.9, top: 60.2, size: 32 },
  { src: "/whitesvgs/mountain.svg", left: 289.1, top: 163.4, size: 57 },
  { src: "/whitesvgs/rocklogo.svg", left: 279.5, top: 63.4, size: 86, rotate: 8 },
];

export function GalleryHeaderIcons() {
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

// Left/right margins — procedurally generated on every page load, scrolls with the page, and
// automatically fills whatever height the album list ends up being. Uses the gallery page's
// max-w-6xl content width so the gutters line up correctly.
export function GallerySideFrame() {
  return <RandomSideIcons pool={SIDE_ICON_POOL} contentMaxWidth={1152} />;
}
