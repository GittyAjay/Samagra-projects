import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { ListSkeleton } from '@/components/ui/page-skeletons';
import { fetchOrders } from '@/lib/api';
import { orderJobLabel } from '@/lib/order-display';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ApiOrder } from '@/types/api';

const orderHeroImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC9N0495cr0mJjX034WIK-R1bWQLvk0MwkHdkC3XMvNbN89VqzCl4ZghCVY_HXppPPMqCYr1u2bmOjCV2GoVGuBAutoC6n84TtNHL5oGUfji4sBhkp606LrwJRntMbQo8ft7IJqUzG7_o4M0CzOXtstXx2yStnCOUZ8ZKT0_SK_MUpcHxfAGiPXx3-fkJXgpiFq9XDZPwr3HpAqw2eVtGObq-Le-dfxqWshHoPrTm-Tgzu0M92qln6E6EKCWQVcK4BGGbVJcViKptak',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAn-eru6M0WHRIOlsCbFVLmq8-j_AZWku1_h9KLlDK_RILgNdvSD6twcbwrfG9V4FiFfYOq83wg0f7hAenpGitlhIJDdD-_-ac6Qd9fi8SS6OlJzAkPSAtG_zH0UN3eZrSDaTfstw2GL-KZUTqoyNHKSQOrSsGTqRioyjWU892emrmPmgU7ccuxJQgXLp5V5d4WOSJDkWU0eBuiLv6hKL5S4qMbC6sws1-PDjoaMYhYnxqG1srT4A8NifVE6xtIWwNJn66hoOCuQDFG',
];

function progressFromStatus(status: ApiOrder['status']) {
  switch (status) {
    case 'survey_completed':
      return 14;
    case 'quotation_approved':
      return 28;
    case 'order_received':
      return 42;
    case 'equipment_procured':
      return 57;
    case 'installation_scheduled':
      return 71;
    case 'installation_in_progress':
      return 86;
    case 'installation_completed':
      return 100;
    default:
      return 0;
  }
}

function stageLabel(status: ApiOrder['status']) {
  switch (status) {
    case 'survey_completed':
      return 'Site Survey Done';
    case 'quotation_approved':
      return 'Quotation Approved';
    case 'order_received':
      return 'Order Booked';
    case 'equipment_procured':
      return 'Equipment Procurement';
    case 'installation_scheduled':
      return 'Technician On Way';
    case 'installation_in_progress':
      return 'Installation in Progress';
    case 'installation_completed':
      return 'Delivered';
    default:
      return 'In progress';
  }
}

function nextStepLabel(status: ApiOrder['status']) {
  switch (status) {
    case 'survey_completed':
      return 'Next: Confirm quotation';
    case 'quotation_approved':
      return 'Next: Open work order';
    case 'order_received':
      return 'Next: Equipment procurement';
    case 'equipment_procured':
      return 'Next: Technician dispatch';
    case 'installation_scheduled':
      return 'Next: Installation start';
    case 'installation_in_progress':
      return 'Next: Final inspection';
    case 'installation_completed':
      return 'Completed';
    default:
      return 'Next update pending';
  }
}

function badgeTone(status: ApiOrder['status'], colors: ReturnType<typeof useSolarTheme>) {
  if (status === 'installation_in_progress' || status === 'installation_scheduled') {
    return {
      bg: colors.primarySoft,
      text: colors.primaryStrong,
      label: status === 'installation_scheduled' ? 'Technician On Way' : 'In Progress',
    };
  }

  if (
    status === 'survey_completed' ||
    status === 'quotation_approved' ||
    status === 'order_received' ||
    status === 'equipment_procured'
  ) {
    return {
      bg: colors.warningSoft,
      text: colors.warning,
      label: 'In Progress',
    };
  }

  return {
    bg: colors.mutedBadgeSoft,
    text: colors.mutedBadge,
    label: status === 'installation_completed' ? 'Completed' : 'Queued',
  };
}

function formatDeliveredDate(order: ApiOrder) {
  const completedStatus = order.statusHistory.find((entry) => entry.status === 'installation_completed');
  const value = completedStatus?.updatedAt ?? order.updatedAt;
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OrdersScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const { effectiveUser } = useSession();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        setError('');
        setIsLoading(true);
        const response = await fetchOrders({ clientId: effectiveUser.id });

        if (isMounted) {
          setOrders(response);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load orders');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [effectiveUser.id]);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== 'installation_completed'),
    [orders]
  );
  const pastOrders = useMemo(
    () => orders.filter((order) => order.status === 'installation_completed'),
    [orders]
  );

  const visibleOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.push('/(tabs)')} style={styles.headerIconButton}>
            <MaterialIcons name="arrow-back" size={22} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Client Orders</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerIconButton}>
            <MaterialIcons name="search" size={22} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => router.push('/notifications')} style={styles.headerIconButton}>
            <MaterialIcons name="notifications-none" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.tabsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => setActiveTab('active')}
          style={[styles.tabButton, activeTab === 'active' && { borderBottomColor: colors.primary }]}>
          <Text style={[styles.tabText, { color: activeTab === 'active' ? colors.primary : colors.subtle }]}>
            Active Orders
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('past')}
          style={[styles.tabButton, activeTab === 'past' && { borderBottomColor: colors.primary }]}>
          <Text style={[styles.tabText, { color: activeTab === 'past' ? colors.primary : colors.subtle }]}>
            Past Orders
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ListSkeleton cards={3} />
        ) : (
          <>
            {error ? (
              <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
              </View>
            ) : null}

            {activeTab === 'active' ? (
              <View style={styles.cardsWrap}>
                {visibleOrders.map((order, index) => {
                  const progress = progressFromStatus(order.status);
                  const tone = badgeTone(order.status, colors);

                  return (
                    <View
                      key={order.id}
                      style={[
                        styles.orderCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}>
                      <View style={styles.orderImageWrap}>
                        <Image source={{ uri: orderHeroImages[index % orderHeroImages.length] }} contentFit="cover" style={styles.orderImage} />
                      </View>

                      <View style={styles.orderBody}>
                        <View style={styles.orderBodyTop}>
                          <View style={styles.orderCopy}>
                            <View style={[styles.statusBadge, { backgroundColor: tone.bg }]}>
                              <Text style={[styles.statusBadgeText, { color: tone.text }]}>{tone.label}</Text>
                            </View>
                            <Text style={[styles.orderName, { color: colors.text }]}>
                              {order.status === 'installation_in_progress' || order.status === 'installation_scheduled'
                                ? 'Battery Storage Expansion'
                                : 'Residential 5kW Setup'}
                            </Text>
                            <Text style={[styles.orderJobRef, { color: colors.muted }]}>{orderJobLabel(order.id)}</Text>
                          </View>

                          <View style={[styles.topAction, { backgroundColor: colors.surfaceMuted }]}>
                            <MaterialIcons
                              name={
                                order.status === 'installation_in_progress' || order.status === 'installation_scheduled'
                                  ? 'bolt'
                                  : 'description'
                              }
                              size={18}
                              color={colors.subtle}
                            />
                          </View>
                        </View>

                        <View style={styles.progressSection}>
                          <View style={styles.progressHeader}>
                            <Text style={[styles.progressLabel, { color: colors.text }]}>{stageLabel(order.status)}</Text>
                            <Text style={[styles.progressValue, { color: colors.primary }]}>{progress}%</Text>
                          </View>
                          <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  backgroundColor: colors.primary,
                                  width: `${progress}%`,
                                },
                              ]}
                            />
                          </View>
                          <Text style={[styles.nextStep, { color: colors.subtle }]}>{nextStepLabel(order.status)}</Text>
                        </View>

                        <Pressable
                          onPress={() => router.push(`/order/${order.id}`)}
                          style={[styles.detailsButton, { backgroundColor: colors.primary }]}>
                          <Text style={[styles.detailsButtonText, { color: colors.onPrimary }]}>View details</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.completedSection}>
              <View style={styles.completedHeader}>
                <Text style={[styles.completedTitle, { color: colors.text }]}>Recent Completed</Text>
                <Pressable onPress={() => setActiveTab('past')}>
                  <Text style={[styles.completedLink, { color: colors.primary }]}>See All</Text>
                </Pressable>
              </View>

              <View style={styles.completedList}>
                {(activeTab === 'past' ? visibleOrders : pastOrders).map((order) => (
                  <Pressable
                    key={order.id}
                    onPress={() => router.push(`/order/${order.id}`)}
                    style={[
                      styles.completedCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}>
                    <View style={[styles.completedIcon, { backgroundColor: colors.surfaceMuted }]}>
                      <MaterialIcons name="verified" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.completedCopy}>
                      <Text style={[styles.completedItemTitle, { color: colors.text }]}>Off-grid Cabin Kit</Text>
                      <Text style={[styles.completedItemMeta, { color: colors.subtle }]}>
                        Delivered {formatDeliveredDate(order)}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={colors.subtle} />
                  </Pressable>
                ))}
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 18,
  },
  errorCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardsWrap: {
    gap: 16,
  },
  orderCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  orderImageWrap: {
    height: 160,
  },
  orderImage: {
    width: '100%',
    height: '100%',
  },
  orderBody: {
    padding: 16,
    gap: 14,
  },
  orderBodyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderCopy: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  orderName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  orderJobRef: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  topAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 999,
  },
  nextStep: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  detailsButton: {
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  completedSection: {
    gap: 12,
    paddingTop: 8,
  },
  completedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  completedLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  completedList: {
    gap: 10,
  },
  completedCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completedIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCopy: {
    flex: 1,
  },
  completedItemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  completedItemMeta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
});
