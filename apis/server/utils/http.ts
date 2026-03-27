import { createError, getHeader } from "h3";

import type { UserRole } from "../types/domain";

export function requireFields<T extends Record<string, unknown>>(
  body: T,
  fields: Array<keyof T>
) {
  for (const field of fields) {
    const value = body[field];
    if (value === undefined || value === null || value === "") {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required field: ${String(field)}`
      });
    }
  }
}

export function ensureRole(event: Parameters<typeof getHeader>[0], roles: UserRole[]) {
  const role = getHeader(event, "x-user-role") as UserRole | undefined;
  if (!role || !roles.includes(role)) {
    throw createError({
      statusCode: 403,
      statusMessage: `This endpoint requires one of these roles: ${roles.join(", ")}`
    });
  }
  return role;
}

export function ensureUserId(event: Parameters<typeof getHeader>[0]) {
  const userId = getHeader(event, "x-user-id");
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "x-user-id header is required"
    });
  }
  return userId;
}
