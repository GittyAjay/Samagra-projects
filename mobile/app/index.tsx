import { Redirect } from 'expo-router';

import { useSession } from '@/components/providers/session-provider';
import { getHomeRouteForUser } from '@/lib/user-routing';

export default function AppEntryScreen() {
  const { isAuthenticated, user } = useSession();

  if (!isAuthenticated || !user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href={getHomeRouteForUser(user)} />;
}
