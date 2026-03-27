import { defineEventHandler, getQuery } from "h3";

import type { Lead } from "../../../server/types/domain";
import { listCollection } from "../../../server/utils/storage";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const leads = await listCollection<Lead>("leads");

  return leads.filter((lead) => {
    const matchesStatus = query.status ? lead.status === String(query.status) : true;
    const matchesStaff = query.staffId ? lead.assignedStaffId === String(query.staffId) : true;
    const matchesClient = query.clientId ? lead.clientId === String(query.clientId) : true;
    return matchesStatus && matchesStaff && matchesClient;
  });
});
