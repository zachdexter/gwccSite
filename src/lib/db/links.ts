import { db } from "@/lib/db";
import { externalLinks } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export const LINK_KEYS = ["waitlist", "email-list", "instagram", "linktree"] as const;
export type LinkKey = (typeof LINK_KEYS)[number];

export async function getLinks(keys: LinkKey[]): Promise<Record<string, string | null>> {
  const rows = await db
    .select({ key: externalLinks.key, url: externalLinks.url })
    .from(externalLinks)
    .where(and(inArray(externalLinks.key, keys), eq(externalLinks.isActive, true)));

  const map = Object.fromEntries(keys.map((k) => [k, null])) as Record<string, string | null>;
  for (const row of rows) if (row.key) map[row.key] = row.url;
  return map;
}

export async function getLink(key: LinkKey): Promise<string | null> {
  return (await getLinks([key]))[key];
}
