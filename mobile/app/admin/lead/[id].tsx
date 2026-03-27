import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { useToast } from '@/components/providers/toast-provider';
import { autoAssignLead, fetchLead, fetchQuotations, patchLead } from '@/lib/api';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ApiLead, ApiQuotation, LeadStatus } from '@/types/api';

const clientPortrait =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzSaUR2YaHu973OL_ig6D19tIfkP_oSOjRarZMayp0Jwj7Xsw8HmekmfinAXaspUr4bNF__d9nw1pa6Tx-7c0z3mCxdo2qm_7X9rj3ELPxtMrNcAiHwuyJwcjPCMfBwoDiELU7mrRWyNNoWo-JQGn6xdt3DBQrXhSxsYfd8gJJeduW5jHg7iA62qtRQzGe4_UjMa0KprJjBYCHCnaJ3OS3VJO6F4ZRRW8H5Y8o2WgI3da8JSvcroDn-5JifzcjY_Lc1_ro_iX_xRqv';

function shortLocation(address: string) {
  const parts = address
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
  }
  return address.length > 48 ? `${address.slice(0, 46)}…` : address;
}

function customerIdLabel(clientId: string) {
  const digits = clientId.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `#${digits.slice(-4)}`;
  }
  return `#${clientId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '----'}`;
}

function formatBillInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function showPriorityPill(status: LeadStatus) {
  return (
    status === 'new' ||
    status === 'contacted' ||
    status === 'survey_completed' ||
    status === 'quotation_sent'
  );
}

function statusHeadline(status: LeadStatus): string {
  if (showPriorityPill(status)) {
    return 'Status: Action Required';
  }
  if (status === 'survey_scheduled') {
    return 'Status: Survey Scheduled';
  }
  const label = status.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return `Status: ${label}`;
}

function statusSubtext(status: LeadStatus): string {
  switch (status) {
    case 'new':
      return 'Review the inquiry and contact the client.';
    case 'contacted':
      return 'Follow up with the client as discussed.';
    case 'survey_scheduled':
      return 'Site survey is on the calendar — confirm details with the client.';
    case 'survey_completed':
      return 'Follow up with the client to prepare and share a quotation.';
    case 'quotation_sent':
      return 'Follow up on the quotation and address any questions.';
    case 'won':
      return 'This lead has been converted successfully.';
    case 'lost':
      return 'This lead is closed.';
    default:
      return 'Review next steps for this lead.';
  }
}

function statusBannerStyle(status: LeadStatus) {
  if (status === 'won') {
    return {
      borderColor: 'rgba(46, 204, 113, 0.18)',
      backgroundColor: 'rgba(46, 204, 113, 0.1)',
      icon: 'check-circle' as const,
      iconColor: '#2ecc71',
    };
  }
  if (status === 'lost') {
    return {
      borderColor: 'rgba(100, 116, 139, 0.25)',
      backgroundColor: 'rgba(100, 116, 139, 0.08)',
      icon: 'block' as const,
      iconColor: '#64748b',
    };
  }
  if (status === 'survey_scheduled') {
    return {
      borderColor: 'rgba(255, 140, 0, 0.18)',
      backgroundColor: 'rgba(255, 140, 0, 0.1)',
      icon: 'event' as const,
      iconColor: '#FF8C00',
    };
  }
  if (showPriorityPill(status)) {
    return {
      borderColor: 'rgba(255, 140, 0, 0.18)',
      backgroundColor: 'rgba(255, 140, 0, 0.1)',
      icon: 'error-outline' as const,
      iconColor: '#d97706',
    };
  }
  return {
    borderColor: 'rgba(255, 140, 0, 0.18)',
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
    icon: 'info-outline' as const,
    iconColor: '#FF8C00',
  };
}

export default function AdminLeadDetailScreen() {
  const router = useRouter();
  const colors = useSolarTheme();
  const { user } = useSession();
  const { showToast } = useToast();
  const { id, clientName: clientNameParam } = useLocalSearchParams<{
    id: string;
    clientName?: string;
  }>();

  const [lead, setLead] = useState<ApiLead | null>(null);
  const [latestQuotation, setLatestQuotation] = useState<ApiQuotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const load = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      return;
    }
    try {
      setError('');
      setIsLoading(true);
      const [row, quotations] = await Promise.all([
        fetchLead(id),
        fetchQuotations({ leadId: id }).catch(() => [] as ApiQuotation[]),
      ]);
      const sortedQuotations = quotations
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      const latest = sortedQuotations[0] ?? null;
      const inferredStatus =
        latest && row.status !== 'won' && row.status !== 'lost' ? 'quotation_sent' : row.status;
      setLead(
        inferredStatus === row.status
          ? row
          : {
              ...row,
              status: inferredStatus,
            }
      );
      setLatestQuotation(latest);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load lead');
      setLead(null);
      setLatestQuotation(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const displayName = useMemo(() => {
    if (clientNameParam && String(clientNameParam).trim()) {
      return String(clientNameParam);
    }
    if (lead) {
      return `Client ${lead.clientId.slice(-6)}`;
    }
    return 'Lead';
  }, [clientNameParam, lead]);

  const locationLine = lead ? shortLocation(lead.address) : '';
  const banner = lead ? statusBannerStyle(lead.status) : null;
  const priority = lead && showPriorityPill(lead.status);
  const accent = colors.primary;
  const accentSoft = colors.primarySoft;
  const accentGlow = colors.border;
  const quotationCreatePath = user?.role === 'staff' ? '/staff/quotation/create' : '/admin/quotation/create';
  const quotationDetailPath = user?.role === 'staff' ? '/staff/quotation/[id]' : '/admin/quotation/[id]';

  const openMoreMenu = () => {
    if (!user || !lead) {
      return;
    }
    Alert.alert('Lead options', undefined, [
      {
        text: 'Auto-assign staff',
        onPress: () => {
          void (async () => {
            try {
              const result = await autoAssignLead(user, lead.id);
              setLead(result.lead);
              showToast({
                type: 'success',
                title: 'Assigned',
                message: `${result.assignment.staffName} owns this lead.`,
              });
            } catch (e) {
              showToast({
                type: 'error',
                title: 'Could not assign',
                message: e instanceof Error ? e.message : 'Try again',
              });
            }
          })();
        },
      },
      {
        text: 'Refresh',
        onPress: () => void load(),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const saveNote = async () => {
    if (!user || !lead || !noteDraft.trim()) {
      return;
    }
    try {
      setIsSavingNote(true);
      const nextNotes = [...(lead.internalNotes ?? []), noteDraft.trim()];
      const updated = await patchLead(user, lead.id, { internalNotes: nextNotes });
      setLead(updated);
      setNoteModalOpen(false);
      setNoteDraft('');
      showToast({ type: 'success', title: 'Note added', message: 'Saved to this lead.' });
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Save failed',
        message: e instanceof Error ? e.message : 'Try again',
      });
    } finally {
      setIsSavingNote(false);
    }
  };

  async function openDeviceUrl(url: string, failureTitle: string) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        showToast({
          type: 'error',
          title: failureTitle,
          message: 'This action is not available on the current device.',
        });
        return;
      }
      await Linking.openURL(url);
    } catch {
      showToast({
        type: 'error',
        title: failureTitle,
        message: 'This action is not available on the current device.',
      });
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.topBar, { borderBottomColor: accentGlow }]}>
        <Pressable onPress={() => router.back()} style={styles.topIcon} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={24} color={accent} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.text }]}>Lead Details</Text>
        <Pressable onPress={openMoreMenu} style={styles.topIcon} hitSlop={10} disabled={!lead}>
          <MaterialIcons name="more-vert" size={24} color={accent} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={accent} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
          <Pressable onPress={() => void load()} style={[styles.retry, { backgroundColor: accent }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : lead ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled">
            <View style={styles.heroRow}>
              <View style={[styles.avatarRing, { borderColor: accentGlow }]}>
                <Image source={{ uri: clientPortrait }} style={styles.avatar} contentFit="cover" />
              </View>
              <View style={styles.heroCopy}>
                <Text style={[styles.heroName, { color: colors.text }]}>{displayName}</Text>
                <View style={styles.heroLocationRow}>
                  <MaterialIcons name="location-on" size={16} color={accent} />
                  <Text style={[styles.heroLocation, { color: accent }]} numberOfLines={2}>
                    {locationLine}
                  </Text>
                </View>
                <Text style={[styles.customerId, { color: colors.subtle }]}>
                  Customer ID: {customerIdLabel(lead.clientId)}
                </Text>
              </View>
            </View>

            {banner ? (
              <View style={[styles.statusCard, { borderColor: banner.borderColor, backgroundColor: banner.backgroundColor }]}>
                <View style={styles.statusCardLeft}>
                  <View style={styles.statusTitleRow}>
                    <MaterialIcons name={banner.icon} size={22} color={banner.iconColor} />
                    <Text style={[styles.statusTitle, { color: colors.text }]}>{statusHeadline(lead.status)}</Text>
                  </View>
                  <Text style={[styles.statusSub, { color: colors.muted }]}>{statusSubtext(lead.status)}</Text>
                </View>
                {priority ? (
                  <View style={styles.priorityPill}>
                    <Text style={styles.priorityPillText}>Priority</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Requirements</Text>
            <View style={styles.reqList}>
              <View style={[styles.reqRow, { backgroundColor: colors.surface, borderColor: accentGlow }]}>
                <View style={styles.reqLeft}>
                  <MaterialIcons name="payments" size={22} color={accent} />
                  <Text style={[styles.reqLabel, { color: colors.subtle }]}>Monthly Bill</Text>
                </View>
                <Text style={[styles.reqValue, { color: colors.text }]}>{formatBillInr(lead.monthlyElectricityBill)}</Text>
              </View>
              <View style={[styles.reqRow, { backgroundColor: colors.surface, borderColor: accentGlow }]}>
                <View style={styles.reqLeft}>
                  <MaterialIcons name="bolt" size={22} color={accent} />
                  <Text style={[styles.reqLabel, { color: colors.subtle }]}>Load</Text>
                </View>
                <Text style={[styles.reqValue, { color: colors.text }]}>{lead.requiredLoadKw}kW</Text>
              </View>
              <View style={[styles.reqRow, { backgroundColor: colors.surface, borderColor: accentGlow }]}>
                <View style={styles.reqLeft}>
                  <MaterialIcons name="roofing" size={22} color={accent} />
                  <Text style={[styles.reqLabel, { color: colors.subtle }]}>Roof Type</Text>
                </View>
                <Text style={[styles.reqValue, { color: colors.text }]}>{lead.roofType}</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>Quick Actions</Text>
            <View style={styles.quickGrid}>
              <Pressable
                onPress={() =>
                  void openDeviceUrl(`tel:${lead.phone.replace(/\s/g, '')}`, 'Cannot make call')
                }
                style={({ pressed }) => [
                  styles.quickTile,
                  { backgroundColor: colors.surface, borderColor: accentGlow },
                  pressed && styles.quickTilePressed,
                ]}>
                <View style={[styles.quickIconCircle, { backgroundColor: accentSoft }]}>
                  <MaterialIcons name="call" size={24} color={accent} />
                </View>
                <Text style={[styles.quickLabel, { color: colors.text }]}>Call Client</Text>
              </Pressable>
              <Pressable
                onPress={() => setNoteModalOpen(true)}
                style={({ pressed }) => [
                  styles.quickTile,
                  { backgroundColor: colors.surface, borderColor: accentGlow },
                  pressed && styles.quickTilePressed,
                ]}>
                <View style={[styles.quickIconCircle, { backgroundColor: accentSoft }]}>
                  <MaterialIcons name="edit-note" size={24} color={accent} />
                </View>
                <Text style={[styles.quickLabel, { color: colors.text }]}>Add Note</Text>
              </Pressable>
            </View>

            <View style={styles.bottomActions}>
              <Pressable
                onPress={() => {
                  if (latestQuotation) {
                    router.push({
                      pathname: quotationDetailPath,
                      params: { id: latestQuotation.id },
                    });
                    return;
                  }

                  router.push({
                    pathname: quotationCreatePath,
                    params: { leadId: lead.id },
                  });
                }}
                style={[styles.primaryCta, { backgroundColor: accent, shadowColor: colors.shadow }]}>
                <MaterialIcons name="description" size={22} color="#fff" />
                <Text style={styles.primaryCtaText}>
                  {latestQuotation ? 'View Quotation' : 'Create Quotation'}
                </Text>
              </Pressable>
            </View>
            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      ) : null}

      <Modal
        visible={noteModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setNoteModalOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdropFill} onPress={() => setNoteModalOpen(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}>
            <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add internal note</Text>
              <TextInput
                value={noteDraft}
                onChangeText={setNoteDraft}
                placeholder="Type a note for the team…"
                placeholderTextColor={colors.subtle}
                multiline
                style={[
                  styles.noteInput,
                  { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
                ]}
              />
              <View style={styles.modalButtons}>
                <Pressable onPress={() => setNoteModalOpen(false)} style={styles.modalCancel}>
                  <Text style={{ color: colors.subtle, fontWeight: '700' }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => void saveNote()}
                  disabled={isSavingNote || !noteDraft.trim()}
                  style={[
                    styles.modalSave,
                    { backgroundColor: accent, opacity: !noteDraft.trim() || isSavingNote ? 0.5 : 1 },
                  ]}>
                  {isSavingNote ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveText}>Save</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  topIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  retry: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  heroLocation: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  customerId: {
    fontSize: 14,
    marginTop: 4,
  },
  statusCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  statusCardLeft: {
    flex: 1,
    gap: 6,
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  statusSub: {
    fontSize: 14,
    lineHeight: 20,
  },
  priorityPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignSelf: 'flex-start',
  },
  priorityPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  reqList: {
    gap: 10,
    marginBottom: 8,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  reqLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reqLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  reqValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  quickTile: {
    width: '48%',
    minWidth: 100,
    flexGrow: 1,
    maxWidth: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  quickTilePressed: {
    transform: [{ scale: 0.98 }],
  },
  quickIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomActions: {
    marginTop: 28,
    gap: 12,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryCtaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalKeyboard: {
    width: '100%',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 100,
    padding: 14,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalCancel: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalSave: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
