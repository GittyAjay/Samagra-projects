import { createError, defineEventHandler, readBody } from "h3";

import type { UserProfile } from "../../../../server/types/domain";
import { normalizeIdentifier } from "../../../../server/utils/auth";
import { requireFields } from "../../../../server/utils/http";
import { getItem, listCollection, nowIso, removeItem, setItem } from "../../../../server/utils/storage";

type PasswordResetRequest = {
  id: string;
  userId: string;
  otp: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<{ identifier?: string; email?: string; phone?: string; otp?: string; newPassword?: string }>(
    event
  );
  const rawIdentifier = body.identifier ?? body.email ?? body.phone;
  requireFields({ identifier: rawIdentifier, otp: body.otp, newPassword: body.newPassword }, [
    "identifier",
    "otp",
    "newPassword"
  ]);

  const identifier = normalizeIdentifier(String(rawIdentifier ?? ""));
  const otp = String(body.otp ?? "").trim();
  const newPassword = String(body.newPassword ?? "");

  if (!identifier) {
    throw createError({
      statusCode: 400,
      statusMessage: "Enter a valid email or phone number"
    });
  }

  if (otp.length !== 6) {
    throw createError({
      statusCode: 400,
      statusMessage: "OTP must be 6 digits"
    });
  }

  if (newPassword.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password must be at least 6 characters"
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

  const resetRequest = await getItem<PasswordResetRequest>("passwordResetRequests", `reset_${user.id}`);
  if (!resetRequest) {
    throw createError({
      statusCode: 404,
      statusMessage: "No password reset request found"
    });
  }

  if (new Date(resetRequest.expiresAt).getTime() < Date.now()) {
    await removeItem("passwordResetRequests", resetRequest.id);
    throw createError({
      statusCode: 410,
      statusMessage: "OTP has expired. Please request a new one."
    });
  }

  if (resetRequest.otp !== otp) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid OTP"
    });
  }

  const updatedUser: UserProfile = {
    ...user,
    password: newPassword,
    updatedAt: nowIso()
  };

  await setItem("users", updatedUser);
  await removeItem("passwordResetRequests", resetRequest.id);

  return {
    message: "Password reset successful",
    verified: true
  };
});
