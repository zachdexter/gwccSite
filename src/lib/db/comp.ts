import { db } from "@/lib/db";
import { compMembers, compMemberPhotos } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function getCompMembers({ activeOnly = true }: { activeOnly?: boolean } = {}) {
  const members = await db
    .select()
    .from(compMembers)
    .where(activeOnly ? eq(compMembers.isActive, true) : undefined)
    .orderBy(compMembers.displayOrder, compMembers.name);

  if (members.length === 0) return [];

  const photoRows = await db
    .select()
    .from(compMemberPhotos)
    .where(inArray(compMemberPhotos.memberId, members.map((m) => m.id)))
    .orderBy(compMemberPhotos.memberId, compMemberPhotos.displayOrder);

  const byMember = new Map<number, typeof photoRows>();
  for (const row of photoRows) {
    const list = byMember.get(row.memberId);
    if (list) list.push(row);
    else byMember.set(row.memberId, [row]);
  }

  return members.map((m) => ({ ...m, photos: byMember.get(m.id) ?? [] }));
}
