import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "navysvgs");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".svg"))
    .sort();

  return NextResponse.json({ files });
}
