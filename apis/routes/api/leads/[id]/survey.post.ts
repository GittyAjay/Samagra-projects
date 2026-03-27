import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

import type { Lead, Notification } from "../../../../server/types/domain";
import { ensureRole, requireFields } from "../../../../server/utils/http";
import { createId, getItem, nowIso, setItem } from "../../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["staff", "admin"]);
  const id = getRouterParam(event, "id");
  const body = await readBody<{ scheduledAt?: string; assignedTo?: string; notes?: string }>(event);
  requireFields(body, ["scheduledAt", "assignedTo"]);

  const lead = id ? await getItem<Lead>("leads", id) : null;
  if (!lead) {
    throw createError({ statusCode: 404, statusMessage: "Lead not found" });
  }

  const updatedLead: Lead = {
    ...lead,
    assignedStaffId: body.assignedTo,
    status: "survey_scheduled",
    surveySchedule: {
      scheduledAt: body.scheduledAt as string,
      assignedTo: body.assignedTo as string,
      notes: body.notes
    },
    updatedAt: nowIso()
  };

  const notification: Notification = {
    id: createId("notif"),
    userId: lead.clientId,
    title: "Site survey scheduled",
    message: `Your survey is scheduled for ${body.scheduledAt}.`,
    type: "info",
    read: false,
    createdAt: nowIso()
  };

  await Promise.all([setItem("leads", updatedLead), setItem("notifications", notification)]);

  return updatedLead;
});
