import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
}

export function isMailConfigured() {
  return Boolean(
    process.env.SMTP_USER?.includes("@") &&
      getSmtpPassword() &&
      getFromAddress().includes("@")
  );
}

function getSmtpPassword() {
  return (process.env.SMTP_APP_PASSWORD || "").replace(/\s+/g, "");
}

function getTransporter() {
  if (!isMailConfigured()) {
    throw new Error("Email service is not configured. Set valid SMTP_USER, SMTP_APP_PASSWORD, and MAIL_FROM values.");
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: parseBoolean(process.env.SMTP_SECURE, true),
    auth: {
      user: process.env.SMTP_USER,
      pass: getSmtpPassword()
    }
  });

  return cachedTransporter;
}

function getFromAddress() {
  return process.env.MAIL_FROM || process.env.SMTP_USER || "";
}

export async function sendEmail(payload: EmailPayload) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: getFromAddress(),
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html
  });
}

export async function sendOtpEmail({
  to,
  fullName,
  otp,
  subject,
  intro,
  expiresInMinutes = 5
}: {
  to: string;
  fullName?: string;
  otp: string;
  subject: string;
  intro: string;
  expiresInMinutes?: number;
}) {
  const greeting = fullName ? `Hi ${fullName},` : "Hi,";

  await sendEmail({
    to,
    subject,
    text: `${greeting}\n\n${intro}\n\nYour OTP is: ${otp}\nThis OTP expires in ${expiresInMinutes} minutes.\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <p>${greeting}</p>
        <p>${intro}</p>
        <p style="margin: 24px 0;">
          <span style="display: inline-block; padding: 12px 18px; font-size: 24px; font-weight: 700; letter-spacing: 4px; background: #fff7ed; color: #c2410c; border-radius: 10px;">
            ${otp}
          </span>
        </p>
        <p>This OTP expires in ${expiresInMinutes} minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `
  });
}

export async function sendWelcomeEmail({
  to,
  fullName,
  subject,
  intro,
  details
}: {
  to: string;
  fullName?: string;
  subject: string;
  intro: string;
  details: string[];
}) {
  const greeting = fullName ? `Hi ${fullName},` : "Hi,";
  const detailText = details.map((detail) => `- ${detail}`).join("\n");
  const detailHtml = details.map((detail) => `<li>${detail}</li>`).join("");

  await sendEmail({
    to,
    subject,
    text: `${greeting}\n\n${intro}\n\n${detailText}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <p>${greeting}</p>
        <p>${intro}</p>
        <ul>${detailHtml}</ul>
      </div>
    `
  });
}
