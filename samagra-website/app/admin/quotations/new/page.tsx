import { redirect } from 'next/navigation';

import { AdminQuotationCreateClient } from '../../admin-quotation-create-client';
import { adminApi, type AdminUser, type Lead, type Product, getAdminSession } from '../../lib';

export const dynamic = 'force-dynamic';

export default async function AdminNewQuotationPage({
  searchParams,
}: {
  searchParams?: Promise<{ leadId?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin');
  }

  const sp = (await searchParams) ?? {};
  const leadId = typeof sp.leadId === 'string' ? sp.leadId : '';
  if (!leadId) {
    redirect('/admin?section=leads&error=Select%20a%20lead%20to%20quote');
  }

  let lead: Lead;
  try {
    lead = await adminApi<Lead>(`/leads/${leadId}`);
  } catch {
    redirect('/admin?section=leads&error=Lead%20not%20found');
  }

  const [staffUsers, panels, inverters] = await Promise.all([
    adminApi<AdminUser[]>('/users?role=staff'),
    adminApi<Product[]>('/products?category=solar_panel').catch(() => [] as Product[]),
    adminApi<Product[]>('/products?category=solar_inverter').catch(() => [] as Product[]),
  ]);

  const defaultStaffId = lead.assignedStaffId ?? '';

  return (
    <main className="admin-dashboard-page admin-nested-route">
      <AdminQuotationCreateClient
        lead={lead}
        panels={panels}
        inverters={inverters}
        staffUsers={staffUsers}
        defaultStaffId={defaultStaffId}
      />
    </main>
  );
}
