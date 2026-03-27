import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { useToast } from '@/components/providers/toast-provider';
import { ListSkeleton } from '@/components/ui/page-skeletons';
import { fetchNotifications } from '@/lib/api';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ApiNotification } from '@/types/api';

function helpCategories(colors: ReturnType<typeof useSolarTheme>) {
  return [
    {
      key: 'technical',
      title: 'Technical Help',
      icon: 'settings-suggest' as const,
      bg: colors.infoSoft,
      color: colors.info,
    },
    {
      key: 'billing',
      title: 'Billing & Payments',
      icon: 'receipt-long' as const,
      bg: colors.primarySoft,
      color: colors.primaryStrong,
    },
    {
      key: 'install',
      title: 'Installation Support',
      icon: 'home-repair-service' as const,
      bg: colors.successBg,
      color: colors.successText,
    },
  ] as const;
}

function ticketStatus(notification: ApiNotification, colors: ReturnType<typeof useSolarTheme>) {
  if (notification.read) {
    return {
      label: 'Resolved',
      bg: colors.successBg,
      color: colors.successText,
      footer: `Closed on ${new Date(notification.createdAt).toLocaleDateString('en-IN')}`,
      action: 'Reopen',
    };
  }

  return {
    label: 'In Progress',
    bg: colors.warningSoft,
    color: colors.warning,
    footer: 'Last updated: 2h ago',
    action: 'Details',
  };
}

export default function SupportScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const { effectiveUser } = useSession();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
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

  const filteredTickets = useMemo(() => {
    const lowered = query.trim().toLowerCase();

    return notifications.filter((notification) => {
      if (!lowered) {
        return true;
      }

      return (
        notification.title.toLowerCase().includes(lowered) ||
        notification.message.toLowerCase().includes(lowered)
      );
    });
  }, [notifications, query]);

  const helpItems = useMemo(() => helpCategories(colors), [colors]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: `${colors.background}F2`,
            borderBottomColor: colors.border,
          },
        ]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.push('/(tabs)')} style={[styles.headerButton, { backgroundColor: colors.surfaceMuted }]}>
            <MaterialIcons name="arrow-back" size={22} color={colors.subtle} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Support Center</Text>
        </View>
        <Pressable onPress={() => router.push('/notifications')} style={[styles.headerButton, { backgroundColor: colors.surfaceMuted }]}>
          <MaterialIcons name="notifications" size={22} color={colors.subtle} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ListSkeleton cards={4} showBanner />
        ) : (
          <>
            <View style={styles.searchWrap}>
              <MaterialIcons name="search" size={20} color={colors.subtle} style={styles.searchIcon} />
              <TextInput
                placeholder="Search for help, articles..."
                placeholderTextColor={colors.subtle}
                value={query}
                onChangeText={setQuery}
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Contact</Text>
              <View style={styles.quickGrid}>
                <Pressable
                  style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() =>
                    showToast({
                      type: 'success',
                      title: 'Support callback requested',
                      message: `We will call ${effectiveUser.phone} shortly.`,
                    })
                  }>
                  <View style={[styles.quickIconWrap, { backgroundColor: colors.primarySoft }]}>
                    <MaterialIcons name="call" size={22} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.quickTitle, { color: colors.text }]}>Call Support</Text>
                    <Text style={[styles.quickMeta, { color: colors.subtle }]}>Available 24/7</Text>
                  </View>
                </Pressable>

                <Pressable
                  style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => router.push('/chat')}>
                  <View style={[styles.quickIconWrap, { backgroundColor: colors.primarySoft }]}>
                    <MaterialIcons name="chat-bubble" size={22} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.quickTitle, { color: colors.text }]}>Chat with Us</Text>
                    <Text style={[styles.quickMeta, { color: colors.subtle }]}>Instant response</Text>
                  </View>
                </Pressable>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>How can we help?</Text>
              <View style={styles.categoryList}>
                {helpItems.map((item) => (
                  <Pressable
                    key={item.key}
                    style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() =>
                      showToast({
                        type: 'success',
                        title: item.title,
                        message: 'A specialist can help you with this topic.',
                      })
                    }>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryIconWrap, { backgroundColor: item.bg }]}>
                        <MaterialIcons name={item.icon} size={22} color={item.color} />
                      </View>
                      <Text style={[styles.categoryTitle, { color: colors.text }]}>{item.title}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={22} color={colors.subtle} />
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Tickets</Text>
                <Pressable onPress={() => router.push('/notifications')}>
                  <Text style={[styles.sectionLink, { color: colors.primary }]}>View All</Text>
                </Pressable>
              </View>

              {error ? (
                <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.ticketList}>
                {filteredTickets.map((ticket) => {
                  const status = ticketStatus(ticket, colors);

                  return (
                    <View
                      key={ticket.id}
                      style={[styles.ticketCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={styles.ticketTop}>
                        <View style={styles.ticketCopy}>
                          <Text style={[styles.ticketTitle, { color: colors.text }]}>{ticket.title}</Text>
                          <Text style={[styles.ticketId, { color: colors.subtle }]}>Ticket #{ticket.id.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.ticketBadge, { backgroundColor: status.bg }]}>
                          <Text style={[styles.ticketBadgeText, { color: status.color }]}>{status.label}</Text>
                        </View>
                      </View>

                      <View style={[styles.ticketFooter, { borderTopColor: colors.border }]}>
                        <Text style={[styles.ticketMeta, { color: colors.subtle }]}>{status.footer}</Text>
                        <Pressable
                          onPress={() =>
                            showToast({
                              type: 'success',
                              title: status.action,
                              message: `${status.action} opened for ${ticket.title}.`,
                            })
                          }>
                          <Text style={[styles.ticketAction, { color: colors.primary }]}>{status.action}</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
  },
  searchWrap: {
    position: 'relative',
    marginBottom: 24,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    marginBottom: 14,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  quickIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  quickMeta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
  categoryList: {
    gap: 10,
  },
  categoryCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  categoryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  errorCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ticketList: {
    gap: 12,
  },
  ticketCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  ticketCopy: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  ticketId: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ticketBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  ticketBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ticketFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  ticketAction: {
    fontSize: 12,
    fontWeight: '600',
  },
});
