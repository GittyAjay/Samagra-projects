import { Redirect } from 'expo-router';

import { useSession } from '@/components/providers/session-provider';

import AdminQuotationDetailScreen from '../admin/quotation/[id]';

export default function ClientQuotationDetailScreen() {
  const { isAuthenticated, user } = useSession();

  if (!isAuthenticated || !user || user.role !== 'client') {
    return <Redirect href="/login" />;
  }

  return <AdminQuotationDetailScreen />;
}
