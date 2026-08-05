import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FOLDERS = ["navysvgs", "whitesvgs"] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("dir") ?? "navysvgs";
  const folder = FOLDERS.includes(requested as (typeof FOLDERS)[number]) ? requested : "navysvgs";

  const dir = path.join(process.cwd(), "public", folder);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".svg"))
    .sort();

  return NextResponse.json({ files });
}
