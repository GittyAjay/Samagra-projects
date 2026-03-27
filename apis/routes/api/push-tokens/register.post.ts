import { createError, defineEventHandler, readBody } from "h3";

import type { PushToken } from "../../../server/types/domain";
import { ensureUserId, requireFields } from "../../../server/utils/http";
import { createId, listCollection, nowIso, setItem } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const userId = ensureUserId(event);
  const body = await readBody<{ token?: string; platform?: PushToken["platform"] }>(event);
  requireFields(body, ["token", "platform"]);

  const token = String(body.token ?? "").trim();
  const platform = body.platform;

  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: "Push token is required"
    });
  }

  if (platform !== "android" && platform !== "ios") {
    throw createError({
      statusCode: 400,
      statusMessage: "Push platform must be ios or android"
    });
  }

  const timestamp = nowIso();
  const existing = (await listCollection<PushToken>("pushTokens")).find(
    (entry) => entry.userId === userId && entry.token === token
  );
  const record: PushToken = {
    id: existing?.id || createId("push"),
    userId,
    token,
    platform,
    active: true,
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp
  };

  await setItem("pushTokens", record);

  return {
    message: "Push token registered",
    tokenId: record.id
  };
});
