import { notFound, redirect } from 'next/navigation';

import { AdminOrderDetailClient } from '../../admin-order-detail-client';
import { adminApi, type AdminUser, type Order, getAdminSession } from '../../lib';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin');
  }

  let order: Order;
  try {
    order = await adminApi<Order>(`/orders/${id}`);
  } catch {
    notFound();
  }

  const staffUsers = await adminApi<AdminUser[]>('/users?role=staff');

  return (
    <main className="admin-dashboard-page admin-nested-route">
      <AdminOrderDetailClient order={order} staffUsers={staffUsers} />
    </main>
  );
}
