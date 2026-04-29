import { db } from "../src/lib/db";
import { accounts } from "../src/lib/db/schema";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function seed() {
  const presidentPass = process.env.PRESIDENT_PASS;
  const eboardPass = process.env.EBOARD_PASS;

  if (!presidentPass || !eboardPass) {
    throw new Error("PRESIDENT_PASS and EBOARD_PASS must be set in .env.local");
  }

  const [presidentHash, eboardHash] = await Promise.all([
    bcrypt.hash(presidentPass, 12),
    bcrypt.hash(eboardPass, 12),
  ]);

  await db.delete(accounts);
  await db.insert(accounts).values([
    { role: "president", passwordHash: presidentHash },
    { role: "eboard", passwordHash: eboardHash },
  ]);

  console.log("Accounts seeded successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
