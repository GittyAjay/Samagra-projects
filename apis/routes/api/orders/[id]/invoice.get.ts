import { createError, defineEventHandler, getRequestURL, getRouterParam } from "h3";

import type { Order } from "../../../../server/types/domain";
import { getItem } from "../../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const order = id ? await getItem<Order>("orders", id) : null;

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }

  const paidAmount = order.paymentMilestones.reduce(
    (sum, milestone) => (milestone.status === "paid" ? sum + milestone.amount : sum),
    0
  );

  const url = getRequestURL(event);
  const origin = `${url.protocol}//${url.host}`;

  return {
    invoiceId: `invoice_${order.id}`,
    orderId: order.id,
    clientId: order.clientId,
    quotationId: order.quotationId,
    totalAmount: order.paymentMilestones.reduce((sum, milestone) => sum + milestone.amount, 0),
    paidAmount,
    dueAmount:
      order.paymentMilestones.reduce((sum, milestone) => sum + milestone.amount, 0) - paidAmount,
    downloadUrl: `${origin}/api/orders/${order.id}/invoice/file`
  };
});
