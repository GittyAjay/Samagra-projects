import { createError, defineEventHandler, getRouterParam } from "h3";

import type { Quotation } from "../../../server/types/domain";
import { getItem } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const quotation = id ? await getItem<Quotation>("quotations", id) : null;

  if (!quotation) {
    throw createError({ statusCode: 404, statusMessage: "Quotation not found" });
  }

  return quotation;
});
