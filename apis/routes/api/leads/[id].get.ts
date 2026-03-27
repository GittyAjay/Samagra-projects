import { createError, defineEventHandler, getRouterParam } from "h3";

import type { Lead } from "../../../server/types/domain";
import { getItem } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const lead = id ? await getItem<Lead>("leads", id) : null;

  if (!lead) {
    throw createError({ statusCode: 404, statusMessage: "Lead not found" });
  }

  return lead;
});
