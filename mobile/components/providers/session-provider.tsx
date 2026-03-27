import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { login as loginRequest, registerPushToken } from '@/lib/api';
import { registerForPushNotificationsAsync } from '@/lib/push-notifications';
import type { ApiUser } from '@/types/api';

type SessionContextValue = {
  demoUser: ApiUser;
  effectiveUser: ApiUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<ApiUser>;
  logout: () => void;
  token: string | null;
  user: ApiUser | null;
};

const demoUser: ApiUser = {
  id: 'user_client_1',
  fullName: 'Priya Verma',
  role: 'client',
  email: 'client@solar.local',
  phone: '9777777777',
};

const phoneToEmailMap: Record<string, string> = {
  '9777777777': 'client@solar.local',
  '9888888888': 'sales@solar.local',
  '9999999999': 'admin@solar.local',
};

const SessionContext = createContext<SessionContextValue | null>(null);

function resolveIdentifier(identifier: string) {
  const trimmed = identifier.trim().toLowerCase();

  if (trimmed.includes('@')) {
    return trimmed;
  }

  const digits = identifier.replace(/[^\d]/g, '');

  if (phoneToEmailMap[digits]) {
    return phoneToEmailMap[digits];
  }

  if (digits.length >= 10) {
    return digits.slice(0, 15);
  }

  throw new Error('Use a registered email or phone number.');
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    let isMounted = true;

    async function syncPushToken() {
      const currentUser = user;
      const push = await registerForPushNotificationsAsync();
      if (!push || !isMounted || !currentUser) {
        return;
      }

      try {
        await registerPushToken(currentUser, {
          token: push.token,
          platform: push.platform,
        });
      } catch (error) {
        console.warn('Failed to register push token', error);
      }
    }

    void syncPushToken();

    return () => {
      isMounted = false;
    };
  }, [token, user]);

  const value = useMemo<SessionContextValue>(
    () => ({
      demoUser,
      effectiveUser: user ?? demoUser,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login: async (identifier: string, password: string) => {
        setIsLoading(true);

        try {
          const resolvedIdentifier = resolveIdentifier(identifier);
          const response = await loginRequest({ identifier: resolvedIdentifier, password });
          setUser(response.user);
          setToken(response.token);
          return response.user;
        } finally {
          setIsLoading(false);
        }
      },
      logout: () => {
        setUser(null);
        setToken(null);
      },
      token,
      user,
    }),
    [isLoading, token, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }

  return context;
}
