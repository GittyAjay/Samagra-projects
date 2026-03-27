import { createError, defineEventHandler, readBody } from "h3";

import type { Order, Quotation } from "../../../server/types/domain";
import { ensureRole, requireFields } from "../../../server/utils/http";
import { notifyUser } from "../../../server/utils/notifications";
import { createId, getItem, listCollection, nowIso, setItem } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["staff", "admin"]);
  const body = await readBody<Partial<Order>>(event);
  requireFields(body, ["leadId", "quotationId", "clientId", "staffId"]);

  const quotation = await getItem<Quotation>("quotations", body.quotationId as string);
  if (!quotation) {
    throw createError({ statusCode: 400, statusMessage: "Valid quotationId is required" });
  }
  if (quotation.status !== "approved") {
    throw createError({
      statusCode: 400,
      statusMessage: "Quotation must be approved by the client before creating an order"
    });
  }

  const existingOrders = await listCollection<Order>("orders");
  const existingForQuotation = existingOrders.find((order) => order.quotationId === String(body.quotationId));
  if (existingForQuotation) {
    throw createError({
      statusCode: 409,
      statusMessage: `Order already exists for this quotation: ${existingForQuotation.id}`
    });
  }

  const timestamp = nowIso();
  const order: Order = {
    id: createId("order"),
    leadId: body.leadId as string,
    quotationId: body.quotationId as string,
    clientId: body.clientId as string,
    staffId: body.staffId as string,
    installationTeam: body.installationTeam,
    sourcingNotes: body.sourcingNotes,
    status: "order_received",
    statusHistory: [{ status: "order_received", updatedAt: timestamp, note: "Order created" }],
    installationDate: body.installationDate,
    paymentMilestones:
      body.paymentMilestones ?? [
        {
          id: createId("payment"),
          label: "Final Payment",
          amount: quotation.finalPrice,
          status: "pending"
        }
      ],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await setItem("orders", order);
  await notifyUser({
    userId: order.clientId,
    title: "Order created",
    message: `Your order ${order.id} has been created and is now being processed.`,
    type: "info",
    emailSubject: "Your Samagra order has been created"
  });

  return order;
});
