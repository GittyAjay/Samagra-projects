import { randomInt } from "node:crypto";

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 15);
}

export function normalizeIdentifier(value: string) {
  const trimmed = value.trim();
  return trimmed.includes("@") ? normalizeEmail(trimmed) : normalizePhone(trimmed);
}

export function generateOtp() {
  return String(randomInt(100000, 1000000));
}

export function maskEmail(value: string) {
  const email = normalizeEmail(value);
  const [local, domain] = email.split("@");

  if (!local || !domain) {
    return email;
  }

  const visibleLocal = local.length <= 2 ? local[0] ?? "*" : `${local[0]}${"*".repeat(Math.max(local.length - 2, 1))}${local.at(-1)}`;
  return `${visibleLocal}@${domain}`;
}
