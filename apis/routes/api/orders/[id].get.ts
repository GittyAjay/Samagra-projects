import { createError, defineEventHandler, getRouterParam } from "h3";

import type { Order } from "../../../server/types/domain";
import { getItem } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const order = id ? await getItem<Order>("orders", id) : null;

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }

  return order;
});
