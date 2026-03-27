import { createError, defineEventHandler, readBody } from "h3";

import type { UserProfile } from "../../../server/types/domain";
import { requireFields } from "../../../server/utils/http";
import { generateOtp, normalizeEmail, normalizePhone } from "../../../server/utils/auth";
import { sendOtpEmail } from "../../../server/utils/mail";
import { listCollection, nowIso, setItem } from "../../../server/utils/storage";

type RegistrationOtpRequest = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  otp: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<UserProfile>>(event);
  requireFields(body, ["fullName", "email", "phone", "password"]);

  const email = normalizeEmail(String(body.email ?? ""));
  const phone = normalizePhone(String(body.phone ?? ""));
  const fullName = String(body.fullName ?? "").trim();
  const password = String(body.password ?? "");
  const users = await listCollection<UserProfile>("users");

  if (!email.includes("@")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Enter a valid email address"
    });
  }

  if (phone.length < 10) {
    throw createError({
      statusCode: 400,
      statusMessage: "Enter a valid phone number"
    });
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password must be at least 6 characters"
    });
  }

  if (users.some((user) => user.email.toLowerCase() === email)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Email already registered"
    });
  }

  if (users.some((user) => user.phone.replace(/\D/g, "").slice(0, 15) === phone)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Phone number already registered"
    });
  }

  const timestamp = nowIso();
  const otp = generateOtp();
  const request: RegistrationOtpRequest = {
    id: `register_${email}`,
    fullName,
    email,
    phone,
    password,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await setItem("registrationOtpRequests", request);

  try {
    await sendOtpEmail({
      to: email,
      fullName,
      otp,
      subject: "Verify your Samagra account",
      intro: "Use the OTP below to verify your email address and finish creating your Samagra account."
    });
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage:
        error instanceof Error && error.message.includes("Email service is not configured")
          ? "Email OTP is not available yet. Set SMTP_USER to your full Gmail address and keep SMTP_APP_PASSWORD in apis/.env."
          : "Unable to send verification email right now. Please try again shortly."
    });
  }

  return {
    message: "Verification OTP sent to your email",
    email,
    expiresInSeconds: 300
  };
});
