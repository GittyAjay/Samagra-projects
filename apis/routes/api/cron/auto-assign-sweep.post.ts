import { createError, defineEventHandler, getHeader } from "h3";

import { sweepUnassignedLeads } from "../../../server/utils/lead-auto-assign.service";

/**
 * Scheduled job entrypoint (Vercel Cron, GitHub Actions, etc.).
 * Set CRON_SECRET and call with header: Authorization: Bearer <CRON_SECRET>
 * or x-cron-secret: <CRON_SECRET>
 */
export default defineEventHandler(async (event) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw createError({
      statusCode: 503,
      statusMessage: "CRON_SECRET is not configured on the server"
    });
  }

  const auth = getHeader(event, "authorization");
  const headerSecret = getHeader(event, "x-cron-secret");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  const token = bearer ?? headerSecret;

  if (token !== secret) {
    throw createError({ statusCode: 401, statusMessage: "Invalid cron credentials" });
  }

  const result = await sweepUnassignedLeads();

  return {
    ok: true,
    at: new Date().toISOString(),
    unassignedLeadsScanned: result.scanned,
    leadsAssigned: result.assigned
  };
});
