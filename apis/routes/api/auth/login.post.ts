import { randomUUID } from "node:crypto";

import { createError, defineEventHandler, readBody } from "h3";

import type { Session, UserProfile } from "../../../server/types/domain";
import { requireFields } from "../../../server/utils/http";
import { listCollection, nowIso, setItem } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<UserProfile> & { identifier?: string }>(event);
  requireFields(body, ["password"]);

  const identifier = String(body.identifier ?? body.email ?? "").trim();
  if (!identifier) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required field: identifier"
    });
  }

  const normalizedEmail = identifier.toLowerCase();
  const normalizedPhone = identifier.replace(/\D/g, "").slice(0, 15);
  const isPhoneLogin = normalizedPhone.length >= 10 && !identifier.includes("@");

  const users = await listCollection<UserProfile>("users");
  const matches = users.filter(
    (entry) =>
      (
        entry.email.toLowerCase() === normalizedEmail ||
        entry.phone.replace(/\D/g, "").slice(0, 15) === normalizedPhone
      ) &&
      entry.password === body.password &&
      entry.active
  );

  if (matches.length > 1 && !isPhoneLogin) {
    throw createError({
      statusCode: 409,
      statusMessage:
        "Multiple accounts use this email. Sign in with your phone number or ask admin to keep email unique."
    });
  }

  const user = matches[0];

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials"
    });
  }

  if (user.role === "client" && user.emailVerified === false) {
    throw createError({
      statusCode: 403,
      statusMessage: "Verify your email before signing in"
    });
  }

  const session: Session = {
    id: `session_${randomUUID()}`,
    userId: user.id,
    role: user.role,
    token: `token_${randomUUID()}`,
    createdAt: nowIso()
  };

  await setItem("sessions", session);

  return {
    token: session.token,
    user: {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      phone: user.phone,
      metadata: user.metadata
    }
  };
});
