import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

import type { Lead, LeadTaskType } from "../../../server/types/domain";
import { ensureRole } from "../../../server/utils/http";
import { getItem, nowIso, setItem } from "../../../server/utils/storage";

const LEAD_TASK_TYPES: LeadTaskType[] = ["sales", "survey", "installation", "general"];

export default defineEventHandler(async (event) => {
  ensureRole(event, ["staff", "admin"]);
  const id = getRouterParam(event, "id");
  const body = await readBody<Partial<Lead>>(event);
  const existing = id ? await getItem<Lead>("leads", id) : null;

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Lead not found" });
  }

  if (body.taskType !== undefined && !LEAD_TASK_TYPES.includes(body.taskType)) {
    throw createError({
      statusCode: 400,
      statusMessage: `taskType must be one of: ${LEAD_TASK_TYPES.join(", ")}`
    });
  }

  const updated: Lead = {
    ...existing,
    ...body,
    id: existing.id,
    internalNotes: body.internalNotes ?? existing.internalNotes,
    updatedAt: nowIso()
  };

  await setItem("leads", updated);
  return updated;
});
