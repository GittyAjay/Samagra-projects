import { Redirect } from 'expo-router';

import { useSession } from '@/components/providers/session-provider';

import CreateQuotationScreen from '../../admin/quotation/create';

export default function StaffCreateQuotationScreen() {
  const { isAuthenticated, user } = useSession();

  if (!isAuthenticated || !user || user.role !== 'staff') {
    return <Redirect href="/login" />;
  }

  return <CreateQuotationScreen />;
}
