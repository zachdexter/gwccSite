import { auth } from "@/auth";
import { db } from "@/lib/db";
import { galleryPhotos } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const albumIdParam = searchParams.get("albumId");

  const query = db.select().from(galleryPhotos).orderBy(desc(galleryPhotos.uploadedAt));

  if (albumIdParam) {
    const albumId = parseInt(albumIdParam);
    if (!isNaN(albumId)) {
      const photos = await db
        .select()
        .from(galleryPhotos)
        .where(eq(galleryPhotos.albumId, albumId))
        .orderBy(desc(galleryPhotos.uploadedAt));
      return NextResponse.json(photos);
    }
  }

  const photos = await query;
  return NextResponse.json(photos);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const albumIdRaw = formData.get("albumId");

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const albumId = albumIdRaw ? parseInt(albumIdRaw as string) : NaN;
  if (isNaN(albumId)) return NextResponse.json({ error: "albumId required" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const { public_id, secure_url } = await uploadToCloudinary(buffer, "gwcc/gallery", file.name);

  const [photo] = await db
    .insert(galleryPhotos)
    .values({ cloudinaryId: public_id, secureUrl: secure_url, filename: file.name, albumId })
    .returning();

  return NextResponse.json(photo, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, cloudinaryId } = await req.json();

  await deleteFromCloudinary(cloudinaryId);
  await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));

  return NextResponse.json({ ok: true });
}
