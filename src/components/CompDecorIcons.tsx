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
// grid). Scrolls away with the page. Paste "header" output from /dev/scatter-comp here.
const headerIcons: DecorIcon[] = [];

// Relative to a fixed 224px-wide, full-viewport-tall strip in the left/right margins.
// Fixed to the screen — never scrolls. Paste "left"/"right" output from /dev/scatter-comp here.
const leftIcons: DecorIcon[] = [];
const rightIcons: DecorIcon[] = [];

export function CompHeaderIcons() {
  return <IconLayer icons={headerIcons} className="absolute inset-0 pointer-events-none" />;
}

export function CompSideFrame() {
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
