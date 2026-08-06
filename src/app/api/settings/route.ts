import { auth } from "@/auth";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "president") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { role, currentPassword, newPassword } = await req.json();

  if (!role || !newPassword) {
    return NextResponse.json({ error: "role and newPassword required" }, { status: 400 });
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters" },
      { status: 400 }
    );
  }

  try {
    if (role === "president") {
      if (!currentPassword) {
        return NextResponse.json({ error: "currentPassword required" }, { status: 400 });
      }
      const [account] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.role, "president"));

      const valid = await bcrypt.compare(currentPassword, account.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await db
      .update(accounts)
      .set({ passwordHash: hash, updatedAt: new Date() })
      .where(eq(accounts.role, role as "president" | "eboard"));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[settings:POST]", err);
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}
