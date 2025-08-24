import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body } = await req.json();

    // Never try to send without a valid "to".
    if (!to || typeof to !== "string" || !to.includes("@")) {
      return NextResponse.json({ error: "`to` email is required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: requiredEnv("EMAIL_SERVER_HOST"),
      port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
      secure: false,
      auth: {
        user: requiredEnv("EMAIL_SERVER_USER"),
        pass: requiredEnv("EMAIL_SERVER_PASSWORD"),
      },
    });

    await transporter.sendMail({
      to,
      from: requiredEnv("EMAIL_FROM"),
      subject: subject ?? "Message",
      text: body ?? "",
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("email route error:", err);
    return NextResponse.json({ error: err?.message ?? "Email error" }, { status: 500 });
  }
}
