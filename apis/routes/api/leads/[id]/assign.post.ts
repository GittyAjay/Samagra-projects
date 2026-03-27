import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

import type { Lead } from "../../../../server/types/domain";
import { ensureRole, requireFields } from "../../../../server/utils/http";
import { notifyUser } from "../../../../server/utils/notifications";
import { getItem, nowIso, setItem } from "../../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["admin"]);
  const id = getRouterParam(event, "id");
  const body = await readBody<{ assignedStaffId?: string }>(event);
  requireFields(body, ["assignedStaffId"]);

  const lead = id ? await getItem<Lead>("leads", id) : null;
  if (!lead) {
    throw createError({ statusCode: 404, statusMessage: "Lead not found" });
  }

  const updatedLead: Lead = {
    ...lead,
    assignedStaffId: body.assignedStaffId,
    status: "contacted",
    updatedAt: nowIso()
  };

  await setItem("leads", updatedLead);
  await notifyUser({
    userId: body.assignedStaffId as string,
    title: "New lead assigned",
    message: `Lead ${lead.id} has been assigned to you.`,
    type: "action",
    emailSubject: "New lead assigned in Samagra"
  });

  return updatedLead;
});
