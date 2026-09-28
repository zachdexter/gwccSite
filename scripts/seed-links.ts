import { db } from "../src/lib/db";
import { externalLinks } from "../src/lib/db/schema";
import "dotenv/config";

const KNOWN_LINKS = [
  {
    key: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/gwclubclimb",
  },
  {
    key: "linktree",
    label: "Linktree",
    url: "https://linktr.ee/gwclubclimb",
  },
];

async function seed() {
  await db.insert(externalLinks).values(KNOWN_LINKS).onConflictDoNothing({ target: externalLinks.key });
  console.log("Links seeded (existing keys left untouched).");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
