import { createError, defineEventHandler, readBody } from "h3";

import type { UserProfile } from "../../../../server/types/domain";
import { normalizeEmail, normalizePhone } from "../../../../server/utils/auth";
import { requireFields } from "../../../../server/utils/http";
import { sendWelcomeEmail } from "../../../../server/utils/mail";
import { createId, getItem, listCollection, nowIso, removeItem, setItem } from "../../../../server/utils/storage";

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
  const body = await readBody<{ email?: string; otp?: string }>(event);
  requireFields(body, ["email", "otp"]);

  const email = normalizeEmail(String(body.email ?? ""));
  const otp = String(body.otp ?? "").trim();

  if (otp.length !== 6) {
    throw createError({
      statusCode: 400,
      statusMessage: "OTP must be 6 digits"
    });
  }

  const request = await getItem<RegistrationOtpRequest>("registrationOtpRequests", `register_${email}`);
  if (!request) {
    throw createError({
      statusCode: 404,
      statusMessage: "No pending registration found for this email"
    });
  }

  if (new Date(request.expiresAt).getTime() < Date.now()) {
    await removeItem("registrationOtpRequests", request.id);
    throw createError({
      statusCode: 410,
      statusMessage: "OTP has expired. Please request a new one."
    });
  }

  if (request.otp !== otp) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid OTP"
    });
  }

  const users = await listCollection<UserProfile>("users");

  if (users.some((user) => user.email.toLowerCase() === request.email)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Email already registered"
    });
  }

  const requestPhone = normalizePhone(request.phone);
  if (users.some((user) => normalizePhone(user.phone) === requestPhone)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Phone number already registered"
    });
  }

  const timestamp = nowIso();
  const user: UserProfile = {
    id: createId("user"),
    role: "client",
    fullName: request.fullName,
    email: request.email,
    phone: request.phone,
    password: request.password,
    active: true,
    emailVerified: true,
    emailVerifiedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await setItem("users", user);
  await removeItem("registrationOtpRequests", request.id);

  try {
    await sendWelcomeEmail({
      to: user.email,
      fullName: user.fullName,
      subject: "Welcome to Samagra Solar",
      intro: "Your account has been verified successfully.",
      details: [
        "You can now sign in to the Samagra app.",
        "Use your registered email or phone number with your password to continue."
      ]
    });
  } catch (error) {
    console.error("Failed to send welcome email", error);
  }

  const { password: _password, ...safeUser } = user;
  return {
    message: "Email verified and account created successfully",
    user: safeUser
  };
});
