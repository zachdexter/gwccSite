import { PageIconFill } from "@/components/PageIconFill";
import { SIDE_ICON_POOL } from "@/lib/decorIconPool";
import { computeClusterBounds, type DecorIcon } from "@/lib/decorBounds";

// Fixed pixel offsets from the title block's top-left corner, hugging the eyebrow + h1 text.
// Shown at every viewport width — kept small/tight so it still reads correctly whether the
// header zone is a narrow phone width or the full desktop max-width. Paste output from
// /dev/scatter-gallery here.
const headerIcons: DecorIcon[] = [
  { src: "/navysvgs/mountain.svg", left: 255.5, top: 212.2, size: 68 },
  { src: "/navysvgs/star1.svg", left: 105.9, top: 98.6, size: 32 },
  { src: "/whitesvgs/star17.svg", left: 57.9, top: 187.4, size: 32 },
  { src: "/whitesvgs/carabiner.svg", left: 303.5, top: 37.8, size: 32 },
  { src: "/whitesvgs/hold4.svg", left: 109.1, top: 28.2, size: 32, rotate: 6 },
  { src: "/whitesvgs/star3.svg", left: 214.7, top: 109.8, size: 32 },
];

const clusterBounds = computeClusterBounds(headerIcons);

export function GalleryHeaderIcons() {
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
export function GalleryDecorFill() {
  return <PageIconFill pool={SIDE_ICON_POOL} clusterBounds={clusterBounds} />;
}
