import { defineEventHandler, getRouterParam } from "h3";

import { buildClientDashboard } from "../../../../server/utils/dashboard";
import { listCollection } from "../../../../server/utils/storage";

import type { Lead, Notification, Order, Product, Quotation } from "../../../../server/types/domain";

export default defineEventHandler(async (event) => {
  const clientId = getRouterParam(event, "clientId") as string;
  const [leads, orders, quotations, notifications, products] = await Promise.all([
    listCollection<Lead>("leads"),
    listCollection<Order>("orders"),
    listCollection<Quotation>("quotations"),
    listCollection<Notification>("notifications"),
    listCollection<Product>("products")
  ]);

  return buildClientDashboard({
    leads: leads.filter((lead) => lead.clientId === clientId),
    orders: orders.filter((order) => order.clientId === clientId),
    quotations: quotations.filter((quotation) => quotation.clientId === clientId),
    notifications: notifications.filter((notification) => notification.userId === clientId),
    recommendedProducts: products.filter((product) => product.active).slice(0, 4)
  });
});
