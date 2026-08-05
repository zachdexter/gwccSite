type DecorIcon = {
  src: string;
  left: number;
  top: number;
  size: number;
  rotate?: number;
};

function IconLayer({ icons, className }: { icons: DecorIcon[]; className: string }) {
  return (
    <div className={className}>
      {icons.map((icon, i) => (
        <img
          key={`${icon.src}-${i}`}
          src={icon.src}
          alt=""
          className="pointer-events-none select-none absolute"
          style={{
            left: `${icon.left}%`,
            top: `${icon.top}%`,
            width: icon.size,
            height: icon.size,
            transform: `translate(-50%, -50%) rotate(${icon.rotate ?? 0}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// Relative to the title block only (from the eyebrow label down to just above the
// grid). Scrolls away with the page. Paste "header" output from /dev/scatter-eboard here.
const headerIcons: DecorIcon[] = [
  { src: "/whitesvgs/star4.svg", left: 56.0, top: 64.5, size: 32 },
  { src: "/whitesvgs/star9.svg", left: 34.6, top: 9.2, size: 32 },
  { src: "/navysvgs/star19.svg", left: 21.1, top: 100.0, size: 32 },
  { src: "/navysvgs/star7.svg", left: 11.8, top: 18.9, size: 32 },
  { src: "/whitesvgs/dude.svg", left: 68.5, top: 100.0, size: 49 },
  { src: "/whitesvgs/climbstar.svg", left: 88.6, top: 45.1, size: 67 },
];

// Relative to a fixed 224px-wide, full-viewport-tall strip in the left/right margins.
// Fixed to the screen — never scrolls. Paste "left"/"right" output from /dev/scatter-eboard here.
const leftIcons: DecorIcon[] = [
  { src: "/whitesvgs/hold5.svg", left: 57.9, top: 48.4, size: 32 },
  { src: "/whitesvgs/hold11.svg", left: 15.4, top: 75.9, size: 32, rotate: -97 },
  { src: "/whitesvgs/star17.svg", left: 72.5, top: 57.8, size: 32 },
  { src: "/whitesvgs/star2.svg", left: 25.4, top: 88.1, size: 32 },
  { src: "/whitesvgs/star11.svg", left: 28.2, top: 24.5, size: 32 },
  { src: "/whitesvgs/hold10.svg", left: 70.4, top: 34.1, size: 32, rotate: 13 },
  { src: "/whitesvgs/carabiner.svg", left: 21.4, top: 62.4, size: 32, rotate: 42 },
  { src: "/whitesvgs/quickdraw.svg", left: 87.5, top: 69.1, size: 44 },
  { src: "/navysvgs/star19.svg", left: 18.2, top: 42.4, size: 32 },
  { src: "/navysvgs/star7.svg", left: 63.9, top: 92.1, size: 32 },
  { src: "/navysvgs/star11.svg", left: 68.2, top: 11.4, size: 32 },
];
const rightIcons: DecorIcon[] = [
  { src: "/navysvgs/star1.svg", left: 73.6, top: 9.7, size: 32 },
  { src: "/navysvgs/star12.svg", left: 72.5, top: 59.2, size: 32 },
  { src: "/navysvgs/star8.svg", left: 20.4, top: 45.2, size: 32 },
  { src: "/navysvgs/hold6.svg", left: 82.9, top: 75.4, size: 32 },
  { src: "/navysvgs/hold1.svg", left: 38.2, top: 87.2, size: 32 },
  { src: "/whitesvgs/star1.svg", left: 73.9, top: 36.8, size: 32 },
  { src: "/whitesvgs/star20.svg", left: 21.1, top: 64.9, size: 32 },
  { src: "/whitesvgs/star9.svg", left: 46.8, top: 31.5, size: 32 },
  { src: "/whitesvgs/hold3.svg", left: 21.4, top: 19.5, size: 32, rotate: 76 },
  { src: "/whitesvgs/rockon.svg", left: 62.9, top: 48.7, size: 49 },
  { src: "/whitesvgs/star2.svg", left: 66.8, top: 83.8, size: 32 },
];

export function EboardHeaderIcons() {
  return <IconLayer icons={headerIcons} className="absolute inset-0 pointer-events-none" />;
}

export function EboardSideFrame() {
  return (
    <>
      <IconLayer
        icons={leftIcons}
        className="fixed left-0 top-0 h-screen w-56 overflow-hidden pointer-events-none hidden 2xl:block"
      />
      <IconLayer
        icons={rightIcons}
        className="fixed right-0 top-0 h-screen w-56 overflow-hidden pointer-events-none hidden 2xl:block"
      />
    </>
  );
}
