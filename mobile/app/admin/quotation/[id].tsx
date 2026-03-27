import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { useToast } from '@/components/providers/toast-provider';
import { approveQuotation, fetchClientDirectory, fetchLead, fetchOrders, fetchQuotation, fetchQuotationDownload } from '@/lib/api';
import { solarPalette, useSolarTheme } from '@/constants/solar-theme';
import type { ApiLead, ApiOrder, ApiQuotation, QuotationLineItem } from '@/types/api';

const clientPortrait =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBhQiC2dg1XxpzpvHU3VsvwO-PyxOk2YsrjzJNGUj74YmBZ6g99XxRmc6VIZOVJLVOGH6caJP9amPn1h6oXLK3fX-EKfrV82CIl7FdEzPVnEBn45X31U81ASaq6RLHn3Kc5ISp8AihRb3a-HQdECXM9V1JyLWe9NJZY_eubk9YemoAuGAVzobBGAqPLury_j1ZyaOZ7ZKQBqxdkCgMxmxoskZvMFfoqxg2-As1LSLBQFdchAIH71XRRf7eTwKShJeuTw4cZjqrrsFGI';

function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDisplayDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function quoteNumberFromId(id: string, createdAt: string) {
  const year = new Date(createdAt).getFullYear();
  const digits = id.replace(/\D/g, '');
  const seq = (digits.slice(-3) || '001').padStart(3, '0');
  return `INV-${year}-${seq}`;
}

function leadDisplayRef(leadId: string) {
  const tail = leadId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  return `#QT-${tail}`;
}

function validUntilDate(createdAt: string) {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}

function lineTotal(item: QuotationLineItem) {
  return Number(item.quantity) * Number(item.unitPrice);
}

export default function AdminQuotationDetailScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bottomBarOffset = user?.role === 'client' ? 0 : 78;

  const [quotation, setQuotation] = useState<ApiQuotation | null>(null);
  const [lead, setLead] = useState<ApiLead | null>(null);
  const [existingOrder, setExistingOrder] = useState<ApiOrder | null>(null);
  const [clientName, setClientName] = useState('');
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const load = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      setLoadError('Missing quotation');
      setIsLoading(false);
      return;
    }
    if (!user) {
      return;
    }
    try {
      setLoadError('');
      setIsLoading(true);
      const q = await fetchQuotation(id);
      setQuotation(q);
      const l = await fetchLead(q.leadId);
      setLead(l);
      const relatedOrders = await fetchOrders({ quotationId: q.id }).catch(() => [] as ApiOrder[]);
      setExistingOrder(relatedOrders[0] ?? null);
      const clients = await fetchClientDirectory(user).catch(() => []);
      setClientName(clients.find((c) => c.id === q.clientId)?.fullName ?? '');
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load');
      setQuotation(null);
      setLead(null);
      setExistingOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const isApproved = quotation?.status === 'approved';
  const isRejected = quotation?.status === 'rejected';
  const isClientViewer = user?.role === 'client';
  const orderCreatePath = user?.role === 'staff' ? '/staff/order/create' : '/admin/order/create';
  const orderDetailPath = user?.role === 'staff' ? '/staff/order/[id]' : '/admin/order/[id]';

  const summaryRows = useMemo(() => {
    if (!quotation) {
      return [];
    }
    const items = quotation.items ?? [];
    const rows: { key: string; label: string; amount: number }[] = [];
    for (const item of items) {
      rows.push({
        key: item.id,
        label: item.label,
        amount: lineTotal(item),
      });
    }
    if (rows.length === 0) {
      rows.push({
        key: 'subtotal',
        label: 'System quotation',
        amount: quotation.subtotal,
      });
    }
    if (quotation.subsidyAmount > 0) {
      rows.push({
        key: 'subsidy',
        label: quotation.subsidyScheme ?? 'Government subsidy',
        amount: -quotation.subsidyAmount,
      });
    }
    return rows;
  }, [quotation]);

  const openMore = () => {
    if (!quotation) {
      return;
    }
    Alert.alert('Quotation', quotation.id, [
      { text: 'Refresh', onPress: () => void load() },
      { text: 'Close', style: 'cancel' },
    ]);
  };

  const handleApprove = async () => {
    if (!user || !quotation || isApproved) {
      return;
    }

    try {
      setIsApproving(true);
      const updated = await approveQuotation(user, quotation.id);
      setQuotation(updated);
      setLead((current) =>
        current
          ? {
              ...current,
              status: 'won',
            }
          : current
      );
      showToast({
        type: 'success',
        title: 'Quotation approved',
        message: 'Our team has been notified and the order can now be processed.',
      });
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Approval failed',
        message: e instanceof Error ? e.message : 'Please try again.',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownloadQuotation = async () => {
    if (!quotation) {
      return;
    }

    try {
      const file = await fetchQuotationDownload(quotation.id);
      const supported = await Linking.canOpenURL(file.downloadUrl);

      if (!supported) {
        throw new Error('Download is not available on this device.');
      }

      await Linking.openURL(file.downloadUrl);
      showToast({
        type: 'success',
        title: 'Download started',
        message: file.fileName,
      });
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Download failed',
        message: e instanceof Error ? e.message : 'Unable to open quotation download.',
      });
    }
  };

  const displayName = clientName.trim() || (lead ? `Client ${lead.clientId.slice(-6)}` : 'Client');
  const projectSubtitle = lead
    ? `${lead.requiredLoadKw}kW solar · ${lead.roofType}`
    : 'Solar installation project';

  const clientMessage =
    quotation?.notes?.trim() ||
    '"Everything looks great. We\'d like to proceed as soon as possible. Please let us know the next steps for the down payment."';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View
        style={[
          styles.frame,
          {
            backgroundColor: colors.background,
            borderLeftColor: colors.border,
            borderRightColor: colors.border,
          },
        ]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.headerIcon} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Quotation Details</Text>
          <View style={styles.headerRight}>
            <Pressable onPress={openMore} style={styles.headerIcon} hitSlop={10} disabled={!quotation}>
              <MaterialIcons name="more-vert" size={24} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : loadError ? (
          <View style={styles.centered}>
            <Text style={[styles.err, { color: colors.danger }]}>{loadError}</Text>
            <Pressable onPress={() => void load()} style={[styles.retry, { backgroundColor: colors.primary }]}>
              <Text style={styles.retryTxt}>Retry</Text>
            </Pressable>
          </View>
        ) : quotation && lead ? (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.scroll,
                { paddingBottom: bottomBarOffset + insets.bottom + 100 },
              ]}>
              <View style={styles.bannerPad}>
                {isApproved ? (
                  <View
                    style={[
                      styles.statusBanner,
                      { backgroundColor: colors.primarySoft, borderColor: colors.border },
                    ]}>
                    <MaterialIcons name="check-circle" size={28} color={colors.primary} />
                    <View style={styles.bannerText}>
                      <Text style={[styles.bannerTitle, { color: colors.primary }]}>Quotation Accepted</Text>
                      <Text style={[styles.bannerSub, { color: colors.muted }]}>
                        Accepted by client on {formatDisplayDate(quotation.updatedAt)}
                      </Text>
                    </View>
                  </View>
                ) : isRejected ? (
                  <View
                    style={[
                      styles.statusBanner,
                      { backgroundColor: colors.dangerSoft, borderColor: 'rgba(220, 38, 38, 0.22)' },
                    ]}>
                    <MaterialIcons name="cancel" size={28} color={colors.danger} />
                    <View style={styles.bannerText}>
                      <Text style={[styles.bannerTitle, { color: colors.danger }]}>Quotation Declined</Text>
                      <Text style={[styles.bannerSub, { color: colors.muted }]}>The client did not accept this quote.</Text>
                    </View>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.statusBanner,
                      { backgroundColor: colors.warningSoft, borderColor: 'rgba(245, 158, 11, 0.25)' },
                    ]}>
                    <MaterialIcons name="schedule" size={28} color={colors.warning} />
                    <View style={styles.bannerText}>
                      <Text style={[styles.bannerTitle, { color: colors.warning }]}>Awaiting client</Text>
                      <Text style={[styles.bannerSub, { color: colors.muted }]}>
                        Sent on {formatDisplayDate(quotation.createdAt)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.profileBlock}>
                <View style={styles.profileRow}>
                  <View style={[styles.avatarRing, { borderColor: colors.border }]}>
                    <Image source={{ uri: clientPortrait }} style={styles.avatar} contentFit="cover" />
                  </View>
                  <View style={styles.profileCopy}>
                    <Text style={[styles.clientName, { color: colors.text }]}>{displayName}</Text>
                    <Text style={[styles.projectLine, { color: colors.primary }]}>{projectSubtitle}</Text>
                    <Text style={[styles.leadRef, { color: colors.subtle }]}>Lead ID: {leadDisplayRef(lead.id)}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardEyebrow, { color: colors.text }]}>Quote Summary</Text>
                  <Pressable
                    onPress={() => void handleDownloadQuotation()}
                    style={[styles.downloadPill, { backgroundColor: colors.primarySoft }]}>
                    <MaterialIcons name="download" size={16} color={colors.primary} />
                    <Text style={[styles.downloadPillText, { color: colors.primary }]}>Download</Text>
                  </Pressable>
                </View>
                <View style={[styles.quoteMetaRow, { borderBottomColor: colors.border }]}>
                  <View>
                    <Text style={[styles.metaLabel, { color: colors.subtle }]}>Quote Number</Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {quoteNumberFromId(quotation.id, quotation.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.metaRight}>
                    <Text style={[styles.metaLabel, { color: colors.subtle }]}>Valid Until</Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {formatDisplayDate(validUntilDate(quotation.createdAt))}
                    </Text>
                  </View>
                </View>
                <View style={styles.lineItems}>
                  {summaryRows.map((row) => (
                    <View key={row.key} style={styles.lineRow}>
                      <Text style={[styles.lineLabel, { color: colors.muted }]} numberOfLines={2}>
                        {row.label}
                      </Text>
                      <Text
                        style={[
                          styles.lineAmount,
                          { color: row.amount < 0 ? colors.successText : colors.text },
                        ]}>
                        {row.amount < 0 ? '− ' : ''}
                        {formatInr(Math.abs(row.amount))}
                      </Text>
                    </View>
                  ))}
                  <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
                    <Text style={[styles.totalValue, { color: colors.primary }]}>{formatInr(quotation.finalPrice)}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardEyebrow, { color: colors.text }]}>Client Message</Text>
                <Text style={[styles.clientMsg, { color: colors.muted }]}>{clientMessage}</Text>
              </View>
            </ScrollView>

            {isApproved && !isClientViewer ? (
              <View
                style={[
                  styles.footer,
                  {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    bottom: bottomBarOffset,
                    paddingBottom: Math.max(12, insets.bottom),
                  },
                ]}>
                <Pressable
                  onPress={() => {
                    if (existingOrder) {
                      router.push({
                        pathname: orderDetailPath,
                        params: { id: existingOrder.id },
                      });
                      return;
                    }

                    router.push({
                      pathname: orderCreatePath,
                      params: { quotationId: quotation.id },
                    });
                  }}
                  style={({ pressed }) => [
                    styles.orderBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed ? 0.92 : 1,
                      shadowColor: colors.primary,
                    },
                  ]}>
                  <MaterialIcons name="add-shopping-cart" size={22} color={colors.onPrimary} />
                  <Text style={[styles.orderBtnText, { color: colors.onPrimary }]}>
                    {existingOrder ? 'View Order' : 'Create Order'}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {!isApproved && !isRejected && isClientViewer ? (
              <View
                style={[
                  styles.footer,
                  {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    bottom: bottomBarOffset,
                    paddingBottom: Math.max(12, insets.bottom),
                  },
                ]}>
                <Pressable
                  onPress={() => void handleApprove()}
                  disabled={isApproving}
                  style={({ pressed }) => [
                    styles.orderBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed || isApproving ? 0.92 : 1,
                      shadowColor: colors.primary,
                    },
                  ]}>
                  <MaterialIcons name="check-circle" size={22} color={colors.onPrimary} />
                  <Text style={[styles.orderBtnText, { color: colors.onPrimary }]}>
                    {isApproving ? 'Approving...' : 'Approve Quotation'}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  frame: {
    flex: 1,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  err: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  retry: { paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12 },
  retryTxt: { color: '#fff', fontWeight: '800' },
  scroll: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  bannerPad: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  bannerSub: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  profileBlock: {
    paddingVertical: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  clientName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  projectLine: {
    fontSize: 14,
    fontWeight: '600',
  },
  leadRef: {
    fontSize: 12,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  cardEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  downloadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  downloadPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  quoteMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  lineItems: {
    gap: 12,
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  lineLabel: {
    flex: 1,
    fontSize: 14,
  },
  lineAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  clientMsg: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    maxWidth: 448,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  orderBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: solarPalette.light.primary,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  orderBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
