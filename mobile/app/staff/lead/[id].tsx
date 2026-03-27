import { Redirect } from 'expo-router';

import { useSession } from '@/components/providers/session-provider';

import AdminLeadDetailScreen from '../../admin/lead/[id]';

export default function StaffLeadDetailScreen() {
  const { isAuthenticated, user } = useSession();

  if (!isAuthenticated || !user || user.role !== 'staff') {
    return <Redirect href="/login" />;
  }

  return <AdminLeadDetailScreen />;
}
