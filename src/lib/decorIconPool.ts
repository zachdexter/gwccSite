const STAR_COUNT = 20;
const GEAR_ICONS = ["carabiner", "quickdraw", "chalkbag", "sclip"];

function starsAndGear(folder: "navysvgs" | "whitesvgs", holdCount: number) {
  const stars = Array.from({ length: STAR_COUNT }, (_, i) => `/${folder}/star${i + 1}.svg`);
  const holds = Array.from({ length: holdCount }, (_, i) => `/${folder}/hold${i + 1}.svg`);
  const gear = GEAR_ICONS.map((name) => `/${folder}/${name}.svg`);
  return [...stars, ...holds, ...gear];
}

// Small/abstract icons only — stars, holds, gear. No character illustrations, logos, or ropes.
export const SIDE_ICON_POOL = [...starsAndGear("navysvgs", 11), ...starsAndGear("whitesvgs", 13)];
