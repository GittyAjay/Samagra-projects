import { redirect } from 'next/navigation';

import { AdminOrderCreateClient } from '../../admin-order-create-client';
import { adminApi, type Quotation, getAdminSession } from '../../lib';

export const dynamic = 'force-dynamic';

export default async function AdminNewOrderPage({
  searchParams,
}: {
  searchParams?: Promise<{ quotationId?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin');
  }

  const sp = (await searchParams) ?? {};
  const quotationId = typeof sp.quotationId === 'string' ? sp.quotationId : '';
  if (!quotationId) {
    redirect('/admin?section=orders&error=Missing%20quotation');
  }

  let quotation: Quotation;
  try {
    quotation = await adminApi<Quotation>(`/quotations/${quotationId}`);
  } catch {
    redirect('/admin?section=orders&error=Quotation%20not%20found');
  }

  return (
    <main className="admin-dashboard-page admin-nested-route">
      <AdminOrderCreateClient quotation={quotation} />
    </main>
  );
}
