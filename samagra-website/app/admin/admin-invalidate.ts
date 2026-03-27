import { revalidateTag } from 'next/cache';

export const ADMIN_DASHBOARD_TAG = 'admin-dashboard-data';

/** Call after mutations so cached `/admin` payload refetches on next visit. */
export function invalidateAdminDashboardCache() {
  revalidateTag(ADMIN_DASHBOARD_TAG);
}
