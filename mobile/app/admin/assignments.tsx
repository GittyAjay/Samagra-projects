import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { useToast } from '@/components/providers/toast-provider';
import {
  assignLeadToStaff,
  assignOrderToStaff,
  autoAssignLead,
  autoAssignOrder,
  fetchAllLeads,
  fetchAllOrders,
  fetchStaffWorkload,
  patchLead,
} from '@/lib/api';
import { leadRefLabel, orderJobLabel } from '@/lib/order-display';
import { useSolarTheme } from '@/constants/solar-theme';
import { LEAD_TASK_TYPES, type ApiLead, type ApiOrder, type LeadTaskType, type StaffWorkloadEntry } from '@/types/api';

type Segment = 'leads' | 'orders';

type PickerTarget =
  | { kind: 'lead'; id: string; title: string; taskType: LeadTaskType }
  | { kind: 'order'; id: string; title: string; taskType: LeadTaskType };

function leadStatusLabel(status: ApiLead['status']) {
  return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function orderStatusLabel(status: ApiOrder['status']) {
  return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeLeadTask(lead: ApiLead): LeadTaskType {
  return lead.taskType ?? 'general';
}

function orderRoutingTaskType(status: ApiOrder['status']): LeadTaskType {
  if (status === 'installation_scheduled' || status === 'installation_in_progress') {
    return 'installation';
  }
  return 'sales';
}

function suggestedStaffId(workload: StaffWorkloadEntry[], taskType: LeadTaskType): string | null {
  if (!workload.length) {
    return null;
  }
  const eligible = workload.filter(
    (w) => w.taskTypes.length === 0 || w.taskTypes.includes(taskType)
  );
  const pool = eligible.length ? eligible : workload;
  return pool.reduce((a, b) => (a.totalLoad <= b.totalLoad ? a : b)).id;
}

export default function AdminAssignmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useSolarTheme();
  const { showToast } = useToast();
  const { user } = useSession();

  const [segment, setSegment] = useState<Segment>('leads');
  const [workload, setWorkload] = useState<StaffWorkloadEntry[]>([]);
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [picker, setPicker] = useState<PickerTarget | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [autoId, setAutoId] = useState<string | null>(null);
  const [taskPatchId, setTaskPatchId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      const [wl, leadList, orderList] = await Promise.all([
        fetchStaffWorkload(user),
        fetchAllLeads(),
        fetchAllOrders(),
      ]);
      setWorkload(wl.staff);
      setLeads(leadList);
      setOrders(orderList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadAll();
    }, [loadAll])
  );

  function staffLabel(id: string | undefined) {
    if (!id) {
      return 'Unassigned';
    }
    const s = workload.find((x) => x.id === id);
    return s ? s.fullName : id;
  }

  async function confirmAssign(member: StaffWorkloadEntry) {
    if (!user || !picker) {
      return;
    }

    const key = `${picker.kind}-${picker.id}`;
    try {
      setAssigningId(key);
      if (picker.kind === 'lead') {
        const updated = await assignLeadToStaff(user, picker.id, member.id);
        setLeads((prev) => prev.map((l) => (l.id === picker.id ? updated : l)));
        showToast({
          type: 'success',
          title: 'Lead assigned',
          message: `${picker.title} → ${member.fullName}`,
        });
      } else {
        const updatedOrder = await assignOrderToStaff(user, picker.id, member.id);
        setOrders((prev) => prev.map((o) => (o.id === picker.id ? updatedOrder : o)));
        showToast({
          type: 'success',
          title: 'Order assigned',
          message: `${picker.title} → ${member.fullName}`,
        });
      }
      setPicker(null);
      void loadAll();
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Assignment failed',
        message: e instanceof Error ? e.message : 'Try again',
      });
    } finally {
      setAssigningId(null);
    }
  }

  async function runAutoAssignLead(lead: ApiLead) {
    if (!user) {
      return;
    }
    try {
      setAutoId(lead.id);
      const result = await autoAssignLead(user, lead.id);
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? result.lead : l)));
      showToast({
        type: 'success',
        title: `Auto-assigned → ${result.assignment.staffName}`,
        message: result.assignment.reason,
      });
      void loadAll();
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Auto-assign failed',
        message: e instanceof Error ? e.message : 'Try again',
      });
    } finally {
      setAutoId(null);
    }
  }

  async function runAutoAssignOrder(order: ApiOrder) {
    if (!user) {
      return;
    }
    try {
      setAutoId(order.id);
      const result = await autoAssignOrder(user, order.id);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? result.order : o)));
      showToast({
        type: 'success',
        title: `Auto-assigned → ${result.assignment.staffName}`,
        message: result.assignment.reason,
      });
      void loadAll();
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Auto-assign failed',
        message: e instanceof Error ? e.message : 'Try again',
      });
    } finally {
      setAutoId(null);
    }
  }

  async function setLeadTaskType(lead: ApiLead, taskType: LeadTaskType) {
    if (!user) {
      return;
    }
    try {
      setTaskPatchId(lead.id);
      const updated = await patchLead(user, lead.id, { taskType });
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? updated : l)));
      showToast({
        type: 'success',
        title: 'Task type updated',
        message: `Lead routed as “${taskType}” for auto-assign.`,
      });
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Update failed',
        message: e instanceof Error ? e.message : 'Try again',
      });
    } finally {
      setTaskPatchId(null);
    }
  }

  const suggestedInModal =
    picker && workload.length
      ? suggestedStaffId(workload, picker.taskType)
      : null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.text }]}>Assign tasks</Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      <View style={[styles.segmentRow, { backgroundColor: colors.surfaceAlt }]}>
        {(['leads', 'orders'] as const).map((key) => {
          const active = segment === key;
          return (
            <Pressable
              key={key}
              onPress={() => setSegment(key)}
              style={[
                styles.segmentChip,
                {
                  backgroundColor: active ? colors.primarySoft : 'transparent',
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  color: active ? colors.primary : colors.muted,
                }}>
                {key === 'leads' ? 'Leads' : 'Orders'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
          {error ? (
            <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
            </View>
          ) : null}

          <Text style={[styles.sectionHead, { color: colors.text }]}>Staff workload</Text>
          <Text style={[styles.hint, { color: colors.muted }]}>
            Same rules run on the server when new inquiries are created and on a cron sweep for unassigned
            leads. Here you can override, pick manually, or trigger auto-assign on demand.
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.workloadRow}>
            {workload.map((w) => (
              <View
                key={w.id}
                style={[styles.workloadCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.wlName, { color: colors.text }]} numberOfLines={1}>
                  {w.fullName}
                </Text>
                {w.designation ? (
                  <Text style={[styles.wlDes, { color: colors.primary }]} numberOfLines={1}>
                    {w.designation}
                  </Text>
                ) : null}
                <Text style={[styles.wlStats, { color: colors.muted }]}>
                  {w.openLeads} leads · {w.activeOrders} orders
                </Text>
                <Text style={[styles.wlTags, { color: colors.subtle }]}>
                  {w.taskTypes.length ? w.taskTypes.join(' · ') : 'All task types'}
                </Text>
              </View>
            ))}
          </ScrollView>

          <Text style={[styles.hint, { color: colors.muted, marginTop: 8 }]}>
            {workload.length === 0
              ? 'Add staff from Hub → Add team member (set task tags for smarter routing).'
              : null}
          </Text>

          {segment === 'leads'
            ? leads.map((lead) => {
                const tt = normalizeLeadTask(lead);
                const busyAuto = autoId === lead.id;
                const busyTask = taskPatchId === lead.id;
                return (
                  <View
                    key={lead.id}
                    style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.cardTop}>
                      <View style={styles.cardIdCol}>
                        <Text style={[styles.cardIdPrimary, { color: colors.primary }]}>{leadRefLabel(lead.id)}</Text>
                        <Text
                          style={[styles.cardIdInternal, { color: colors.subtle }]}
                          numberOfLines={1}
                          ellipsizeMode="middle">
                          {lead.id}
                        </Text>
                      </View>
                      <Text style={[styles.cardStatus, { color: colors.text }]}>
                        {leadStatusLabel(lead.status)}
                      </Text>
                    </View>
                    <Text style={[styles.cardMeta, { color: colors.muted }]} numberOfLines={2}>
                      {lead.address}
                    </Text>
                    <Text style={[styles.assignee, { color: colors.text }]}>
                      Owner: {staffLabel(lead.assignedStaffId)}
                    </Text>

                    <Text style={[styles.taskLabel, { color: colors.subtle }]}>Lead task (routing)</Text>
                    <View style={styles.taskChipRow}>
                      {LEAD_TASK_TYPES.map((t) => {
                        const on = tt === t;
                        return (
                          <Pressable
                            key={t}
                            disabled={busyTask}
                            onPress={() => void setLeadTaskType(lead, t)}
                            style={[
                              styles.taskChip,
                              {
                                backgroundColor: on ? colors.primarySoft : colors.surfaceAlt,
                                borderColor: on ? colors.primary : colors.border,
                              },
                            ]}>
                            {busyTask ? (
                              <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: '800',
                                  color: on ? colors.primary : colors.muted,
                                  textTransform: 'capitalize',
                                }}>
                                {t}
                              </Text>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>

                    <View style={styles.btnRow}>
                      <Pressable
                        disabled={busyAuto}
                        onPress={() => void runAutoAssignLead(lead)}
                        style={[styles.autoBtn, { backgroundColor: colors.darkPanel }]}>
                        {busyAuto ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <MaterialIcons name="bolt" size={18} color={colors.primary} />
                            <Text style={[styles.autoBtnText, { color: colors.darkPanelText }]}>
                              Auto-assign
                            </Text>
                          </>
                        )}
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          setPicker({
                            kind: 'lead',
                            id: lead.id,
                            title: leadRefLabel(lead.id),
                            taskType: tt,
                          })
                        }
                        style={[styles.assignBtn, { borderColor: colors.primary }]}>
                        <MaterialIcons name="person-add-alt-1" size={18} color={colors.primary} />
                        <Text style={[styles.assignBtnText, { color: colors.primary }]}>Pick staff</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })
            : orders.map((order) => {
                const rt = orderRoutingTaskType(order.status);
                const busyAuto = autoId === order.id;
                return (
                  <View
                    key={order.id}
                    style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.cardTop}>
                      <View style={styles.cardIdCol}>
                        <Text style={[styles.cardIdPrimary, { color: colors.primary }]}>{orderJobLabel(order.id)}</Text>
                        <Text
                          style={[styles.cardIdInternal, { color: colors.subtle }]}
                          numberOfLines={1}
                          ellipsizeMode="middle">
                          {order.id}
                        </Text>
                      </View>
                      <Text style={[styles.cardStatus, { color: colors.text }]}>
                        {orderStatusLabel(order.status)}
                      </Text>
                    </View>
                    <Text style={[styles.cardMeta, { color: colors.muted }]}>
                      Client {order.clientId} · route as{' '}
                      <Text style={{ fontWeight: '800', color: colors.primary }}>{rt}</Text>
                    </Text>
                    <Text style={[styles.assignee, { color: colors.text }]}>
                      Coordinator: {staffLabel(order.staffId)}
                    </Text>
                    <View style={styles.btnRow}>
                      <Pressable
                        disabled={busyAuto}
                        onPress={() => void runAutoAssignOrder(order)}
                        style={[styles.autoBtn, { backgroundColor: colors.darkPanel }]}>
                        {busyAuto ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <MaterialIcons name="bolt" size={18} color={colors.primary} />
                            <Text style={[styles.autoBtnText, { color: colors.darkPanelText }]}>
                              Auto-assign
                            </Text>
                          </>
                        )}
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          setPicker({
                            kind: 'order',
                            id: order.id,
                            title: orderJobLabel(order.id),
                            taskType: rt,
                          })
                        }
                        style={[styles.assignBtn, { borderColor: colors.primary }]}>
                        <MaterialIcons name="engineering" size={18} color={colors.primary} />
                        <Text style={[styles.assignBtnText, { color: colors.primary }]}>Pick staff</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
        </ScrollView>
      )}

      <Modal visible={picker !== null} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setPicker(null)}>
          <Pressable
            style={[styles.modalSheet, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Assign to…</Text>
            <Text style={[styles.modalSub, { color: colors.muted }]} numberOfLines={2}>
              {picker?.title} · task {picker?.taskType}
            </Text>
            <FlatList
              data={workload}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
              renderItem={({ item }) => {
                const busy = assigningId === `${picker?.kind}-${picker?.id}`;
                const isSuggested = suggestedInModal === item.id;
                return (
                  <Pressable
                    disabled={busy}
                    onPress={() => void confirmAssign(item)}
                    style={[styles.staffRow, { borderBottomColor: colors.border }]}>
                    <View style={[styles.staffAvatar, { backgroundColor: colors.primarySoft }]}>
                      <Text style={[styles.staffInitial, { color: colors.primary }]}>
                        {item.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.staffCopy}>
                      <View style={styles.nameRow}>
                        <Text style={[styles.staffName, { color: colors.text }]}>{item.fullName}</Text>
                        {isSuggested ? (
                          <View style={[styles.suggestedPill, { backgroundColor: colors.primarySoft }]}>
                            <Text style={[styles.suggestedText, { color: colors.primary }]}>Suggested</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={[styles.staffEmail, { color: colors.muted }]}>{item.email}</Text>
                      <Text style={[styles.wlMini, { color: colors.subtle }]}>
                        {item.openLeads} open leads · {item.activeOrders} active orders
                      </Text>
                      {item.designation ? (
                        <Text style={[styles.staffRole, { color: colors.primary }]}>{item.designation}</Text>
                      ) : null}
                      {item.taskTypes.length ? (
                        <Text style={[styles.staffTags, { color: colors.muted }]}>
                          Tags: {item.taskTypes.join(', ')}
                        </Text>
                      ) : (
                        <Text style={[styles.staffTags, { color: colors.muted }]}>Tags: all</Text>
                      )}
                    </View>
                    {busy ? <ActivityIndicator color={colors.primary} /> : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={[styles.emptyStaff, { color: colors.muted }]}>
                  No staff accounts yet. Create one from Hub → Add team member.
                </Text>
              }
            />
            <Pressable
              onPress={() => setPicker(null)}
              style={[styles.cancelModal, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.cancelModalText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: { width: 40 },
  topTitle: { fontSize: 17, fontWeight: '800' },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    padding: 6,
    borderRadius: 14,
  },
  segmentChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionHead: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  hint: { fontSize: 13, lineHeight: 19, marginBottom: 8 },
  workloadRow: { gap: 10, paddingVertical: 4 },
  workloadCard: {
    width: 160,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginRight: 4,
  },
  wlName: { fontSize: 14, fontWeight: '800' },
  wlDes: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  wlStats: { fontSize: 12, marginTop: 6 },
  wlTags: { fontSize: 10, marginTop: 4 },
  errorCard: { borderRadius: 14, borderWidth: 1, padding: 12 },
  errorText: { fontSize: 13, fontWeight: '600' },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardIdCol: { flex: 1, minWidth: 0 },
  cardIdPrimary: { fontSize: 14, fontWeight: '900' },
  cardIdInternal: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  cardStatus: { fontSize: 13, fontWeight: '700' },
  cardMeta: { fontSize: 12, lineHeight: 17 },
  assignee: { fontSize: 13, fontWeight: '600' },
  taskLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  taskChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  taskChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 88,
    alignItems: 'center',
  },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  autoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  autoBtnText: { fontSize: 12, fontWeight: '800' },
  assignBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  assignBtnText: { fontSize: 12, fontWeight: '800' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '72%',
  },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSub: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  staffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffInitial: { fontSize: 18, fontWeight: '800' },
  staffCopy: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  staffName: { fontSize: 16, fontWeight: '700' },
  suggestedPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  suggestedText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  staffEmail: { fontSize: 12, marginTop: 2 },
  wlMini: { fontSize: 11, marginTop: 4 },
  staffRole: { fontSize: 11, fontWeight: '800', marginTop: 4, textTransform: 'uppercase' },
  staffTags: { fontSize: 11, marginTop: 2 },
  emptyStaff: { paddingVertical: 24, textAlign: 'center', fontSize: 14 },
  cancelModal: {
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelModalText: { fontSize: 15, fontWeight: '700' },
});
