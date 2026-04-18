import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resolveRecipient(fromValue?: string) {
  const trimmed = fromValue?.trim();
  if (!trimmed) return "";

  const match = trimmed.match(/<([^>]+)>/);
  return match?.[1]?.trim() || trimmed;
}

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Invalid request body.",
      },
      { status: 400 },
    );
  }

  const name = body.name?.trim() || "";
  const email = body.email?.trim() || "";
  const subject = body.subject?.trim() || "Zentry Contact";
  const message = body.message?.trim() || "";

  if (!name || !email || !message) {
    return NextResponse.json(
      {
        status: "error",
        message: "Name, email, and message are required.",
      },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      {
        status: "error",
        message: "Enter a valid email address.",
      },
      { status: 400 },
    );
  }

  const host = process.env.EMAIL_HOST?.trim();
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  const from = process.env.EMAIL_FROM?.trim() || user || "support@zentry.com";
  const to =
    process.env.CONTACT_EMAIL_TO?.trim() ||
    user ||
    resolveRecipient(process.env.EMAIL_FROM) ||
    "support@zentry.com";
  const appName = process.env.APP_NAME?.trim() || "Zentry";

  if (!host || !user || !pass) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Contact email is not configured yet. Add EMAIL_HOST, EMAIL_USER, and EMAIL_PASS to enable sending.",
      },
      { status: 500 },
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `[${appName}] ${subject}`,
      text: [`Name: ${name}`, `Email: ${email}`, `Subject: ${subject}`, "", message].join(
        "\n",
      ),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#0f172a">
          <h2 style="margin-bottom:16px;">New contact message from ${appName}</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <div style="margin-top:20px;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
            ${safeMessage}
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      status: "success",
      data: {
        message: "Your message has been sent.",
      },
    });
  } catch (error) {
    console.error("Contact email send failed", error);

    return NextResponse.json(
      {
        status: "error",
        message: "We could not send your message right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
