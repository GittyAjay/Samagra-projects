import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppScreenHeader } from '@/components/ui/app-screen-header';
import { ListSkeleton } from '@/components/ui/page-skeletons';
import { fetchAllOrders } from '@/lib/api';
import { orderJobLabel } from '@/lib/order-display';
import { useSolarTheme } from '@/constants/solar-theme';
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

export default function AdminOrdersScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        setError('');
        setIsLoading(true);
        const response = await fetchAllOrders();

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
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AppScreenHeader title="Orders" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ListSkeleton cards={3} />
        ) : (
          <>
            {error ? (
              <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.ordersWrap}>
              {orders.map((order) => {
                const paidAmount = order.paymentMilestones.reduce(
                  (sum, milestone) => (milestone.status === 'paid' ? sum + milestone.amount : sum),
                  0
                );

                return (
                  <Pressable
                    key={order.id}
                    onPress={() => router.push(`/admin/order/${order.id}`)}
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
                    <Text style={[styles.orderMeta, { color: colors.muted }]}>
                      Client {order.clientId} · Staff {order.staffId}
                    </Text>
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
    paddingBottom: 120,
  },
  errorCard: {
    borderRadius: 16,
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
    borderRadius: 20,
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
    fontWeight: '900',
  },
  orderInternalId: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  orderStatus: {
    fontSize: 13,
    fontWeight: '700',
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
});
