import { createError, defineEventHandler, readBody } from "h3";

import type { UserProfile } from "../../../server/types/domain";
import { normalizePhone } from "../../../server/utils/auth";
import { ensureRole, requireFields } from "../../../server/utils/http";
import { sendWelcomeEmail } from "../../../server/utils/mail";
import { createId, listCollection, nowIso, setItem } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["admin"]);
  const body = await readBody<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: string;
    designation?: string;
    taskTypes?: string[];
    active?: boolean;
  }>(event);

  requireFields(body, ["fullName", "email", "phone", "password", "role"]);

  if (body.role !== "staff") {
    throw createError({
      statusCode: 400,
      statusMessage: "Only staff role is allowed when creating users from this endpoint"
    });
  }

  const email = String(body.email).toLowerCase().trim();
  const phone = normalizePhone(String(body.phone));
  const users = await listCollection<UserProfile>("users");

  if (users.some((u) => u.email.toLowerCase() === email)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Email already registered"
    });
  }

  if (users.some((u) => u.phone.replace(/\D/g, "").slice(0, 15) === phone)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Phone number already registered"
    });
  }

  const timestamp = nowIso();
  const designation = body.designation?.trim();
  const taskTypes =
    Array.isArray(body.taskTypes) && body.taskTypes.length
      ? body.taskTypes.filter((t): t is string => typeof t === "string" && t.length > 0)
      : [];

  const meta: Record<string, unknown> = {};
  if (designation) {
    meta.designation = designation;
  }
  if (taskTypes.length) {
    meta.taskTypes = taskTypes;
  }

  const user: UserProfile = {
    id: createId("user"),
    role: "staff",
    fullName: String(body.fullName).trim(),
    email,
    phone,
    password: String(body.password),
    active: body.active !== false,
    createdAt: timestamp,
    updatedAt: timestamp,
    metadata: Object.keys(meta).length ? meta : undefined
  };

  await setItem("users", user);

  try {
    await sendWelcomeEmail({
      to: user.email,
      fullName: user.fullName,
      subject: "Your Samagra staff account is ready",
      intro: "An admin has created your staff account.",
      details: [
        `Role: ${user.role}`,
        `Login email: ${user.email}`,
        `Temporary password: ${user.password}`,
        "Please sign in and change your password as soon as possible."
      ]
    });
  } catch (error) {
    console.error("Failed to send staff welcome email", error);
  }

  const { password: _password, ...safe } = user;
  return { user: safe };
});
