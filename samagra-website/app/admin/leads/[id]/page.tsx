import { notFound, redirect } from 'next/navigation';

import { AdminLeadDetailClient } from '../../admin-lead-detail-client';
import { adminApi, type AdminUser, type Lead, type Quotation, getAdminSession } from '../../lib';

export const dynamic = 'force-dynamic';

export default async function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin');
  }

  let lead: Lead;
  try {
    lead = await adminApi<Lead>(`/leads/${id}`);
  } catch {
    notFound();
  }

  const [quotations, staffUsers, clientUsers] = await Promise.all([
    adminApi<Quotation[]>(`/quotations?leadId=${encodeURIComponent(id)}`).catch(() => [] as Quotation[]),
    adminApi<AdminUser[]>('/users?role=staff'),
    adminApi<AdminUser[]>('/users?role=client'),
  ]);

  const client = clientUsers.find((c) => c.id === lead.clientId);
  const clientLabel = client?.fullName ?? lead.clientId;

  return (
    <main className="admin-dashboard-page admin-nested-route">
      <AdminLeadDetailClient
        lead={lead}
        quotations={quotations}
        staffUsers={staffUsers}
        clientLabel={clientLabel}
      />
    </main>
  );
}
