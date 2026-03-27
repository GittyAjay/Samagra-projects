import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/providers/toast-provider';
import { DetailSkeleton } from '@/components/ui/page-skeletons';
import { fetchOrder, fetchOrderInvoice, fetchQuotation, fetchQuotationDownload } from '@/lib/api';
import { formatInstallDateForDisplay } from '@/lib/order-date';
import { orderJobLabel } from '@/lib/order-display';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ApiOrder, ApiQuotation, OrderInvoiceResponse } from '@/types/api';

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

function equipmentStatus(order: ApiOrder) {
  if (order.status === 'installation_completed' || order.status === 'installation_in_progress') {
    return 'Installed';
  }

  if (order.status === 'installation_scheduled' || order.status === 'equipment_procured') {
    return 'Ready';
  }

  return 'Pending';
}

function lineItemIcon(label: string) {
  const value = label.toLowerCase();

  if (value.includes('panel')) {
    return 'wb-sunny' as const;
  }

  if (value.includes('inverter')) {
    return 'electrical-services' as const;
  }

  if (value.includes('battery')) {
    return 'battery-charging-full' as const;
  }

  return 'inventory-2' as const;
}

function equipmentRows(order: ApiOrder, quotation: ApiQuotation | null) {
  const status = equipmentStatus(order);
  const items = quotation?.items ?? [];

  return items.map((item) => ({
    id: item.id,
    icon: lineItemIcon(item.label),
    title: item.label,
    detail: `${item.quantity} x ${formatCurrency(item.unitPrice)}`,
    status,
  }));
}

function statusTone(status: ApiOrder['status'], colors: ReturnType<typeof useSolarTheme>) {
  if (status === 'installation_completed') {
    return colors.primary;
  }

  if (status === 'installation_in_progress' || status === 'installation_scheduled') {
    return colors.warning;
  }

  return colors.subtle;
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const colors = useSolarTheme();
  const { showToast } = useToast();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [quotation, setQuotation] = useState<ApiQuotation | null>(null);
  const [invoice, setInvoice] = useState<OrderInvoiceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      if (!id) {
        return;
      }

      try {
        setError('');
        setIsLoading(true);
        const response = await fetchOrder(id);
        const [quotationResponse, invoiceResponse] = await Promise.all([
          fetchQuotation(response.quotationId).catch(() => null),
          fetchOrderInvoice(response.id).catch(() => null),
        ]);

        if (isMounted) {
          setOrder(response);
          setQuotation(quotationResponse);
          setInvoice(invoiceResponse);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load order');
          setQuotation(null);
          setInvoice(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const progress = order ? progressFromStatus(order.status) : 0;
  const totalContractValue = useMemo(
    () => (order ? order.paymentMilestones.reduce((sum, milestone) => sum + milestone.amount, 0) : 0),
    [order]
  );
  const amountPaid = useMemo(
    () =>
      order
        ? order.paymentMilestones.reduce(
            (sum, milestone) => (milestone.status === 'paid' ? sum + milestone.amount : sum),
            0
          )
        : 0,
    [order]
  );
  const balanceDue = totalContractValue - amountPaid;
  const nextPendingMilestone = order?.paymentMilestones.find((milestone) => milestone.status === 'pending');
  const equipment = order ? equipmentRows(order, quotation) : [];
  const statusColor = order ? statusTone(order.status, colors) : colors.subtle;

  async function openDownload(url: string, label: string) {
    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        throw new Error('Download is not available on this device.');
      }

      await Linking.openURL(url);
      showToast({
        type: 'success',
        title: 'Download started',
        message: label,
      });
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Download failed',
        message: e instanceof Error ? e.message : 'Unable to open download.',
      });
    }
  }

  if (!id) {
    return <Redirect href="/orders" />;
  }

  if (!isLoading && !order && error) {
    return <Redirect href="/orders" />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}>
        <View style={styles.topBarLeft}>
          <Pressable onPress={() => router.back()} style={styles.topBarButton}>
            <MaterialIcons name="arrow-back" size={22} color={colors.primary} />
          </Pressable>
          <Text style={[styles.topBarTitle, { color: colors.text }]}>Order</Text>
        </View>
        <Pressable style={styles.topBarButton}>
          <MaterialIcons name="share" size={20} color={colors.subtle} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <DetailSkeleton />
        ) : order ? (
          <>
            {error ? (
              <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
              </View>
            ) : null}

            <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.heroHead}>
                <View style={styles.heroLeft}>
                  <View style={[styles.heroIconWrap, { backgroundColor: colors.primarySoft }]}>
                    <MaterialIcons name="solar-power" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.heroTitleBlock}>
                    <Text style={[styles.heroEyebrow, { color: colors.subtle }]}>{orderJobLabel(order.id)}</Text>
                    <View style={styles.heroStatusRow}>
                      <View style={[styles.heroStatusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.heroStatusText, { color: colors.text }]}>{formatStatus(order.status)}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.progressSection, { borderTopColor: colors.border }]}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.subtle }]}>Installation progress</Text>
                  <Text style={[styles.progressValue, { color: colors.muted }]}>{progress}%</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
                  <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
                </View>
                <Text style={[styles.progressMeta, { color: colors.subtle }]}>
                  Est. completion {formatInstallDateForDisplay(order.installationDate, 'TBD')}
                </Text>
              </View>

              <Pressable
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push(`/order/${order.id}/track`)}>
                <MaterialIcons name="map" size={16} color={colors.onPrimary} />
                <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>Track installation</Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Equipment</Text>
                <View style={[styles.sectionBadge, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={[styles.sectionBadgeText, { color: colors.muted }]}>{equipment.length} items</Text>
                </View>
              </View>

              {equipment.length ? (
                <View style={styles.cardList}>
                  {equipment.map((item) => (
                    <View
                      key={item.id}
                      style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={[styles.rowIconWrap, { backgroundColor: colors.surfaceMuted }]}>
                        <MaterialIcons name={item.icon} size={20} color={colors.subtle} />
                      </View>
                      <View style={styles.rowCopy}>
                        <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
                        <Text style={[styles.rowDetail, { color: colors.subtle }]}>{item.detail}</Text>
                      </View>
                      <Text
                        style={[
                          styles.rowStatus,
                          { color: item.status === 'Installed' ? colors.successText : colors.warning },
                        ]}>
                        {item.status}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.financeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.financeLabel, { color: colors.muted }]}>
                    No quotation line items are linked to this order yet.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Payments</Text>
              <View style={[styles.financeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.financeRows}>
                  <View style={styles.financeRow}>
                    <Text style={[styles.financeLabel, { color: colors.muted }]}>Total Contract Value</Text>
                    <Text style={[styles.financeValue, { color: colors.text }]}>{formatCurrency(totalContractValue)}</Text>
                  </View>
                  <View style={styles.financeRow}>
                    <Text style={[styles.financeLabel, { color: colors.muted }]}>Amount Paid</Text>
                    <Text style={[styles.financePaid, { color: colors.primary }]}>-{formatCurrency(amountPaid)}</Text>
                  </View>
                  <View style={[styles.financeTotalRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.financeTotalLabel, { color: colors.text }]}>Balance Due</Text>
                    <Text style={[styles.financeTotalValue, { color: colors.text }]}>{formatCurrency(balanceDue)}</Text>
                  </View>
                </View>

                <View style={[styles.financeNote, { backgroundColor: colors.surfaceMuted, borderTopColor: colors.border }]}>
                  <MaterialIcons name="info" size={14} color={colors.subtle} />
                  <Text style={[styles.financeNoteText, { color: colors.subtle }]}>
                    {nextPendingMilestone
                      ? `Next payment of ${formatCurrency(nextPendingMilestone.amount)} due upon ${nextPendingMilestone.label.toLowerCase()}.`
                      : 'All recorded payments have been completed.'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Documents</Text>
              <View style={styles.documentsGrid}>
                <Pressable
                  style={[styles.docCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {
                    if (!quotation) {
                      showToast({
                        type: 'error',
                        title: 'Quotation unavailable',
                        message: 'No quotation document is linked to this order.',
                      });
                      return;
                    }

                    void (async () => {
                      const file = await fetchQuotationDownload(quotation.id);
                      await openDownload(file.downloadUrl, file.fileName);
                    })();
                  }}>
                  <MaterialIcons name="description" size={22} color={colors.subtle} style={styles.docIcon} />
                  <Text style={[styles.docTitle, { color: colors.text }]}>Final Quotation</Text>
                  <Text style={[styles.docMeta, { color: colors.subtle }]}>
                    {quotation ? quotation.id.toUpperCase() : 'Not linked'}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.docCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {
                    if (!invoice) {
                      showToast({
                        type: 'error',
                        title: 'Invoice unavailable',
                        message: 'No invoice data is available for this order.',
                      });
                      return;
                    }

                    void openDownload(invoice.downloadUrl, invoice.invoiceId);
                  }}>
                  <MaterialIcons name="receipt-long" size={22} color={colors.subtle} style={styles.docIcon} />
                  <Text style={[styles.docTitle, { color: colors.text }]}>Invoice Summary</Text>
                  <Text style={[styles.docMeta, { color: colors.subtle }]}>
                    {invoice ? invoice.invoiceId : 'Not generated'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  errorCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '700',
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  heroHead: {
    marginBottom: 12,
  },
  heroLeft: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  heroTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  heroStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressSection: {
    gap: 8,
    marginBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
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
  progressMeta: {
    fontSize: 11,
    fontWeight: '500',
  },
  primaryButton: {
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  sectionBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardList: {
    gap: 8,
  },
  rowCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowDetail: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '400',
  },
  rowStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  financeCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  financeRows: {
    padding: 14,
    gap: 10,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financeLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  financeValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  financePaid: {
    fontSize: 15,
    fontWeight: '600',
  },
  financeTotalRow: {
    marginTop: 2,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financeTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  financeTotalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  financeNote: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  financeNoteText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  documentsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  docCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIcon: {
    marginBottom: 6,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  docMeta: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '500',
  },
});
