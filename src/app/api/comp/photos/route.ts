import { auth } from "@/auth";
import { db } from "@/lib/db";
import { compMemberPhotos } from "@/lib/db/schema";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

type IncomingPhoto = { id?: number; cloudinaryId: string; secureUrl: string };

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { memberId, photos } = (await req.json()) as { memberId: number; photos: IncomingPhoto[] };
  if (!memberId || !Array.isArray(photos)) {
    return NextResponse.json({ error: "memberId and photos are required" }, { status: 400 });
  }

  try {
    const existing = await db
      .select()
      .from(compMemberPhotos)
      .where(eq(compMemberPhotos.memberId, memberId));

    const incomingIds = new Set(photos.filter((p) => p.id).map((p) => p.id));
    const toDelete = existing.filter((row) => !incomingIds.has(row.id));

    if (toDelete.length) {
      await db.delete(compMemberPhotos).where(
        inArray(compMemberPhotos.id, toDelete.map((row) => row.id))
      );
      for (const row of toDelete) {
        deleteFromCloudinary(row.cloudinaryId).catch((err) =>
          console.error("[comp/photos] Failed to delete photo from Cloudinary", err)
        );
      }
    }

    const toInsert = photos
      .map((p, i) => ({ p, displayOrder: i }))
      .filter(({ p }) => !p.id)
      .map(({ p, displayOrder }) => ({
        memberId,
        cloudinaryId: p.cloudinaryId,
        secureUrl: p.secureUrl,
        displayOrder,
      }));
    if (toInsert.length) await db.insert(compMemberPhotos).values(toInsert);

    const existingById = new Map(existing.map((row) => [row.id, row]));
    const reorders = photos
      .map((p, i) => ({ p, displayOrder: i }))
      .filter(({ p, displayOrder }) => p.id && existingById.get(p.id!)?.displayOrder !== displayOrder);
    await Promise.all(
      reorders.map(({ p, displayOrder }) =>
        db.update(compMemberPhotos).set({ displayOrder }).where(eq(compMemberPhotos.id, p.id!))
      )
    );

    const fresh = await db
      .select()
      .from(compMemberPhotos)
      .where(eq(compMemberPhotos.memberId, memberId))
      .orderBy(compMemberPhotos.displayOrder);

    return NextResponse.json({ photos: fresh });
  } catch (err) {
    console.error("[comp/photos:PUT]", err);
    return NextResponse.json({ error: "Failed to save photos." }, { status: 500 });
  }
}
