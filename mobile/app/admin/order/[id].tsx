import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
import { fetchOrder, patchOrderStatus } from '@/lib/api';
import { orderJobLabel } from '@/lib/order-display';
import { useSolarTheme } from '@/constants/solar-theme';
import { ORDER_STATUS_PIPELINE, type ApiOrder, type OrderStatus } from '@/types/api';

function formatStatus(status: OrderStatus) {
  return status.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminOrderManageScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useSolarTheme();
  const { user } = useSession();
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedNext, setSelectedNext] = useState<OrderStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const load = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      setLoadError('Missing order');
      setIsLoading(false);
      return;
    }
    try {
      setLoadError('');
      setIsLoading(true);
      const o = await fetchOrder(id);
      setOrder(o);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load order');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const currentIndex = useMemo(() => {
    if (!order) {
      return -1;
    }
    return ORDER_STATUS_PIPELINE.indexOf(order.status);
  }, [order]);

  const isTerminal = order?.status === 'installation_completed';

  const openStatusModal = () => {
    setSelectedNext(null);
    setStatusNote('');
    setStatusModalOpen(true);
  };

  const applyStatus = async () => {
    if (!user || !order || !selectedNext) {
      return;
    }
    try {
      setIsSavingStatus(true);
      const updated = await patchOrderStatus(user, order.id, {
        status: selectedNext,
        note: statusNote.trim() || undefined,
      });
      setOrder(updated);
      setStatusModalOpen(false);
      setSelectedNext(null);
      setStatusNote('');
      showToast({
        type: 'success',
        title: 'Status updated',
        message: formatStatus(selectedNext),
      });
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Update failed',
        message: e instanceof Error ? e.message : 'Try again.',
      });
    } finally {
      setIsSavingStatus(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} style={styles.headerIcon} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Installation</Text>
          <Pressable
            onPress={() => order && router.push(`/order/${order.id}/track`)}
            style={styles.headerIcon}
            hitSlop={10}
            disabled={!order}>
            <MaterialIcons name="map" size={22} color={order ? colors.primary : colors.subtle} />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : loadError || !order ? (
          <View style={styles.centered}>
            <Text style={[styles.err, { color: colors.danger }]}>{loadError || 'Order not found'}</Text>
            <Pressable onPress={() => void load()} style={[styles.retry, { backgroundColor: colors.primary }]}>
              <Text style={styles.retryTxt}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + (isTerminal ? 24 : 100) }]}>
              <View style={[styles.orderHero, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}>
                <MaterialIcons name="solar-power" size={32} color={colors.primary} />
                <View style={styles.heroText}>
                  <Text style={[styles.orderPrimary, { color: colors.text }]}>{orderJobLabel(order.id)}</Text>
                  <Text style={[styles.orderStatus, { color: colors.primary }]}>{formatStatus(order.status)}</Text>
                  <Text
                    style={[styles.orderInternalId, { color: colors.subtle }]}
                    numberOfLines={1}
                    ellipsizeMode="middle">
                    {order.id}
                  </Text>
                </View>
              </View>

              {order.installationTeam ? (
                <Text style={[styles.metaLine, { color: colors.muted }]}>
                  Team: {order.installationTeam}
                  {order.installationDate
                    ? ` · Install ${new Date(order.installationDate).toLocaleDateString('en-IN')}`
                    : ''}
                </Text>
              ) : order.installationDate ? (
                <Text style={[styles.metaLine, { color: colors.muted }]}>
                  Target: {new Date(order.installationDate).toLocaleDateString('en-IN')}
                </Text>
              ) : null}

              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Installation pipeline</Text>
              <View style={[styles.pipelineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {ORDER_STATUS_PIPELINE.map((step, index) => {
                  const done = currentIndex > index;
                  const current = currentIndex === index;
                  const upcoming = currentIndex < index;
                  return (
                    <View key={step} style={styles.pipeRow}>
                      <View style={styles.pipeRail}>
                        <View
                          style={[
                            styles.pipeDot,
                            done && { backgroundColor: colors.primary, borderColor: colors.primary },
                            current && {
                              backgroundColor: colors.primarySoft,
                              borderColor: colors.primary,
                              borderWidth: 2,
                            },
                            upcoming && { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
                          ]}
                        />
                        {index < ORDER_STATUS_PIPELINE.length - 1 ? (
                          <View
                            style={[
                              styles.pipeLine,
                              { backgroundColor: done ? colors.primary : colors.border },
                            ]}
                          />
                        ) : null}
                      </View>
                      <View style={styles.pipeCopy}>
                        <Text
                          style={[
                            styles.pipeLabel,
                            {
                              color: current ? colors.primary : colors.text,
                              fontWeight: current ? '800' : '600',
                            },
                          ]}>
                          {formatStatus(step)}
                        </Text>
                        {current ? (
                          <Text style={[styles.pipeSub, { color: colors.subtle }]}>Current stage</Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>

              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Activity log</Text>
              <View style={[styles.logCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {[...order.statusHistory].reverse().map((entry, i) => (
                  <View
                    key={`${entry.updatedAt}-${i}`}
                    style={[
                      styles.logRow,
                      i < order.statusHistory.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                    ]}>
                    <View style={[styles.logDot, { backgroundColor: colors.primary }]} />
                    <View style={styles.logBody}>
                      <Text style={[styles.logStatus, { color: colors.text }]}>{formatStatus(entry.status)}</Text>
                      <Text style={[styles.logTime, { color: colors.subtle }]}>{formatWhen(entry.updatedAt)}</Text>
                      {entry.note ? (
                        <Text style={[styles.logNote, { color: colors.muted }]}>{entry.note}</Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {!isTerminal ? (
              <View
                style={[
                  styles.footer,
                  {
                    backgroundColor: `${colors.background}F2`,
                    borderTopColor: colors.border,
                    bottom: tabBarHeight,
                    paddingBottom: 12,
                  },
                ]}>
                <Pressable
                  onPress={openStatusModal}
                  style={({ pressed }) => [
                    styles.footerBtn,
                    { backgroundColor: colors.primary, opacity: pressed ? 0.92 : 1 },
                  ]}>
                  <MaterialIcons name="published-with-changes" size={22} color={colors.onPrimary} />
                  <Text style={styles.footerBtnText}>Update status</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        )}
      </KeyboardAvoidingView>

      <Modal visible={statusModalOpen} animationType="slide" transparent onRequestClose={() => setStatusModalOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setStatusModalOpen(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}>
            <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Set installation status</Text>
              <Text style={[styles.modalSub, { color: colors.subtle }]}>
                Choose the stage that matches the field team&apos;s progress.
              </Text>
              <ScrollView style={styles.statusList} keyboardShouldPersistTaps="handled">
                {ORDER_STATUS_PIPELINE.map((s) => {
                  const active = selectedNext === s;
                  const isCurrent = order?.status === s;
                  return (
                    <Pressable
                      key={s}
                      onPress={() => setSelectedNext(s)}
                      style={[
                        styles.statusRow,
                        { borderColor: colors.border },
                        active && { backgroundColor: colors.primarySoft, borderColor: colors.primary },
                      ]}>
                      <Text style={[styles.statusRowText, { color: colors.text }]}>{formatStatus(s)}</Text>
                      {isCurrent ? (
                        <View style={[styles.nowPill, { backgroundColor: colors.primarySoft }]}>
                          <Text style={[styles.nowPillText, { color: colors.primary }]}>Now</Text>
                        </View>
                      ) : null}
                      {active ? <MaterialIcons name="check-circle" color={colors.primary} size={22} /> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Text style={[styles.noteLabel, { color: colors.muted }]}>Note (optional)</Text>
              <TextInput
                value={statusNote}
                onChangeText={setStatusNote}
                placeholder="e.g. Panels delivered, install Monday 9am"
                placeholderTextColor={colors.subtle}
                style={[
                  styles.noteInput,
                  { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
                ]}
              />
              <View style={styles.modalActions}>
                <Pressable onPress={() => setStatusModalOpen(false)} style={styles.modalCancel}>
                  <Text style={{ color: colors.subtle, fontWeight: '800' }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => void applyStatus()}
                  disabled={!selectedNext || isSavingStatus}
                  style={[
                    styles.modalApply,
                    { backgroundColor: colors.primary, opacity: !selectedNext || isSavingStatus ? 0.45 : 1 },
                  ]}>
                  {isSavingStatus ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <Text style={styles.modalApplyText}>Save</Text>
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
  flex: { flex: 1, maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  err: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  retry: { paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12 },
  retryTxt: { color: '#fff', fontWeight: '800' },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  orderHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  heroText: { flex: 1, minWidth: 0 },
  orderPrimary: { fontSize: 18, fontWeight: '900' },
  orderStatus: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  orderInternalId: { fontSize: 11, fontWeight: '600', marginTop: 8 },
  metaLine: { fontSize: 13, marginBottom: 18 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  pipelineCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 8,
    paddingRight: 12,
    marginBottom: 22,
  },
  pipeRow: { flexDirection: 'row', minHeight: 52 },
  pipeRail: { width: 36, alignItems: 'center' },
  pipeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 6,
  },
  pipeLine: { width: 3, flex: 1, marginTop: 4, minHeight: 28, borderRadius: 2 },
  pipeCopy: { flex: 1, paddingBottom: 8, paddingTop: 4 },
  pipeLabel: { fontSize: 15 },
  pipeSub: { fontSize: 12, marginTop: 2 },
  logCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  logRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  logDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  logBody: { flex: 1 },
  logStatus: { fontSize: 15, fontWeight: '800' },
  logTime: { fontSize: 12, marginTop: 4 },
  logNote: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  footerBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalKeyboard: { width: '100%' },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 28,
    maxHeight: '88%',
  },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  modalSub: { fontSize: 13, marginTop: 6, marginBottom: 12, lineHeight: 18 },
  statusList: { maxHeight: 280, marginBottom: 12 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  statusRowText: { flex: 1, fontSize: 15, fontWeight: '700' },
  nowPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  nowPillText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  noteLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalCancel: { paddingVertical: 12, paddingHorizontal: 8 },
  modalApply: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  modalApplyText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
