import { auth } from "@/auth";
import { syncGalleryFromDrive } from "@/lib/driveSync";
import { isValidCronSecret } from "@/lib/cronAuth";
import { NextResponse } from "next/server";

async function runSync(req: Request) {
  // Accept Vercel cron secret or a valid admin session
  const authHeader = req.headers.get("authorization");

  if (!isValidCronSecret(authHeader)) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncGalleryFromDrive();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[sync-gallery]", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

// Vercel cron always sends GET.
export async function GET(req: Request) {
  return runSync(req);
}

// Kept for manual/admin-triggered syncs.
export async function POST(req: Request) {
  return runSync(req);
}
