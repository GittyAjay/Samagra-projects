import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

import type { Order } from "../../../../server/types/domain";
import { ensureRole, requireFields } from "../../../../server/utils/http";
import { getItem, nowIso, setItem } from "../../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["client", "staff", "admin"]);
  const id = getRouterParam(event, "id");
  const body = await readBody<{ milestoneId?: string; receiptUrl?: string }>(event);
  requireFields(body, ["milestoneId"]);

  const order = id ? await getItem<Order>("orders", id) : null;
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }

  const paymentMilestones = order.paymentMilestones.map((milestone) =>
    milestone.id === body.milestoneId
      ? {
          ...milestone,
          status: "paid" as const,
          paidAt: nowIso(),
          receiptUrl: body.receiptUrl ?? milestone.receiptUrl
        }
      : milestone
  );

  const updated: Order = {
    ...order,
    paymentMilestones,
    updatedAt: nowIso()
  };

  await setItem("orders", updated);
  return updated;
});
