import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const { secure_url } = await uploadToCloudinary(buffer, "gwcc/eboard-headshots", file.name);
    return NextResponse.json({ secureUrl: secure_url });
  } catch (err) {
    console.error("[eboard/headshot:POST]", err);
    return NextResponse.json({ error: "Failed to upload headshot." }, { status: 500 });
  }
}
