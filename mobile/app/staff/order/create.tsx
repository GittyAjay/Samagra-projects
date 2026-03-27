import { Redirect } from 'expo-router';

import { useSession } from '@/components/providers/session-provider';

import AdminCreateOrderScreen from '../../admin/order/create';

export default function StaffCreateOrderScreen() {
  const { isAuthenticated, user } = useSession();

  if (!isAuthenticated || !user || user.role !== 'staff') {
    return <Redirect href="/login" />;
  }

  return <AdminCreateOrderScreen />;
}
