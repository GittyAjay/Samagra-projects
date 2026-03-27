import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { AppScreenHeader } from '@/components/ui/app-screen-header';
import { ListSkeleton } from '@/components/ui/page-skeletons';
import { fetchNotifications } from '@/lib/api';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ApiNotification } from '@/types/api';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function iconName(type: ApiNotification['type']) {
  switch (type) {
    case 'action':
      return 'campaign';
    case 'system':
      return 'settings';
    default:
      return 'notifications';
  }
}

export default function NotificationsScreen() {
  const colors = useSolarTheme();
  const { effectiveUser } = useSession();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        setError('');
        setIsLoading(true);
        const response = await fetchNotifications(effectiveUser.id);

        if (isMounted) {
          setNotifications(response);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load notifications');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [effectiveUser.id]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AppScreenHeader showBack title="Notifications" subtitle="Inbox" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ListSkeleton cards={4} />
        ) : (
          <>
            {error ? (
              <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.list}>
              {notifications.map((notification) => (
                <View
                  key={notification.id}
                  style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
                    <MaterialIcons name={iconName(notification.type)} size={20} color={colors.primary} />
                  </View>
                  <View style={styles.cardCopy}>
                    <View style={styles.cardTop}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>{notification.title}</Text>
                      <Text style={[styles.cardDate, { color: colors.subtle }]}>
                        {formatDateTime(notification.createdAt)}
                      </Text>
                    </View>
                    <Text style={[styles.cardMessage, { color: colors.muted }]}>{notification.message}</Text>
                    <View style={styles.metaRow}>
                      <Text
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor: notification.read ? colors.neutralBg : colors.successBg,
                            color: notification.read ? colors.neutralText : colors.successText,
                          },
                        ]}>
                        {notification.read ? 'Read' : 'New'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  errorCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    gap: 14,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: {
    flex: 1,
  },
  cardTop: {
    gap: 4,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardMessage: {
    fontSize: 14,
    lineHeight: 21,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '600',
    overflow: 'hidden',
  },
});
