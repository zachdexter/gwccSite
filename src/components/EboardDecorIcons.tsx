import { PageIconFill } from "@/components/PageIconFill";
import { SIDE_ICON_POOL } from "@/lib/decorIconPool";
import { computeClusterBounds, type DecorIcon } from "@/lib/decorBounds";

// Fixed pixel offsets from the title block's top-left corner, hugging the eyebrow + h1 text.
// Shown at every viewport width — kept small/tight so it still reads correctly whether the
// header zone is a narrow phone width or the full desktop max-width. Paste output from
// /dev/scatter-eboard here.
const headerIcons: DecorIcon[] = [
  { src: "/whitesvgs/dude.svg", left: 190.3, top: 53.8, size: 49 },
  { src: "/whitesvgs/star14.svg", left: 149.5, top: 175.4, size: 32 },
  { src: "/whitesvgs/star13.svg", left: 86.3, top: 97.8, size: 32 },
  { src: "/navysvgs/star9.svg", left: 297.5, top: 131.4, size: 32 },
  { src: "/navysvgs/hold4.svg", left: 39.1, top: 229.8, size: 32, rotate: -82 },
];

const clusterBounds = computeClusterBounds(headerIcons);

export function EboardHeaderIcons() {
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
export function EboardDecorFill() {
  return <PageIconFill pool={SIDE_ICON_POOL} clusterBounds={clusterBounds} />;
}
