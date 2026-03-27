import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/providers/toast-provider';
import { DetailSkeleton } from '@/components/ui/page-skeletons';
import { fetchOrder } from '@/lib/api';
import { formatInstallDateForDisplay } from '@/lib/order-date';
import { orderJobLabel } from '@/lib/order-display';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ApiOrder } from '@/types/api';

function formatStatus(status: ApiOrder['status']) {
  return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function stepMeta(order: ApiOrder) {
  const estimate = order.installationDate
    ? formatInstallDateForDisplay(order.installationDate, 'To be scheduled')
    : 'To be scheduled';
  const bookedAt = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return [
    {
      key: 'inquiry',
      title: 'Inquiry',
      state: 'done' as const,
      stamp: `Done ${bookedAt}`,
      copy: 'Consultation and audit request received.',
      icon: 'check' as const,
    },
    {
      key: 'survey',
      title: 'Site survey',
      state: 'done' as const,
      stamp: `Done ${bookedAt}`,
      copy: 'Roof inspection and measurements finished before your order opened.',
      icon: 'check' as const,
    },
    {
      key: 'confirmed',
      title: 'Quote approved',
      state: 'done' as const,
      stamp: `Done ${bookedAt}`,
      copy: 'You approved the quote before this installation order was created.',
      icon: 'check' as const,
    },
    {
      key: 'install',
      title: 'Installation',
      state:
        order.status === 'installation_completed'
          ? ('done' as const)
          : order.status === 'installation_scheduled' || order.status === 'installation_in_progress'
            ? ('active' as const)
            : ('pending' as const),
      stamp:
        order.status === 'installation_scheduled' || order.status === 'installation_in_progress'
          ? `Active · est. ${estimate}`
          : order.status === 'installation_completed'
            ? `Done ${estimate}`
            : `Target ${estimate}`,
      copy: 'Crew assignment and access to your electrical panel when we arrive.',
      icon: 'schedule' as const,
    },
    {
      key: 'completed',
      title: 'Completed',
      state: order.status === 'installation_completed' ? ('done' as const) : ('pending' as const),
      stamp:
        order.status === 'installation_completed' ? `Done ${estimate}` : `Target ${estimate}`,
      copy: 'Final inspection and switching the system on.',
      icon: 'flag' as const,
    },
  ];
}

export default function TrackInstallationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const colors = useSolarTheme();
  const { showToast } = useToast();
  const [order, setOrder] = useState<ApiOrder | null>(null);
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

        if (isMounted) {
          setOrder(response);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load installation tracking');
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

  const steps = useMemo(() => (order ? stepMeta(order) : []), [order]);

  if (!id) {
    return <Redirect href="/orders" />;
  }

  if (!isLoading && !order && error) {
    return <Redirect href="/orders" />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>Installation</Text>
        <View style={styles.backButton} />
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
              <View style={styles.heroHeader}>
                <View style={[styles.heroIconWrap, { backgroundColor: colors.primarySoft }]}>
                  <MaterialIcons name="solar-power" size={22} color={colors.primary} />
                </View>
                <View style={styles.heroCopy}>
                  <Text style={[styles.heroEyebrow, { color: colors.muted }]}>{orderJobLabel(order.id)}</Text>
                  <Text style={[styles.heroTitle, { color: colors.text }]}>Residential solar</Text>
                </View>
              </View>

              <View style={[styles.heroMetaRow, { borderTopColor: colors.border }]}>
                <View style={styles.heroMetaCell}>
                  <Text style={[styles.heroMetaLabel, { color: colors.subtle }]}>Status</Text>
                  <Text style={[styles.heroMetaValue, { color: colors.text }]}>{formatStatus(order.status)}</Text>
                </View>
                <View style={[styles.heroMetaDivider, { backgroundColor: colors.border }]} />
                <View style={styles.heroMetaCell}>
                  <Text style={[styles.heroMetaLabel, { color: colors.subtle }]}>Install date</Text>
                  <Text style={[styles.heroMetaValue, { color: colors.text }]}>
                    {formatInstallDateForDisplay(order.installationDate)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.stepperWrap}>
              {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                const isDone = step.state === 'done';
                const isActive = step.state === 'active';

                return (
                  <View key={step.key} style={styles.stepRow}>
                    <View style={styles.stepRail}>
                      <View
                        style={[
                          styles.stepIconWrap,
                          isDone
                            ? { backgroundColor: colors.primary }
                            : isActive
                              ? { backgroundColor: colors.primarySoft, borderColor: colors.primary, borderWidth: 1 }
                              : { backgroundColor: colors.surfaceMuted },
                        ]}>
                        <MaterialIcons
                          name={step.icon}
                          size={14}
                          color={isDone ? '#ffffff' : isActive ? colors.primary : colors.subtle}
                        />
                      </View>
                      {!isLast ? (
                        <View
                          style={[
                            styles.stepLine,
                            { backgroundColor: isDone ? colors.primary : colors.border },
                          ]}
                        />
                      ) : null}
                    </View>

                    <View style={styles.stepContent}>
                      <Text
                        style={[
                          styles.stepTitle,
                          {
                            color: isActive ? colors.primary : isDone ? colors.text : colors.subtle,
                          },
                        ]}>
                        {step.title}
                      </Text>
                      <Text
                        style={[
                          styles.stepStamp,
                          {
                            color: isActive ? colors.primary : colors.muted,
                          },
                        ]}>
                        {step.stamp}
                      </Text>
                      <Text style={[styles.stepCopy, { color: colors.muted }]}>{step.copy}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.muted }]}>Before the visit</Text>

            <View style={[styles.resourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.resourceHeader}>
                <View style={styles.resourceTitleRow}>
                  <MaterialIcons name="description" size={18} color={colors.subtle} />
                  <Text style={[styles.resourceTitle, { color: colors.text }]}>Quick checklist</Text>
                </View>
              </View>
              <View style={[styles.resourceBody, { borderTopColor: colors.border }]}>
                <Text style={[styles.resourceText, { color: colors.muted }]}>
                  Before our crew arrives, please ensure:
                </Text>
                <Text style={[styles.resourceBullet, { color: colors.muted }]}>• Pets are safely secured indoors.</Text>
                <Text style={[styles.resourceBullet, { color: colors.muted }]}>• Driveway is clear for the utility van.</Text>
                <Text style={[styles.resourceBullet, { color: colors.muted }]}>• An adult is present to grant attic access.</Text>
              </View>
            </View>

            <View style={[styles.supportCard, { backgroundColor: colors.primary }]}>
              <View style={styles.supportHeader}>
                <View style={styles.supportCopy}>
                  <Text style={styles.supportTitle}>Need help?</Text>
                  <Text style={styles.supportText}>We can answer questions about your installation.</Text>
                </View>
                <MaterialIcons name="support-agent" size={32} color="rgba(255,255,255,0.45)" />
              </View>

              <View style={styles.supportActions}>
                <Pressable
                  style={[styles.supportPrimaryButton, { backgroundColor: colors.onPrimary }]}
                  onPress={() =>
                    showToast({
                      type: 'success',
                      title: 'Support call requested',
                      message: `We are arranging a callback for ${orderJobLabel(order.id)}.`,
                    })
                  }>
                  <Text style={[styles.supportPrimaryText, { color: colors.primary }]}>Call Support</Text>
                </Pressable>

                <Pressable
                  style={styles.supportSecondaryButton}
                  onPress={() => router.push('/chat')}>
                  <Text style={styles.supportSecondaryText}>Live Chat</Text>
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
  backButton: {
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
  },
  errorCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 14,
  },
  heroHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  heroTitle: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: '600',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    gap: 0,
  },
  heroMetaCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  heroMetaDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  heroMetaLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  heroMetaValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepperWrap: {
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepRail: {
    width: 26,
    alignItems: 'center',
  },
  stepIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 1.5,
    flex: 1,
    marginTop: 3,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 18,
    paddingTop: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  stepStamp: {
    marginTop: 3,
    marginBottom: 3,
    fontSize: 12,
    fontWeight: '500',
  },
  stepCopy: {
    fontSize: 12,
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  resourceCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
    overflow: 'hidden',
  },
  resourceHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resourceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  resourceBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
  },
  resourceText: {
    fontSize: 12,
    lineHeight: 17,
  },
  resourceBullet: {
    fontSize: 12,
    lineHeight: 17,
  },
  supportCard: {
    borderRadius: 14,
    padding: 14,
    marginTop: 2,
  },
  supportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  supportCopy: {
    flex: 1,
  },
  supportTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  supportText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  supportActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  supportPrimaryButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  supportSecondaryButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.36)',
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportSecondaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
