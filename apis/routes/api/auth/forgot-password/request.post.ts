import { createError, defineEventHandler, readBody } from "h3";

import type { UserProfile } from "../../../../server/types/domain";
import { generateOtp, normalizeIdentifier } from "../../../../server/utils/auth";
import { requireFields } from "../../../../server/utils/http";
import { sendOtpEmail } from "../../../../server/utils/mail";
import { listCollection, nowIso, setItem } from "../../../../server/utils/storage";

type PasswordResetRequest = {
  id: string;
  userId: string;
  otp: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<{ identifier?: string; email?: string; phone?: string }>(event);
  const rawIdentifier = body.identifier ?? body.email ?? body.phone;
  requireFields({ identifier: rawIdentifier }, ["identifier"]);

  const identifier = normalizeIdentifier(String(rawIdentifier ?? ""));
  if (!identifier) {
    throw createError({
      statusCode: 400,
      statusMessage: "Enter a valid email or phone number"
    });
  }

  const users = await listCollection<UserProfile>("users");
  const user = users.find((entry) => {
    const normalizedEmail = entry.email.toLowerCase().trim();
    const normalizedPhone = entry.phone.replace(/\D/g, "").slice(0, 15);
    return entry.active && (normalizedEmail === identifier || normalizedPhone === identifier);
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "No active user found for that email or phone"
    });
  }

  const otp = generateOtp();
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const resetRequest: PasswordResetRequest = {
    id: `reset_${user.id}`,
    userId: user.id,
    otp,
    expiresAt,
    createdAt,
    updatedAt: createdAt
  };

  await setItem("passwordResetRequests", resetRequest);

  try {
    await sendOtpEmail({
      to: user.email,
      fullName: user.fullName,
      otp,
      subject: "Reset your Samagra password",
      intro: "Use the OTP below to reset your Samagra account password."
    });
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage:
        error instanceof Error && error.message.includes("Email service is not configured")
          ? "Password reset email is not available yet. Set SMTP_USER to your full Gmail address in apis/.env."
          : "Unable to send password reset email right now. Please try again shortly."
    });
  }

  return {
    message: "OTP sent successfully",
    identifier,
    expiresInSeconds: 300
  };
});
