import { defineEventHandler, readBody } from "h3";

import type { Lead, Notification, Quotation } from "../../../server/types/domain";
import { ensureRole, requireFields } from "../../../server/utils/http";
import { createId, getItem, nowIso, setItem } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["staff", "admin"]);
  const body = await readBody<Partial<Quotation>>(event);
  requireFields(body, ["leadId", "clientId", "staffId", "systemSizeKw", "items"]);

  const subtotal = (body.items ?? []).reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
    0
  );
  const subsidyAmount = Number(body.subsidyAmount ?? 0);
  const timestamp = nowIso();

  const quotation: Quotation = {
    id: createId("quote"),
    leadId: body.leadId as string,
    clientId: body.clientId as string,
    staffId: body.staffId as string,
    systemSizeKw: Number(body.systemSizeKw),
    items: body.items ?? [],
    subsidyScheme: body.subsidyScheme,
    subsidyAmount,
    subtotal,
    finalPrice: Number(body.finalPrice ?? subtotal - subsidyAmount),
    notes: body.notes,
    status: body.status ?? "sent",
    sharedVia: body.sharedVia ?? ["in_app"],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const lead = await getItem<Lead>("leads", quotation.leadId);
  const notification: Notification = {
    id: createId("notif"),
    userId: quotation.clientId,
    title: "Quotation ready",
    message: `Quotation ${quotation.id} is available for review.`,
    type: "action",
    read: false,
    createdAt: timestamp
  };

  await setItem("quotations", quotation);
  await setItem("notifications", notification);

  if (lead) {
    await setItem("leads", {
      ...lead,
      status: "quotation_sent",
      updatedAt: timestamp
    });
  }

  return quotation;
});
