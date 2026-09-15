import { db } from "../src/lib/db";
import { externalLinks } from "../src/lib/db/schema";
import "dotenv/config";

const KNOWN_LINKS = [
  {
    key: "waitlist",
    label: "Subsidized Membership Waitlist",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSeFksvV3RVJBygQjqccJw6WUUDtg4OtMvAP8kbsOPkuOlRZ_Q/viewform",
  },
  {
    key: "email-list",
    label: "Email List",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSf1PMnon-z2PGrIMbddYjNfZM_kH0gnxYbc1q9SfNP34T9PmA/viewform",
  },
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
