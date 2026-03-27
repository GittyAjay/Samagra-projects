import { defineEventHandler, getQuery } from "h3";

import type { Order } from "../../../server/types/domain";
import { listCollection } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const orders = await listCollection<Order>("orders");

  return orders.filter((order) => {
    const matchesClient = query.clientId ? order.clientId === String(query.clientId) : true;
    const matchesStaff = query.staffId ? order.staffId === String(query.staffId) : true;
    const matchesStatus = query.status ? order.status === String(query.status) : true;
    const matchesQuotation = query.quotationId ? order.quotationId === String(query.quotationId) : true;
    return matchesClient && matchesStaff && matchesStatus && matchesQuotation;
  });
});
