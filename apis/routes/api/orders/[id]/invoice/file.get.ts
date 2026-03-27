import { createError, defineEventHandler, getRouterParam, setHeader } from "h3";

import type { Order } from "../../../../../server/types/domain";
import { getItem } from "../../../../../server/utils/storage";
import { createSimplePdf } from "../../../../../server/utils/pdf";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const order = id ? await getItem<Order>("orders", id) : null;

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }

  const totalAmount = order.paymentMilestones.reduce((sum, milestone) => sum + milestone.amount, 0);
  const paidAmount = order.paymentMilestones.reduce(
    (sum, milestone) => (milestone.status === "paid" ? sum + milestone.amount : sum),
    0
  );
  const dueAmount = totalAmount - paidAmount;

  setHeader(event, "content-type", "application/pdf");
  setHeader(event, "content-disposition", `attachment; filename="invoice-${order.id}.pdf"`);

  return createSimplePdf({
    title: "Samagra Solar Invoice",
    subtitle: `Invoice invoice_${order.id}`,
    sections: [
      {
        heading: "Overview",
        rows: [
          `Order: ${order.id}`,
          `Quotation: ${order.quotationId}`,
          `Client: ${order.clientId}`,
          `Status: ${order.status}`,
        ],
      },
      {
        heading: "Amounts",
        rows: [
          `Total Amount: INR ${totalAmount}`,
          `Paid Amount: INR ${paidAmount}`,
          `Due Amount: INR ${dueAmount}`,
        ],
      },
      {
        heading: "Payment Milestones",
        rows: order.paymentMilestones.map(
          (milestone) => `${milestone.label}: INR ${milestone.amount} (${milestone.status})`
        ),
      },
    ],
  });
});
