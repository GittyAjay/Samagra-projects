import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { AppScreenHeader } from '@/components/ui/app-screen-header';
import { ListSkeleton } from '@/components/ui/page-skeletons';
import { useSolarTheme } from '@/constants/solar-theme';
import { fetchOrders } from '@/lib/api';
import { orderJobLabel } from '@/lib/order-display';
import type { ApiOrder } from '@/types/api';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatStatus(status: ApiOrder['status']) {
  return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function StaffOrdersScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const { user } = useSession();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      if (!user) {
        return;
      }

      try {
        setError('');
        setIsLoading(true);
        const response = await fetchOrders({ staffId: user.id });

        if (isMounted) {
          setOrders(response);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load assigned orders');
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
  }, [user]);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== 'installation_completed'),
    [orders]
  );
  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === 'installation_completed'),
    [orders]
  );
  const visibleOrders = activeTab === 'active' ? activeOrders : completedOrders;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AppScreenHeader title="Orders" borderless />

      <View style={styles.content}>
        <View style={[styles.tabsWrap, { backgroundColor: colors.surfaceMuted }]}>
          <Pressable
            onPress={() => setActiveTab('active')}
            style={[
              styles.tabButton,
              activeTab === 'active'
                ? { backgroundColor: colors.surface, borderColor: colors.border }
                : null,
            ]}>
            <Text style={[styles.tabText, { color: activeTab === 'active' ? colors.text : colors.subtle }]}>
              Active
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('completed')}
            style={[
              styles.tabButton,
              activeTab === 'completed'
                ? { backgroundColor: colors.surface, borderColor: colors.border }
                : null,
            ]}>
            <Text style={[styles.tabText, { color: activeTab === 'completed' ? colors.text : colors.subtle }]}>
              Completed
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
                  <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.ordersWrap}>
                {visibleOrders.map((order) => {
                  const paidAmount = order.paymentMilestones.reduce(
                    (sum, milestone) => (milestone.status === 'paid' ? sum + milestone.amount : sum),
                    0
                  );

                  return (
                    <Pressable
                      key={order.id}
                      onPress={() => router.push(`/staff/order/${order.id}`)}
                      style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={styles.orderTop}>
                        <View style={styles.orderTopLeft}>
                          <Text style={[styles.orderPrimary, { color: colors.primary }]}>{orderJobLabel(order.id)}</Text>
                          <Text
                            style={[styles.orderInternalId, { color: colors.subtle }]}
                            numberOfLines={1}
                            ellipsizeMode="middle">
                            {order.id}
                          </Text>
                        </View>
                        <Text style={[styles.orderStatus, { color: colors.text }]}>{formatStatus(order.status)}</Text>
                      </View>
                      <Text style={[styles.orderMeta, { color: colors.muted }]}>Client {order.clientId}</Text>
                      <Text style={[styles.orderMeta, { color: colors.muted }]}>
                        Paid {formatCurrency(paidAmount)} ·{' '}
                        {order.installationDate
                          ? new Date(order.installationDate).toLocaleDateString('en-IN')
                          : 'Install TBD'}
                      </Text>
                      <View style={styles.chevron}>
                        <MaterialIcons name="chevron-right" size={22} color={colors.subtle} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {!error && !visibleOrders.length ? (
                <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    {activeTab === 'active' ? 'No active orders' : 'No completed orders'}
                  </Text>
                  <Text style={[styles.emptyCopy, { color: colors.muted }]}>
                    {activeTab === 'active'
                      ? 'Assigned installation and survey work will appear here.'
                      : 'Completed work will show here once the pipeline is closed.'}
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  tabsWrap: {
    borderRadius: 18,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  errorCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ordersWrap: {
    gap: 12,
  },
  orderCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
    paddingRight: 28,
  },
  orderTopLeft: {
    flex: 1,
    minWidth: 0,
  },
  orderPrimary: {
    fontSize: 15,
    fontWeight: '700',
  },
  orderInternalId: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  orderStatus: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  orderMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  chevron: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -11,
  },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginTop: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyCopy: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
  },
});
