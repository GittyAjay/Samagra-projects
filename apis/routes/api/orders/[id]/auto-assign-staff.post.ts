import { createError, defineEventHandler, getRouterParam } from "h3";

import type { Lead, Order, UserProfile } from "../../../../server/types/domain";
import { orderRoutingTaskType, pickAutoAssignStaff } from "../../../../server/utils/auto-assign";
import { ensureRole } from "../../../../server/utils/http";
import { getItem, listCollection, nowIso, setItem } from "../../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["admin"]);
  const id = getRouterParam(event, "id");

  const order = id ? await getItem<Order>("orders", id) : null;
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }

  const [users, leads, orders] = await Promise.all([
    listCollection<UserProfile>("users"),
    listCollection<Lead>("leads"),
    listCollection<Order>("orders")
  ]);

  const taskType = orderRoutingTaskType(order.status);
  const pick = pickAutoAssignStaff({
    taskType,
    staffUsers: users,
    leads,
    orders
  });

  if (!pick) {
    throw createError({ statusCode: 400, statusMessage: "No active staff to assign" });
  }

  const updated: Order = {
    ...order,
    staffId: pick.staffId,
    updatedAt: nowIso()
  };

  await setItem("orders", updated);

  return {
    order: updated,
    assignment: {
      staffId: pick.staffId,
      staffName: pick.fullName,
      reason: pick.reason,
      taskType,
      matchedTaskProfile: pick.matchedTaskProfile,
      openLeads: pick.openLeads,
      activeOrders: pick.activeOrders
    }
  };
});
