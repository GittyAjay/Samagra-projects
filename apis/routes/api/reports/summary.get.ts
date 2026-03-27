import { defineEventHandler } from "h3";

import type { Lead, Order, UserProfile } from "../../../server/types/domain";
import { ensureRole } from "../../../server/utils/http";
import { listCollection } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["admin"]);
  const [users, leads, orders] = await Promise.all([
    listCollection<UserProfile>("users"),
    listCollection<Lead>("leads"),
    listCollection<Order>("orders")
  ]);

  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum +
      order.paymentMilestones.reduce(
        (innerSum, milestone) =>
          milestone.status === "paid" ? innerSum + milestone.amount : innerSum,
        0
      ),
    0
  );

  return {
    totals: {
      clients: users.filter((user) => user.role === "client").length,
      staff: users.filter((user) => user.role === "staff").length,
      leads: leads.length,
      orders: orders.length,
      revenue: totalRevenue
    },
    leadPipeline: {
      new: leads.filter((lead) => lead.status === "new").length,
      surveyScheduled: leads.filter((lead) => lead.status === "survey_scheduled").length,
      quotationSent: leads.filter((lead) => lead.status === "quotation_sent").length,
      won: leads.filter((lead) => lead.status === "won").length,
      lost: leads.filter((lead) => lead.status === "lost").length
    },
    installationStats: {
      active: orders.filter((order) => order.status !== "installation_completed").length,
      completed: orders.filter((order) => order.status === "installation_completed").length
    },
    collectionReport: orders.map((order) => ({
      orderId: order.id,
      paid: order.paymentMilestones
        .filter((milestone) => milestone.status === "paid")
        .reduce((sum, milestone) => sum + milestone.amount, 0),
      pending: order.paymentMilestones
        .filter((milestone) => milestone.status === "pending")
        .reduce((sum, milestone) => sum + milestone.amount, 0)
    }))
  };
});
