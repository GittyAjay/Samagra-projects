import { defineEventHandler, getQuery } from "h3";

import type { Quotation } from "../../../server/types/domain";
import { listCollection } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const quotations = await listCollection<Quotation>("quotations");

  return quotations.filter((quotation) => {
    const matchesClient = query.clientId ? quotation.clientId === String(query.clientId) : true;
    const matchesStaff = query.staffId ? quotation.staffId === String(query.staffId) : true;
    const matchesLead = query.leadId ? quotation.leadId === String(query.leadId) : true;
    return matchesClient && matchesStaff && matchesLead;
  });
});
