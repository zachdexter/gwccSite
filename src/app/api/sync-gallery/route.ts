import { auth } from "@/auth";
import { syncGalleryFromDrive } from "@/lib/driveSync";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Accept Vercel cron secret or a valid admin session
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncGalleryFromDrive();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[sync-gallery]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
