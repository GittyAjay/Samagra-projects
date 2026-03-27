import { createError } from "h3";

import type { SupportChatMessage, SupportConversation, UserRole } from "../types/domain";
import { createId, getItem, nowIso, setItem } from "./storage";

const SUPPORT_COLLECTION = "support_conversations";

function defaultWelcomeMessage(): SupportChatMessage {
  return {
    id: createId("chatmsg"),
    author: "support",
    text: "Hello! Welcome to Samagra support. Tell us what you need help with.",
    createdAt: nowIso()
  };
}

export async function getOrCreateSupportConversation(userId: string) {
  const existing = await getItem<SupportConversation>(SUPPORT_COLLECTION, userId);

  if (existing) {
    return existing;
  }

  const timestamp = nowIso();
  const conversation: SupportConversation = {
    id: userId,
    userId,
    status: "open",
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [defaultWelcomeMessage()]
  };

  await setItem(SUPPORT_COLLECTION, conversation);
  return conversation;
}

export function assertSupportConversationAccess(
  requesterRole: UserRole,
  requesterId: string,
  targetUserId: string
) {
  if (requesterRole === "client" && requesterId !== targetUserId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Clients can only access their own support conversation"
    });
  }
}

export async function appendSupportConversationMessage(options: {
  userId: string;
  text: string;
  requesterRole: UserRole;
}) {
  const trimmed = options.text.trim();

  if (!trimmed) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message text is required"
    });
  }

  const conversation = await getOrCreateSupportConversation(options.userId);
  const timestamp = nowIso();

  const nextMessages: SupportChatMessage[] = [
    ...conversation.messages,
    {
      id: createId("chatmsg"),
      author: options.requesterRole === "staff" || options.requesterRole === "admin" ? "support" : "user",
      text: trimmed,
      createdAt: timestamp
    }
  ];

  // Keep the client experience complete even before a staffed inbox exists.
  if (options.requesterRole === "client") {
    nextMessages.push({
      id: createId("chatmsg"),
      author: "support",
      text: "Thanks for sharing. Our support team is reviewing this and will guide you shortly.",
      createdAt: nowIso()
    });
  }

  const updatedConversation: SupportConversation = {
    ...conversation,
    status: "open",
    updatedAt: nowIso(),
    messages: nextMessages
  };

  await setItem(SUPPORT_COLLECTION, updatedConversation);
  return updatedConversation;
}
