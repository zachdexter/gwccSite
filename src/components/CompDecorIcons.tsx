import { PageIconFill } from "@/components/PageIconFill";
import { SIDE_ICON_POOL } from "@/lib/decorIconPool";
import { computeClusterBounds, type DecorIcon } from "@/lib/decorBounds";

// Fixed pixel offsets from the title block's top-left corner, hugging the eyebrow + h1 text.
// Shown at every viewport width — kept small/tight so it still reads correctly whether the
// header zone is a narrow phone width or the full desktop max-width. Paste output from
// /dev/scatter-comp here.
const headerIcons: DecorIcon[] = [
  { src: "/whitesvgs/girlclimbing.svg", left: 183.9, top: 225.8, size: 96 },
  { src: "/whitesvgs/star14.svg", left: 103.1, top: 37.0, size: 32 },
  { src: "/whitesvgs/star13.svg", left: 311.1, top: 33.8, size: 32 },
  { src: "/whitesvgs/hold6.svg", left: 302.3, top: 222.6, size: 32 },
  { src: "/navysvgs/star5.svg", left: 45.5, top: 174.6, size: 32 },
  { src: "/navysvgs/hold3.svg", left: 254.3, top: 109.0, size: 32, rotate: -39 },
];

const clusterBounds = computeClusterBounds(headerIcons);

export function CompHeaderIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
  );
}

// Fills whatever blank page space is left — around the header on narrow/landscape/tablet
// widths, and in the side gutters on wide desktop — procedurally, at every viewport width.
export function CompDecorFill() {
  return <PageIconFill pool={SIDE_ICON_POOL} clusterBounds={clusterBounds} />;
}
