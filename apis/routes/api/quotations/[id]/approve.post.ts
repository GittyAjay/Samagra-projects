import { createError, defineEventHandler, getRouterParam } from "h3";

import type { Lead, Quotation } from "../../../../server/types/domain";
import { ensureRole } from "../../../../server/utils/http";
import { notifyUser } from "../../../../server/utils/notifications";
import { getItem, nowIso, setItem } from "../../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["client", "admin"]);
  const id = getRouterParam(event, "id");
  const quotation = id ? await getItem<Quotation>("quotations", id) : null;

  if (!quotation) {
    throw createError({ statusCode: 404, statusMessage: "Quotation not found" });
  }

  const updatedQuotation: Quotation = {
    ...quotation,
    status: "approved",
    updatedAt: nowIso()
  };
  const lead = await getItem<Lead>("leads", quotation.leadId);
  await setItem("quotations", updatedQuotation);
  await notifyUser({
    userId: quotation.staffId,
    title: "Quotation approved",
    message: `Client approved quotation ${quotation.id}.`,
    type: "action",
    emailSubject: "Quotation approved by client"
  });

  if (lead) {
    await setItem("leads", {
      ...lead,
      status: "won",
      updatedAt: nowIso()
    });
  }

  return updatedQuotation;
});
