import { createError, defineEventHandler, getRouterParam } from "h3";

import type { Lead } from "../../../../server/types/domain";
import { executeLeadAutoAssign } from "../../../../server/utils/lead-auto-assign.service";
import { ensureRole } from "../../../../server/utils/http";
import { getItem } from "../../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  ensureRole(event, ["admin"]);
  const id = getRouterParam(event, "id");

  const lead = id ? await getItem<Lead>("leads", id) : null;
  if (!lead) {
    throw createError({ statusCode: 404, statusMessage: "Lead not found" });
  }

  const result = await executeLeadAutoAssign(lead, { force: true });

  if (!result.ok) {
    if (result.reason === "no_staff") {
      throw createError({ statusCode: 400, statusMessage: "No active staff to assign" });
    }
    throw createError({ statusCode: 400, statusMessage: `Cannot auto-assign: ${result.reason}` });
  }

  return {
    lead: result.lead,
    assignment: result.assignment
  };
});
