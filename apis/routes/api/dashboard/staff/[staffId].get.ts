import { defineEventHandler, getRouterParam } from "h3";

import type { Lead, Order } from "../../../../server/types/domain";
import { buildStaffDashboard } from "../../../../server/utils/dashboard";
import { listCollection } from "../../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const staffId = getRouterParam(event, "staffId") as string;
  const [leads, orders] = await Promise.all([
    listCollection<Lead>("leads"),
    listCollection<Order>("orders")
  ]);

  return buildStaffDashboard({
    leads: leads.filter((lead) => lead.assignedStaffId === staffId),
    orders: orders.filter((order) => order.staffId === staffId)
  });
});
