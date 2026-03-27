import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { DashboardSkeleton } from '@/components/ui/page-skeletons';
import { fetchClientDashboard } from '@/lib/api';
import { orderJobLabel } from '@/lib/order-display';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ApiOrder, ClientDashboardResponse, OrderStatus } from '@/types/api';

const profileImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBSeiiXrv1IfygLvUCBBrGt9pYY62PURMpSlaF1Z5f0ZnLXEVLgdmfDAkOqkSLI_6WFpLWw3hP886vQ2jm27a6CrefII6pFY0SDjJFSp_oxgUdAPjo4uDLEQ3W_Za3hh91P2ijBbxP0jVGeY1Gqk9e-uewLShUIEUVqeKM-b3TAo1HtoA4YkzSRfwq74TZ1pwUy2908EZVHWnBubRuioHdZa1iZrRG9Y709_XG-6Br_g41sJ1rsso_R8bj62zuiZ-XZQ_xzdjMa4_rm';

const stageOrder: OrderStatus[] = [
  'survey_completed',
  'quotation_approved',
  'order_received',
  'equipment_procured',
  'installation_scheduled',
  'installation_in_progress',
  'installation_completed',
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatBadgeCount(count: number) {
  if (count > 99) {
    return '99+';
  }
  return String(count);
}

function orderStatusLabel(status: ApiOrder['status']) {
  return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusScore(status: OrderStatus | undefined) {
  if (!status) {
    return 0;
  }

  const index = stageOrder.indexOf(status);
  return index < 0 ? 0 : Math.round(((index + 1) / stageOrder.length) * 100);
}

function stageState(activeStatus: OrderStatus | undefined, step: number) {
  const currentIndex = activeStatus ? stageOrder.indexOf(activeStatus) : -1;

  if (currentIndex >= step) {
    return 'done';
  }

  if (currentIndex === step - 1 || (step === 1 && currentIndex < 1 && currentIndex >= 0)) {
    return 'current';
  }

  return 'pending';
}

export default function DashboardScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const { isAuthenticated, user } = useSession();
  const [dashboard, setDashboard] = useState<ClientDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const isClientUser = isAuthenticated && !!user && user.role === 'client';

  const loadDashboard = useCallback(async () => {
    if (!isClientUser || !user) {
      setDashboard(null);
      setIsLoading(false);
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      const response = await fetchClientDashboard(user.id);
      setDashboard(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [isClientUser, user]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard])
  );

  const featuredOrder = dashboard?.activeOrders[0] ?? null;
  const featuredQuotation = dashboard?.quotations[0] ?? null;
  const featuredProducts = dashboard?.recommendedProducts.slice(0, 3) ?? [];

  const dashboardMetrics = useMemo(() => {
    const totalQuoted = dashboard?.quotations.reduce((sum, quotation) => sum + quotation.finalPrice, 0) ?? 0;
    const totalPaid =
      dashboard?.activeOrders.reduce(
        (sum, order) =>
          sum +
          order.paymentMilestones.reduce(
            (milestoneSum, milestone) => (milestone.status === 'paid' ? milestoneSum + milestone.amount : milestoneSum),
            0
          ),
        0
      ) ?? 0;
    const progress = statusScore(featuredOrder?.status);
    const annualSavings =
      totalQuoted > 0
        ? Math.max(totalQuoted * 0.14, totalPaid * 0.22)
        : featuredQuotation?.finalPrice
          ? featuredQuotation.finalPrice * 0.18
          : 0;

    return {
      totalQuoted,
      totalPaid,
      annualSavings,
      progress,
      totalNotifications: dashboard?.notifications.length ?? 0,
      unreadNotifications: dashboard?.notifications.filter((item) => !item.read).length ?? 0,
    };
  }, [dashboard, featuredOrder?.status, featuredQuotation?.finalPrice]);

  const topName = user?.fullName.split(' ')[0] ?? 'Client';

  if (!isClientUser) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
          },
        ]}>
        <View style={styles.headerBrand}>
          <Text style={[styles.logoText, { color: colors.text }]}>Welcome back, {topName}</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={[styles.iconButton, { backgroundColor: colors.surfaceMuted }]}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            {dashboardMetrics.totalNotifications > 0 ? (
              <View style={[styles.notificationBadge, { backgroundColor: colors.danger }]}>
                <Text style={[styles.notificationBadgeText, { color: colors.onPrimary }]}>
                  {formatBadgeCount(dashboardMetrics.totalNotifications)}
                </Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable
            onPress={() => router.push('/profile')}
            style={[styles.userThumb, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <Image source={{ uri: profileImage }} contentFit="cover" style={styles.userThumbImage} />
          </Pressable>
        </View>
      </View>

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

            <View style={styles.quotationSection}>
              <View
                style={[
                  styles.quoteCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}>
                {featuredQuotation ? (
                  <>
                    <View style={styles.quoteCardTop}>
                      <View>
                        <Text style={[styles.quoteLabel, { color: colors.subtle }]}>Latest quotation</Text>
                        <Text style={[styles.quoteAmount, { color: colors.primary }]}>
                          {formatCurrency(featuredQuotation.finalPrice)}
                        </Text>
                      </View>
                      <View style={[styles.quoteStatusPill, { backgroundColor: colors.primarySoft }]}>
                        <Text style={[styles.quoteStatusText, { color: colors.primary }]}>
                          {featuredQuotation.status.replaceAll('_', ' ')}
                        </Text>
                        <MaterialIcons
                          name={featuredQuotation.status === 'approved' ? 'check-circle' : 'schedule'}
                          size={16}
                          color={colors.primary}
                        />
                      </View>
                    </View>

                    <Text style={[styles.quoteCopy, { color: colors.muted }]}>
                      Your solar quotation is ready to review in the app. Open it now to check pricing and approve it.
                    </Text>

                    <Pressable
                      onPress={() => router.push(`/quotation/${featuredQuotation.id}`)}
                      style={[styles.quoteButton, { borderColor: colors.primary }]}>
                      <Text style={[styles.quoteButtonText, { color: colors.primary }]}>
                        {featuredQuotation.status === 'approved' ? 'View Approved Quotation' : 'Review Quotation'}
                      </Text>
                      <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
                    </Pressable>
                  </>
                ) : (
                  <Text style={[styles.emptyCardCopy, { color: colors.muted, marginTop: 0 }]}>
                    When your sales team sends a quotation, it will appear here for review and approval.
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.heroGrid}>
              <View
                style={[
                  styles.savingsCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}>
                <View style={styles.savingsHeader}>
                  <View>
                    <Text style={[styles.cardEyebrow, { color: colors.subtle }]}>You save</Text>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Estimated Bill Savings</Text>
                  </View>
                  {dashboardMetrics.annualSavings > 0 ? (
                    <View style={[styles.deltaBadge, { backgroundColor: colors.successBg }]}>
                      <MaterialIcons name="trending-up" size={14} color={colors.primary} />
                      <Text style={[styles.deltaBadgeText, { color: colors.successText }]}>Live</Text>
                    </View>
                  ) : null}
                </View>

                {dashboardMetrics.annualSavings > 0 ? (
                  <>
                    <View style={styles.savingsAmountRow}>
                      <Text style={[styles.savingsAmount, { color: colors.successText }]}>
                        {formatCurrency(dashboardMetrics.annualSavings)}
                      </Text>
                      <Text style={[styles.savingsSuffix, { color: colors.subtle }]}>/ year</Text>
                    </View>

                    <Text style={[styles.savingsCopy, { color: colors.muted }]}>
                      Based on your current installation and quoted system performance.
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.emptyCardCopy, { color: colors.muted }]}>
                    Savings will appear here once you receive a quotation or active installation data.
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.orderCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}>
                <View style={styles.orderHeader}>
                  <Text style={[styles.orderHeaderLabel, { color: colors.subtle }]}>Active Order</Text>
                  {featuredOrder ? (
                    <Text style={[styles.orderHeaderId, { color: colors.muted }]}>{orderJobLabel(featuredOrder.id)}</Text>
                  ) : null}
                </View>

                {featuredOrder ? (
                  <>
                    <View style={styles.progressWrap}>
                      {[0, 1, 5].map((step, index) => {
                        const state = stageState(featuredOrder.status, step);
                        const active = state !== 'pending';
                        const current = state === 'current';
                        const label = index === 0 ? 'Consultation' : index === 1 ? 'System Design' : 'Installation';

                        return (
                          <View key={label} style={styles.progressRow}>
                            <View style={styles.progressRail}>
                              <View
                                style={[
                                  styles.progressDot,
                                  {
                                    backgroundColor: active ? colors.primary : colors.surfaceDim,
                                    borderColor: colors.surface,
                                  },
                                ]}>
                                <MaterialIcons
                                  name={index === 0 ? 'check' : index === 1 ? 'bolt' : 'home-repair-service'}
                                  size={13}
                                  color={active ? colors.darkPanelText : colors.subtle}
                                />
                              </View>
                              {index < 2 ? (
                                <View
                                  style={[
                                    styles.progressLine,
                                    {
                                      backgroundColor: active ? colors.primarySoft : colors.border,
                                    },
                                  ]}
                                />
                              ) : null}
                            </View>

                            <View style={styles.progressCopy}>
                              <Text style={[styles.progressTitle, { color: current ? colors.primary : colors.text }]}>
                                {label}
                              </Text>
                              <Text style={[styles.progressMeta, { color: colors.subtle }]}>
                                {index === 0
                                  ? 'Completed'
                                  : index === 1
                                    ? `${Math.max(20, dashboardMetrics.progress)}% in progress`
                                    : orderStatusLabel(featuredOrder.status)}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    <Pressable
                      onPress={() => router.push(`/order/${featuredOrder.id}`)}
                      style={[
                        styles.trackButton,
                        { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
                      ]}>
                      <Text style={[styles.trackButtonText, { color: colors.primary }]}>Track Details</Text>
                    </Pressable>
                  </>
                ) : (
                  <Text style={[styles.emptyCardCopy, { color: colors.muted }]}>
                    No active order yet. Your order progress will appear here once a project starts.
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.recommendSection}>
              <View style={styles.recommendHeader}>
                <View>
                  <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Curated Shop</Text>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended for You</Text>
                </View>
              </View>

              <View style={styles.productGrid}>
                {featuredProducts.map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => router.push(`/products/${product.id}`)}
                    style={[
                      styles.productCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}>
                    <View style={styles.productImageWrap}>
                      <Image
                        source={{ uri: product.imageUrls[0] || 'https://placehold.co/600x400' }}
                        contentFit="cover"
                        style={styles.productImage}
                      />
                    </View>

                    <View style={styles.productBody}>
                      <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <Text style={[styles.productPrice, { color: colors.primary }]}>
                        {formatCurrency(product.estimatedPrice)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/chat')}
        style={[styles.fab, { backgroundColor: colors.primary }]}>
        <Ionicons name="chatbubble-ellipses" size={24} color={colors.onPrimary} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 18,
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  userThumb: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  userThumbImage: {
    width: 34,
    height: 34,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 128,
  },
  errorCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroGrid: {
    marginTop: 24,
    gap: 24,
  },
  savingsCard: {
    minHeight: 188,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  deltaBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deltaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  savingsAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 22,
  },
  savingsAmount: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },
  savingsSuffix: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  savingsCopy: {
    marginTop: 10,
    maxWidth: 280,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCardCopy: {
    marginTop: 28,
    maxWidth: 280,
    fontSize: 14,
    lineHeight: 21,
  },
  orderCard: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 22,
    gap: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  orderHeaderId: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressWrap: {
    gap: 14,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 12,
  },
  progressRail: {
    width: 24,
    alignItems: 'center',
  },
  progressDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLine: {
    width: StyleSheet.hairlineWidth * 2,
    flex: 1,
    marginTop: 4,
  },
  progressCopy: {
    flex: 1,
    paddingTop: 2,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  progressMeta: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
  },
  trackButton: {
    height: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  trackButtonText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  recommendSection: {
    marginTop: 36,
  },
  recommendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 18,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  productCard: {
    width: '48%',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  productImageWrap: {
    height: 132,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productBody: {
    padding: 14,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    minHeight: 40,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  quotationSection: {
    marginTop: 0,
  },
  quoteCard: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  quoteCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  quoteLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  quoteAmount: {
    marginTop: 8,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -1,
  },
  quoteStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quoteStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  quoteCopy: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 360,
  },
  quoteButton: {
    marginTop: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  quoteButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 104,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
});
