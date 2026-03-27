import { defineEventHandler } from "h3";

import type { Lead, Order, UserProfile } from "../../../server/types/domain";
import { buildAdminDashboard } from "../../../server/utils/dashboard";
import { ensureRole } from "../../../server/utils/http";
import { listCollection } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["admin"]);
  const [users, leads, orders] = await Promise.all([
    listCollection<UserProfile>("users"),
    listCollection<Lead>("leads"),
    listCollection<Order>("orders")
  ]);

  return buildAdminDashboard({
    clients: users.filter((user) => user.role === "client").length,
    leads,
    orders
  });
});
