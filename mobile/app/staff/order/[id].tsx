import { Redirect } from 'expo-router';

import { useSession } from '@/components/providers/session-provider';

import AdminOrderDetailScreen from '../../admin/order/[id]';

export default function StaffOrderDetailScreen() {
  const { isAuthenticated, user } = useSession();

  if (!isAuthenticated || !user || user.role !== 'staff') {
    return <Redirect href="/login" />;
  }

  return <AdminOrderDetailScreen />;
}
