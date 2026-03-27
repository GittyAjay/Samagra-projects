import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

import type { Order } from "../../../../server/types/domain";
import { ORDER_PIPELINE } from "../../../../server/utils/constants";
import { ensureRole, requireFields } from "../../../../server/utils/http";
import { notifyUser } from "../../../../server/utils/notifications";
import { getItem, nowIso, setItem } from "../../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["staff", "admin"]);
  const id = getRouterParam(event, "id");
  const body = await readBody<{ status?: Order["status"]; note?: string }>(event);
  requireFields(body, ["status"]);

  if (!ORDER_PIPELINE.includes(body.status as Order["status"])) {
    throw createError({ statusCode: 400, statusMessage: "Invalid order status" });
  }

  const order = id ? await getItem<Order>("orders", id) : null;
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }

  const updated: Order = {
    ...order,
    status: body.status as Order["status"],
    updatedAt: nowIso(),
    statusHistory: [
      ...order.statusHistory,
      { status: body.status as Order["status"], updatedAt: nowIso(), note: body.note }
    ]
  };

  await setItem("orders", updated);
  await notifyUser({
    userId: order.clientId,
    title: "Order status updated",
    message: `Your order ${order.id} is now marked as ${body.status}.`,
    type: "info",
    emailSubject: "Order status updated"
  });

  return updated;
});
