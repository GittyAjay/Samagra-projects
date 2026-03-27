import { notFound, redirect } from 'next/navigation';

import { AdminQuotationDetailClient } from '../../admin-quotation-detail-client';
import { adminApi, type Quotation, getAdminSession } from '../../lib';

export const dynamic = 'force-dynamic';

export default async function AdminQuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin');
  }

  let quotation: Quotation;
  try {
    quotation = await adminApi<Quotation>(`/quotations/${id}`);
  } catch {
    notFound();
  }

  return (
    <main className="admin-dashboard-page admin-nested-route">
      <AdminQuotationDetailClient quotation={quotation} />
    </main>
  );
}
