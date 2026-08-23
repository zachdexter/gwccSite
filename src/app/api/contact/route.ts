import { Resend } from "resend";
import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof message !== "string" || !message.trim()
  ) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "GWCC Contact Form <onboarding@resend.dev>",
      to: siteConfig.contactEmail,
      replyTo: email,
      subject: `Contact form: ${name}`,
      text: `${message}\n\n---\nFrom: ${name} <${email}>`,
    });

    if (error) {
      console.error("[contact:POST]", error);
      return NextResponse.json({ error: "Failed to send message." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact:POST]", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
