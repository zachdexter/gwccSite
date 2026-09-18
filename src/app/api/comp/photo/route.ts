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
    const { public_id, secure_url } = await uploadToCloudinary(buffer, "gwcc/comp-photos", file.name);
    return NextResponse.json({ secureUrl: secure_url, cloudinaryId: public_id });
  } catch (err) {
    console.error("[comp/photo:POST]", err);
    return NextResponse.json({ error: "Failed to upload photo." }, { status: 500 });
  }
}
