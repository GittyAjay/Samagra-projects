import { defineEventHandler, getQuery } from "h3";

import { ensureRole, ensureUserId } from "../../../server/utils/http";
import {
  assertSupportConversationAccess,
  getOrCreateSupportConversation
} from "../../../server/utils/support-chat";

export default defineEventHandler(async (event) => {
  const requesterRole = ensureRole(event, ["client", "staff", "admin"]);
  const requesterId = ensureUserId(event);
  const query = getQuery(event);
  const userId = query.userId ? String(query.userId) : requesterId;

  assertSupportConversationAccess(requesterRole, requesterId, userId);

  return getOrCreateSupportConversation(userId);
});
