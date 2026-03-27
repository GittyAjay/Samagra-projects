import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { AppScreenHeader } from '@/components/ui/app-screen-header';
import { DashboardSkeleton } from '@/components/ui/page-skeletons';
import { fetchAdminDashboard } from '@/lib/api';
import { useSolarTheme } from '@/constants/solar-theme';
import type { AdminDashboardResponse, OrderStatus } from '@/types/api';

function formatStatus(status: OrderStatus) {
  return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function activityTitle(status: OrderStatus) {
  switch (status) {
    case 'survey_completed':
      return 'Site Survey Completed';
    case 'quotation_approved':
      return 'Quotation Approved';
    case 'order_received':
      return 'Order Booked';
    case 'equipment_procured':
      return 'Equipment Procured';
    case 'installation_scheduled':
      return 'Installation Scheduled';
    case 'installation_in_progress':
      return 'Installation In Progress';
    case 'installation_completed':
      return 'Installation Completed';
    default:
      return 'Order Update';
  }
}

function activityTone(status: OrderStatus, colors: ReturnType<typeof useSolarTheme>) {
  if (status === 'survey_completed' || status === 'installation_completed') {
    return {
      dot: colors.successText,
      ring: colors.successBg,
      pillBg: colors.successBg,
      pillText: colors.successText,
    };
  }

  if (status === 'quotation_approved' || status === 'installation_scheduled') {
    return {
      dot: colors.warning,
      ring: colors.warningSoft,
      pillBg: colors.warningSoft,
      pillText: colors.warning,
    };
  }

  return {
    dot: colors.subtle,
    ring: colors.primarySoft,
    pillBg: colors.surfaceMuted,
    pillText: colors.text,
  };
}

function relativeStamp(timestamp: string) {
  const input = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - input.getTime();
  const diffHours = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `${diffHours || 1}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function AdminOverviewScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const { user } = useSession();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!user) {
        return;
      }

      try {
        setError('');
        setIsLoading(true);
        const response = await fetchAdminDashboard(user);

        if (isMounted) {
          setData(response);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load admin dashboard');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const metrics = useMemo(() => {
    const totals = data?.totals;
    const leads = totals?.leads ?? 0;
    const orders = totals?.orders ?? 0;
    const installs = data?.activeInstallations ?? 0;
    const callbacks = Math.max(0, (data?.activityFeed.length ?? 0) - installs);
    const conversion = data?.conversionRate ?? 0;

    return {
      leads,
      callbacks,
      installs,
      orders,
      conversion,
    };
  }, [data]);

  const summaryCards = useMemo(
    () => [
      {
        key: 'leads',
        label: 'New Leads',
        value: String(metrics.leads),
        delta: '+12%',
        deltaColor: colors.successText,
        icon: 'person-add-alt-1' as const,
        iconColor: colors.primary,
        iconBg: colors.primarySoft,
      },
      {
        key: 'callbacks',
        label: 'Callbacks',
        value: String(metrics.callbacks),
        delta: '-2%',
        deltaColor: colors.danger,
        icon: 'call' as const,
        iconColor: colors.warning,
        iconBg: colors.warningSoft,
      },
      {
        key: 'surveys',
        label: 'Site Surveys',
        value: String(metrics.installs),
        delta: '+5%',
        deltaColor: colors.successText,
        icon: 'home-work' as const,
        iconColor: colors.info,
        iconBg: colors.infoSoft,
      },
      {
        key: 'progress',
        label: 'In Progress',
        value: String(metrics.orders),
        delta: '+8%',
        deltaColor: colors.successText,
        icon: 'pending-actions' as const,
        iconColor: colors.primaryStrong,
        iconBg: colors.primarySoft,
      },
    ],
    [
      colors.danger,
      colors.info,
      colors.infoSoft,
      colors.primary,
      colors.primarySoft,
      colors.primaryStrong,
      colors.successText,
      colors.warning,
      colors.warningSoft,
      metrics.callbacks,
      metrics.installs,
      metrics.leads,
      metrics.orders,
    ]
  );

  const recentActivity = data?.activityFeed.slice(0, 4) ?? [];
  const firstName = user?.fullName.split(' ')[0] ?? 'Admin';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AppScreenHeader
        title={`Welcome back, ${firstName}`}
        borderless
        actions={[
          {
            icon: 'notifications-outline',
            label: 'Notifications',
            onPress: () => router.push('/notifications'),
          },
          {
            icon: 'settings-outline',
            label: 'Admin hub',
            onPress: () => router.push('/admin/hub'),
          },
        ]}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {error ? (
              <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.statsGrid}>
              {summaryCards.map((card) => (
                <View
                  key={card.key}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}>
                  <View style={styles.statHead}>
                    <View style={[styles.statIconWrap, { backgroundColor: card.iconBg }]}>
                      <MaterialIcons name={card.icon} size={18} color={card.iconColor} />
                    </View>
                    <View style={[styles.statDeltaPill, { backgroundColor: colors.surfaceMuted }]}>
                      <Text style={[styles.statDelta, { color: card.deltaColor }]}>{card.delta}</Text>
                    </View>
                  </View>
                  <Text style={[styles.statLabel, { color: colors.subtle }]}>{card.label}</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{card.value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.quickActionRow}>
                <Pressable
                  onPress={() => router.push('/admin/hub')}
                  style={[
                    styles.quickActionCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}>
                  <View style={[styles.quickActionIcon, { backgroundColor: colors.primarySoft }]}>
                    <MaterialIcons name="add" size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.quickActionTitle, { color: colors.text }]}>New Lead</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/admin/orders')}
                  style={[
                    styles.quickActionCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}>
                  <View style={[styles.quickActionIcon, { backgroundColor: colors.warningSoft }]}>
                    <MaterialIcons name="event" size={18} color={colors.warning} />
                  </View>
                  <Text style={[styles.quickActionTitle, { color: colors.text }]}>Schedule</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
                <Pressable onPress={() => router.push('/admin/orders')}>
                  <Text style={[styles.sectionLink, { color: colors.primary }]}>View All</Text>
                </Pressable>
              </View>

              <View style={styles.timelineWrap}>
                {recentActivity.map((item, index) => {
                  const tone = activityTone(item.status, colors);
                  const isLast = index === recentActivity.length - 1;

                  return (
                    <View key={`${item.orderId}-${item.updatedAt}`} style={styles.timelineRow}>
                      <View style={styles.timelineRail}>
                        <View style={[styles.timelineDot, { backgroundColor: tone.dot, shadowColor: tone.ring }]} />
                        {!isLast ? <View style={[styles.timelineLine, { backgroundColor: colors.border }]} /> : null}
                      </View>

                      <View style={styles.timelineContent}>
                        <Text style={[styles.timelineTitle, { color: colors.text }]}>{activityTitle(item.status)}</Text>
                        <Text style={[styles.timelineSubtitle, { color: colors.muted }]}>
                          {item.orderId.replaceAll('_', ' ')} · {formatStatus(item.status)}
                        </Text>

                        <View style={styles.timelineMetaRow}>
                          <View style={[styles.statusPill, { backgroundColor: tone.pillBg }]}>
                            <Text style={[styles.statusPillText, { color: tone.pillText }]}>{formatStatus(item.status)}</Text>
                          </View>
                          <Text style={[styles.timelineTime, { color: colors.subtle }]}>{relativeStamp(item.updatedAt)}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {!isLoading && !error ? (
        <View
          style={[
            styles.floatingBadge,
            { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.primary },
          ]}>
          <MaterialIcons name="trending-up" size={16} color={colors.primary} />
          <Text style={[styles.floatingBadgeText, { color: colors.primaryStrong }]}>{metrics.conversion}% Target Met</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 132,
    gap: 24,
  },
  errorCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  statCard: {
    width: '47%',
    minWidth: 150,
    flexGrow: 1,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  statHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDeltaPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statDelta: {
    fontSize: 11,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statValue: {
    marginTop: 6,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  sectionBlock: {
    gap: 14,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minHeight: 108,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineWrap: {
    gap: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 14,
  },
  timelineRail: {
    width: 18,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 12,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  timelineSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
  },
  timelineMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  timelineTime: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  floatingBadge: {
    position: 'absolute',
    right: 20,
    bottom: 96,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  floatingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
