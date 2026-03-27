import { defineEventHandler, getQuery } from "h3";

import type { Notification } from "../../../server/types/domain";
import { listCollection } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const notifications = await listCollection<Notification>("notifications");

  return notifications.filter((notification) =>
    query.userId ? notification.userId === String(query.userId) : true
  );
});
