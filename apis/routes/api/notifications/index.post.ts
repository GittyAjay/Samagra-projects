import { defineEventHandler, readBody } from "h3";

import type { Notification } from "../../../server/types/domain";
import { ensureRole, requireFields } from "../../../server/utils/http";
import { notifyUser } from "../../../server/utils/notifications";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["staff", "admin"]);
  const body = await readBody<Partial<Notification>>(event);
  requireFields(body, ["userId", "title", "message", "type"]);

  return notifyUser({
    userId: body.userId as string,
    title: body.title as string,
    message: body.message as string,
    type: body.type as Notification["type"],
    emailSubject: body.title as string
  });
});
