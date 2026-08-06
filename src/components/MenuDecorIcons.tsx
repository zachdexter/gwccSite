type DecorIcon = {
  src: string;
  left: number;
  top: number;
  size: number;
  rotate?: number;
};

// Fixed pixel offsets from the drawer's top-left corner (authored at a ~320px-wide
// mobile drawer canvas in /dev/scatter-menu). Paste that page's "Copy code" output here.
const menuIcons: DecorIcon[] = [
  { src: "/navysvgs/star18.svg", left: 118.0, top: 129.0, size: 32 },
  { src: "/navysvgs/star16.svg", left: 170.8, top: 250.6, size: 32 },
  { src: "/navysvgs/star14.svg", left: 226.8, top: 68.2, size: 32 },
  { src: "/navysvgs/star7.svg", left: 122.0, top: 193.0, size: 32 },
  { src: "/whitesvgs/star3.svg", left: 237.2, top: 366.6, size: 32 },
  { src: "/whitesvgs/star9.svg", left: 162.8, top: 516.2, size: 32 },
  { src: "/whitesvgs/star11.svg", left: 51.6, top: 373.0, size: 32 },
  { src: "/whitesvgs/carabiner.svg", left: 56.4, top: 610.6, size: 32, rotate: 53 },
  { src: "/whitesvgs/hold10.svg", left: 161.2, top: 337.0, size: 32, rotate: 1 },
  { src: "/whitesvgs/hold12.svg", left: 111.6, top: 437.8, size: 32, rotate: 78 },
  { src: "/whitesvgs/hold9.svg", left: 244.4, top: 608.2, size: 32, rotate: -20 },
];

export function MenuDecorIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {menuIcons.map((icon, i) => (
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
