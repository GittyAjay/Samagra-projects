import { defineEventHandler } from "h3";

import type { Lead, Order, UserProfile } from "../../../server/types/domain";
import { parseStaffTaskTypes, workloadForStaff } from "../../../server/utils/auto-assign";
import { ensureRole } from "../../../server/utils/http";
import { listCollection } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["admin"]);

  const [users, leads, orders] = await Promise.all([
    listCollection<UserProfile>("users"),
    listCollection<Lead>("leads"),
    listCollection<Order>("orders")
  ]);

  const staff = users.filter((u) => u.role === "staff" && u.active);

  return {
    staff: staff.map((u) => {
      const w = workloadForStaff(u.id, leads, orders);
      const designation = u.metadata?.designation;
      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        active: u.active,
        designation: typeof designation === "string" ? designation : undefined,
        taskTypes: parseStaffTaskTypes(u.metadata),
        openLeads: w.openLeads,
        activeOrders: w.activeOrders,
        totalLoad: w.total
      };
    })
  };
});
