import { google } from "googleapis";
import { db } from "@/lib/db";
import { galleryAlbums, galleryPhotos } from "@/lib/db/schema";
import { eq, isNotNull } from "drizzle-orm";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

function getDriveClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!apiKey || !folderId) {
    throw new Error("GOOGLE_API_KEY and GOOGLE_DRIVE_FOLDER_ID must be set");
  }
  return { drive: google.drive({ version: "v3", auth: apiKey }), folderId };
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export async function syncGalleryFromDrive(): Promise<{ added: number; removed: number; albums: number }> {
  const { drive, folderId } = getDriveClient();

  // List subfolders in the root gallery Drive folder
  const foldersRes = await drive.files.list({
    q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    pageSize: 100,
  });
  const driveFolders = foldersRes.data.files ?? [];

  let added = 0;
  let removed = 0;
  let albumsCreated = 0;
  const allDriveFileIds: string[] = [];

  for (const folder of driveFolders) {
    if (!folder.id || !folder.name) continue;

    // Upsert album by driveFolderId
    const existingAlbums = await db
      .select()
      .from(galleryAlbums)
      .where(eq(galleryAlbums.driveFolderId, folder.id));

    let albumId: number;
    if (existingAlbums.length === 0) {
      const [newAlbum] = await db
        .insert(galleryAlbums)
        .values({ name: folder.name, driveFolderId: folder.id })
        .returning();
      albumId = newAlbum.id;
      albumsCreated++;
    } else {
      albumId = existingAlbums[0].id;
    }

    // List image files in this subfolder
    const filesRes = await drive.files.list({
      q: `'${folder.id}' in parents and trashed = false`,
      fields: "files(id, name, mimeType)",
      pageSize: 1000,
    });

    for (const file of filesRes.data.files ?? []) {
      if (!file.id || !file.name) continue;
      if (!file.mimeType?.startsWith("image/")) continue;

      allDriveFileIds.push(file.id);

      // Skip if already synced
      const existing = await db
        .select({ id: galleryPhotos.id })
        .from(galleryPhotos)
        .where(eq(galleryPhotos.driveFileId, file.id));
      if (existing.length > 0) continue;

      try {
        const fileRes = await drive.files.get(
          { fileId: file.id, alt: "media" },
          { responseType: "stream" }
        );
        const buffer = await streamToBuffer(fileRes.data as NodeJS.ReadableStream);
        const { public_id, secure_url } = await uploadToCloudinary(buffer, "gwcc/gallery", file.name);

        await db.insert(galleryPhotos).values({
          cloudinaryId: public_id,
          secureUrl: secure_url,
          filename: file.name,
          albumId,
          driveFileId: file.id,
        });
        added++;
      } catch (err) {
        console.error(`[driveSync] Failed to sync "${file.name}" (${file.id}):`, err);
      }
    }
  }

  // Remove photos that were deleted from Drive
  const dbDrivePhotos = await db
    .select()
    .from(galleryPhotos)
    .where(isNotNull(galleryPhotos.driveFileId));

  const driveFileIdSet = new Set(allDriveFileIds);
  const toDelete = dbDrivePhotos.filter((p) => p.driveFileId && !driveFileIdSet.has(p.driveFileId));

  for (const photo of toDelete) {
    try {
      await deleteFromCloudinary(photo.cloudinaryId);
    } catch {
      // best-effort; still remove from DB
    }
    await db.delete(galleryPhotos).where(eq(galleryPhotos.id, photo.id));
    removed++;
  }

  return { added, removed, albums: albumsCreated };
}
