import { defineEventHandler, readBody } from "h3";

import { ensureRole, ensureUserId } from "../../../server/utils/http";
import {
  appendSupportConversationMessage,
  assertSupportConversationAccess
} from "../../../server/utils/support-chat";

export default defineEventHandler(async (event) => {
  const requesterRole = ensureRole(event, ["client", "staff", "admin"]);
  const requesterId = ensureUserId(event);
  const body = await readBody<{ userId?: string; text?: string }>(event);
  const userId = body.userId ?? requesterId;

  assertSupportConversationAccess(requesterRole, requesterId, userId);

  return appendSupportConversationMessage({
    userId,
    text: body.text ?? "",
    requesterRole
  });
});
