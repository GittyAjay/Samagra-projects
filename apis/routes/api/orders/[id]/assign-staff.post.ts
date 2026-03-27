import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

import type { Order, UserProfile } from "../../../../server/types/domain";
import { ensureRole, requireFields } from "../../../../server/utils/http";
import { getItem, listCollection, nowIso, setItem } from "../../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["admin"]);
  const id = getRouterParam(event, "id");
  const body = await readBody<{ staffId?: string }>(event);
  requireFields(body, ["staffId"]);

  const order = id ? await getItem<Order>("orders", id) : null;
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }

  const users = await listCollection<UserProfile>("users");
  const staff = users.find((u) => u.id === body.staffId && u.role === "staff" && u.active);

  if (!staff) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or inactive staff user"
    });
  }

  const updated: Order = {
    ...order,
    staffId: body.staffId as string,
    updatedAt: nowIso()
  };

  await setItem("orders", updated);
  return updated;
});
