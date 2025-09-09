import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

const API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "ENM Hub";

if (API_KEY) sgMail.setApiKey(API_KEY);

type Body = {
  email: string;
  username?: string;
  subject?: string;
  html?: string;
  text?: string;
  type?: "welcome" | "verify" | "generic";
};

function defaultTemplate(username?: string) {
  const hi = username ? `, ${username}` : "";
  return {
    subject: "Welcome to ENM Hub 🎉",
    html: `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
      <h1>Welcome${hi}!</h1>
      <p>Thanks for joining <strong>ENM Hub</strong>.</p>
      <p>Please verify your email (check your inbox/spam), then finish your profile.</p>
      <p>Stay safe, have fun, and play ethically 💜</p>
    </div>`,
    text: `Welcome${hi}! Thanks for joining ENM Hub. Verify your email, then finish your profile.`
  };
}

export async function POST(req: Request) {
  try {
    const { email, username, subject, html, text }: Body = await req.json();

    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
    if (!API_KEY || !FROM_EMAIL) {
      return NextResponse.json({ error: "SendGrid not configured" }, { status: 500 });
    }

    const tmpl = defaultTemplate(username);
    const msg = {
      to: email,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: subject || tmpl.subject,
      html: html || tmpl.html,
      text: text || tmpl.text
    };

    const [resp] = await sgMail.send(msg);
    return NextResponse.json({ ok: true, status: resp.statusCode });
  } catch (e: any) {
    const details =
      e?.response?.body?.errors?.map((x: any) => x?.message).join("; ") ||
      e?.message ||
      "Unexpected error";
    console.error("[send-email] error:", details);
    return NextResponse.json({ error: details }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
