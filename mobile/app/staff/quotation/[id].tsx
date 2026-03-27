import { Redirect } from 'expo-router';

import { useSession } from '@/components/providers/session-provider';

import AdminQuotationDetailScreen from '../../admin/quotation/[id]';

export default function StaffQuotationDetailScreen() {
  const { isAuthenticated, user } = useSession();

  if (!isAuthenticated || !user || user.role !== 'staff') {
    return <Redirect href="/login" />;
  }

  return <AdminQuotationDetailScreen />;
}
